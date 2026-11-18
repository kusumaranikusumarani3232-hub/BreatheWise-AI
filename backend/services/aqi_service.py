import datetime
import httpx
from typing import List, Dict, Any, Optional
from models.schemas import AQIResponse, LocationItem, HourlyDataPoint
from utils.aqi_calculator import get_aqi_category_info, calculate_aqi_from_pm

PRESET_CITIES = [
    {"name": "Delhi", "country": "India", "latitude": 28.65195, "longitude": 77.23149, "admin1": "Delhi"},
    {"name": "Beijing", "country": "China", "latitude": 39.9042, "longitude": 116.4074, "admin1": "Beijing"},
    {"name": "Lahore", "country": "Pakistan", "latitude": 31.5497, "longitude": 74.3436, "admin1": "Punjab"},
    {"name": "London", "country": "United Kingdom", "latitude": 51.5085, "longitude": -0.1257, "admin1": "England"},
    {"name": "New York", "country": "United States", "latitude": 40.7143, "longitude": -74.006, "admin1": "New York"},
    {"name": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437, "admin1": "California"},
    {"name": "Tokyo", "country": "Japan", "latitude": 35.6895, "longitude": 139.6917, "admin1": "Tokyo"},
    {"name": "Paris", "country": "France", "latitude": 48.8534, "longitude": 2.3488, "admin1": "Ile-de-France"},
    {"name": "Cairo", "country": "Egypt", "latitude": 30.0626, "longitude": 31.2497, "admin1": "Cairo"},
    {"name": "Sydney", "country": "Australia", "latitude": -33.8678, "longitude": 151.2073, "admin1": "New South Wales"},
]

