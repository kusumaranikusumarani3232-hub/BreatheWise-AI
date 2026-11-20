import datetime
from fastapi import APIRouter
from models.schemas import (
    ImpactSummaryRequest, ImpactSummaryResponse, WeeklyImpactPoint
)

router = APIRouter(prefix="/api/impact", tags=["Impact Tracker"])

PRESET_SUSTAINABLE_ACTIONS = [
    {
        "type": "transit_replace_car",
        "label": "Public Transit (Metro / Electric Bus)",
        "default_km": 15.0,
        "co2_factor_per_km": 0.14,  # Net kg CO2e saved vs solo gasoline car
        "description": "Replaces solo passenger car trip with electric metro or public bus.",
        "exposure_note": "Trains have filtered air; avoids sitting in dense road-level vehicle exhaust."
    },
    {
        "type": "carpool",
        "label": "Carpooling / Shared Ride",
        "default_km": 12.0,
        "co2_factor_per_km": 0.09,
        "description": "Sharing vehicle occupancy cuts individual per-capita emissions in half.",
        "exposure_note": "Reduces total vehicle count on congested corridors."
    },
    {
        "type": "bike_walk",
        "label": "Walk / Cycling (Safe AQI Windows Only)",
        "default_km": 3.0,
        "co2_factor_per_km": 0.18,
        "description": "Zero emissions for short local neighborhood errands.",
        "exposure_note": "Only recommended when AQI is below 100 to protect respiratory health."
    },
    {
        "type": "avoid_idle",
        "label": "Avoid Vehicle Idling (10 min engine cutoff)",
        "default_km": 0.0,
        "flat_co2_kg": 0.25,
        "description": "Turning off engine during school drop-offs or long traffic lights.",
        "exposure_note": "Directly halts toxic ultra-fine particle spikes at pedestrian breathing height."
    },
    {
        "type": "energy_saving",
        "label": "Household Energy Conservation",
        "default_km": 0.0,
        "flat_co2_kg": 0.85,
        "description": "Lowering space heating thermostat by 1°C or switching to LED lighting.",
        "exposure_note": "Reduces demand on regional thermal and coal power plants."
    },
    {
        "type": "audit_indoor",
        "label": "Indoor Seal & Kitchen Ventilation Check",
        "default_km": 0.0,
        "flat_co2_kg": 0.15,
        "description": "Applied weatherstripping to door drafts and cleaned exhaust fan blades.",
        "exposure_note": "Directly reduces indoor particulate penetration by up to 40%."
    }
]

@router.get("/presets")
async def get_preset_actions():
    return PRESET_SUSTAINABLE_ACTIONS

@router.post("/summary", response_model=ImpactSummaryResponse)
async def calculate_impact_summary(request: ImpactSummaryRequest):
    actions = request.actions
    
    total_co2 = 0.0
    car_trips = 0
    clean_km = 0.0
    
    # Generate past 7 days breakdown
    today = datetime.date.today()
    today_name = today.strftime("%a")
    days_map = {}
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        d_str = d.strftime("%a")  # Mon, Tue...
        days_map[d_str] = {"co2": 0.0, "count": 0}

    for act in actions:
        total_co2 += act.co2_saved_kg
        if "transit" in act.action_type or "carpool" in act.action_type:
            car_trips += 1
        clean_km += act.distance_km
        
        # Attribute to day
        try:
            act_date = datetime.date.fromisoformat(act.date[:10])
            day_name = act_date.strftime("%a")
            if day_name in days_map:
                days_map[day_name]["co2"] += act.co2_saved_kg
                days_map[day_name]["count"] += 1
        except Exception:
            # Default to today
            if today_name in days_map:
                days_map[today_name]["co2"] += act.co2_saved_kg
                days_map[today_name]["count"] += 1

    weekly_breakdown = [
        WeeklyImpactPoint(
            day=day,
            co2_kg=round(info["co2"], 2),
            actions_count=info["count"]
        )
        for day, info in days_map.items()
    ]

    assumptions = [
        "Gasoline passenger car baseline: ~0.18 kg CO2e per vehicle kilometer.",
        "Electric metro / bus transit: ~0.04 kg CO2e per passenger-km (net saving ~0.14 kg CO2e/km).",
        "Vehicle anti-idling: ~0.25 kg CO2e saved per 10 minutes of engine shutdown.",
        "Calculations follow IPCC & EPA urban mobility emissions factors."
    ]

    disclaimer = (
        "Scientific Distinction: CO2 savings denote long-term greenhouse gas mitigation to protect global climate. "
        "They do NOT equate to an immediate personal reduction in PM2.5 inhalation. Immediate personal health protection "
        "requires indoor air filtration, window sealing during thermal inversions, and certified N95 respirators outdoors."
    )

    return ImpactSummaryResponse(
        total_co2_saved_kg=round(total_co2, 2),
        car_trips_replaced=car_trips,
        clean_km_traveled=round(clean_km, 1),
        actions_completed=len(actions),
        weekly_breakdown=weekly_breakdown,
        calculation_assumptions=assumptions,
        distinction_disclaimer=disclaimer
    )
