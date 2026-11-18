"""
AQI Calculation and Category Utilities based on EPA Breakpoints
and Winter Smog Guidance Standards.
"""
from typing import Tuple, Dict, Any

# EPA PM2.5 Breakpoints (ug/m3) -> AQI
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

# EPA PM10 Breakpoints (ug/m3) -> AQI
PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 504, 301, 400),
    (505, 604, 401, 500),
]

def calculate_sub_index(conc: float, breakpoints: list) -> int:
    """Calculates linear sub-index for a concentration based on breakpoints."""
    if conc < 0:
        return 0
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= conc <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (conc - c_low) + i_low)
    # Exceeds max breakpoint
    if conc > breakpoints[-1][1]:
        return 500
    return 0

def calculate_aqi_from_pm(pm2_5: float = None, pm10: float = None) -> Tuple[int, str]:
    """Calculates composite AQI and identifies dominant pollutant."""
    aqi_pm25 = calculate_sub_index(pm2_5, PM25_BREAKPOINTS) if pm2_5 is not None else 0
    aqi_pm10 = calculate_sub_index(pm10, PM10_BREAKPOINTS) if pm10 is not None else 0

    if aqi_pm25 >= aqi_pm10 and aqi_pm25 > 0:
        return aqi_pm25, "PM2.5"
    elif aqi_pm10 > aqi_pm25:
        return aqi_pm10, "PM10"
    return max(aqi_pm25, aqi_pm10, 25), "PM2.5"

def get_aqi_category_info(aqi: int) -> Dict[str, Any]:
    """Returns color-coded category, level tag, tailwind classes, and health guidance."""
    if aqi <= 50:
        return {
            "category": "Good",
            "category_level": "good",
            "color": "#10b981",       # Emerald
            "bg_color": "bg-emerald-50 text-emerald-800 border-emerald-200",
            "badge_color": "bg-emerald-500 text-white",
            "health_guidance": "Air quality is satisfactory and poses little or no risk. Ideal for outdoor activities and natural home ventilation.",
            "outdoor_risk": "Low",
            "mask_recommended": False,
            "window_open_safe": True
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "category_level": "moderate",
            "color": "#eab308",       # Yellow / Amber
            "bg_color": "bg-amber-50 text-amber-800 border-amber-200",
            "badge_color": "bg-amber-500 text-white",
            "health_guidance": "Air quality is acceptable. Unusually sensitive individuals with pre-existing asthma or respiratory issues should consider reducing prolonged outdoor exertion.",
            "outdoor_risk": "Moderate",
            "mask_recommended": False,
            "window_open_safe": True
        }
    elif aqi <= 150:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "category_level": "unhealthy_sensitive",
            "color": "#f97316",       # Orange
            "bg_color": "bg-orange-50 text-orange-800 border-orange-200",
            "badge_color": "bg-orange-500 text-white",
            "health_guidance": "Members of sensitive groups (children, elderly, people with asthma/heart disease) may experience health effects. General public is less likely to be affected.",
            "outdoor_risk": "Elevated for Sensitive Groups",
            "mask_recommended": True,
            "window_open_safe": False
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy",
            "category_level": "unhealthy",
            "color": "#ef4444",       # Red
            "bg_color": "bg-red-50 text-red-800 border-red-200",
            "badge_color": "bg-red-500 text-white",
            "health_guidance": "Everyone may begin to experience health effects; sensitive groups may experience more serious effects. Avoid prolonged outdoor workouts and wear N95/FFP2 masks outdoors.",
            "outdoor_risk": "High",
            "mask_recommended": True,
            "window_open_safe": False
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "category_level": "very_unhealthy",
            "color": "#a855f7",       # Purple
            "bg_color": "bg-purple-50 text-purple-800 border-purple-200",
            "badge_color": "bg-purple-600 text-white",
            "health_guidance": "Health alert: The risk of health effects is increased for everyone. Winter temperature inversions trap microfine particulate matter. Keep windows sealed and run indoor filtration.",
            "outdoor_risk": "Very High",
            "mask_recommended": True,
            "window_open_safe": False
        }
    else:
        return {
            "category": "Hazardous",
            "category_level": "hazardous",
            "color": "#881337",       # Deep Rose / Maroon
            "bg_color": "bg-rose-950 text-rose-100 border-rose-800",
            "badge_color": "bg-rose-800 text-white",
            "health_guidance": "Emergency health warning: Entire population is likely to be severely affected. Avoid all outdoor physical activity. Keep indoor air sealed with active HEPA filtration.",
            "outdoor_risk": "Critical / Emergency",
            "mask_recommended": True,
            "window_open_safe": False
        }