class AQIService:
    async def search_cities(self, query: str) -> List[LocationItem]:
        query = query.strip()
        if not query:
            return [LocationItem(**c) for c in PRESET_CITIES[:5]]

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": query, "count": 6, "language": "en", "format": "json"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        return [
                            LocationItem(
                                id=item.get("id"),
                                name=item.get("name"),
                                country=item.get("country", ""),
                                admin1=item.get("admin1", ""),
                                latitude=item.get("latitude"),
                                longitude=item.get("longitude"),
                                timezone=item.get("timezone", "UTC")
                            )
                            for item in results
                        ]
        except Exception:
            pass

        # Match local presets if network search fails
        matches = [
            LocationItem(**c) for c in PRESET_CITIES 
            if query.lower() in c["name"].lower() or query.lower() in c["country"].lower()
        ]
        return matches if matches else [LocationItem(**PRESET_CITIES[0])]

    async def get_aqi(self, latitude: float, longitude: float, city_name: str = "", country_name: str = "") -> AQIResponse:
        now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        # Try live Open-Meteo Air Quality & Weather API
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                # 1. Fetch Air Quality
                aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
                aq_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone",
                    "hourly": "pm2_5,pm10,us_aqi",
                    "past_hours": 24,
                    "forecast_hours": 24,
                }
                aq_task = client.get(aq_url, params=aq_params)

                # 2. Fetch Weather (temp & humidity)
                wx_url = "https://api.open-meteo.com/v1/forecast"
                wx_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m",
                }
                wx_task = client.get(wx_url, params=wx_params)

                aq_res, wx_res = await aq_task, await wx_task

                if aq_res.status_code == 200:
                    aq_data = aq_res.json()
                    current_aq = aq_data.get("current", {})
                    hourly = aq_data.get("hourly", {})

                    us_aqi_val = current_aq.get("us_aqi")
                    pm2_5_val = current_aq.get("pm2_5")
                    pm10_val = current_aq.get("pm10")
                    co_val = current_aq.get("carbon_monoxide")
                    no2_val = current_aq.get("nitrogen_dioxide")
                    o3_val = current_aq.get("ozone")

                    # If AQI missing, compute from PM2.5/PM10
                    dominant_pol = "PM2.5"
                    if us_aqi_val is None or us_aqi_val == 0:
                        calc_aqi, dominant_pol = calculate_aqi_from_pm(pm2_5_val, pm10_val)
                        us_aqi_val = calc_aqi

                    category_meta = get_aqi_category_info(us_aqi_val)

                    # Weather parsing
                    temp_val, hum_val = None, None
                    if wx_res.status_code == 200:
                        wx_data = wx_res.json()
                        cur_wx = wx_data.get("current", {})
                        temp_val = cur_wx.get("temperature_2m")
                        hum_val = cur_wx.get("relative_humidity_2m")

                    # Parse hourly points
                    times = hourly.get("time", [])
                    pm25_series = hourly.get("pm2_5", [])
                    pm10_series = hourly.get("pm10", [])
                    aqi_series = hourly.get("us_aqi", [])

                    hourly_points = []
                    # Keep every 2nd or 3rd hour to deliver crisp charts
                    step = 2
                    for i in range(0, len(times), step):
                        h_time = times[i]
                        h_aqi = aqi_series[i] if i < len(aqi_series) else None
                        h_pm25 = pm25_series[i] if i < len(pm25_series) else None
                        h_pm10 = pm10_series[i] if i < len(pm10_series) else None
                        if h_aqi is None and h_pm25 is not None:
                            h_aqi, _ = calculate_aqi_from_pm(h_pm25, h_pm10)
                        hourly_points.append(HourlyDataPoint(
                            time=h_time,
                            pm2_5=round(h_pm25, 1) if h_pm25 is not None else None,
                            pm10=round(h_pm10, 1) if h_pm10 is not None else None,
                            us_aqi=h_aqi
                        ))

                    return AQIResponse(
                        city=city_name or "Detected Location",
                        country=country_name or "",
                        latitude=latitude,
                        longitude=longitude,
                        aqi=us_aqi_val,
                        category=category_meta["category"],
                        category_level=category_meta["category_level"],
                        color=category_meta["color"],
                        bg_color=category_meta["bg_color"],
                        health_guidance=category_meta["health_guidance"],
                        dominant_pollutant=dominant_pol,
                        pm2_5=round(pm2_5_val, 1) if pm2_5_val is not None else None,
                        pm10=round(pm10_val, 1) if pm10_val is not None else None,
                        carbon_monoxide=round(co_val, 1) if co_val is not None else None,
                        nitrogen_dioxide=round(no2_val, 1) if no2_val is not None else None,
                        ozone=round(o3_val, 1) if o3_val is not None else None,
                        temperature=temp_val,
                        humidity=hum_val,
                        last_updated=now_iso,
                        data_source="Open-Meteo European Atmosphere Monitoring",
                        is_live=True,
                        hourly_trends=hourly_points
                    )
        except Exception:
            pass

        # Fallback simulated data if API unreachable - clearly marked as Simulated Demo
        sim_aqi = 168
        sim_pm25 = 88.5
        sim_pm10 = 135.2
        category_meta = get_aqi_category_info(sim_aqi)

        demo_hourly = []
        base_time = datetime.datetime.now(datetime.timezone.utc)
        for offset in range(-12, 13, 2):
            t = (base_time + datetime.timedelta(hours=offset)).strftime("%Y-%m-%dT%H:00")
            demo_hourly.append(HourlyDataPoint(
                time=t,
                pm2_5=round(sim_pm25 + (offset % 5) * 4.2, 1),
                pm10=round(sim_pm10 + (offset % 4) * 6.0, 1),
                us_aqi=int(sim_aqi + (offset % 5) * 5)
            ))

        return AQIResponse(
            city=city_name or "Demo Location",
            country=country_name or "",
            latitude=latitude,
            longitude=longitude,
            aqi=sim_aqi,
            category=category_meta["category"],
            category_level=category_meta["category_level"],
            color=category_meta["color"],
            bg_color=category_meta["bg_color"],
            health_guidance=category_meta["health_guidance"],
            dominant_pollutant="PM2.5",
            pm2_5=sim_pm25,
            pm10=sim_pm10,
            carbon_monoxide=1450.0,
            nitrogen_dioxide=38.4,
            ozone=42.0,
            temperature=18.5,
            humidity=64.0,
            last_updated=now_iso + " (Offline Demo Mode)",
            data_source="Demo Fallback (Offline Mode)",
            is_live=False,
            hourly_trends=demo_hourly
        )

aqi_service = AQIService()
