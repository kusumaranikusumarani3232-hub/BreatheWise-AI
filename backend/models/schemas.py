from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Location Schemas
class LocationItem(BaseModel):
    id: Optional[int] = None
    name: str
    country: Optional[str] = ""
    admin1: Optional[str] = ""
    latitude: float
    longitude: float
    timezone: Optional[str] = "UTC"

class LocationSearchResponse(BaseModel):
    results: List[LocationItem]

# Hourly AQI Data Point
class HourlyDataPoint(BaseModel):
    time: str
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    us_aqi: Optional[int] = None

# AQI Detail Response
class AQIResponse(BaseModel):
    city: str
    country: Optional[str] = ""
    latitude: float
    longitude: float
    aqi: int
    category: str
    category_level: str  # good, moderate, unhealthy_sensitive, unhealthy, very_unhealthy, hazardous
    color: str           # hex color code
    bg_color: str        # tailwind bg class
    health_guidance: str
    dominant_pollutant: str
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    carbon_monoxide: Optional[float] = None
    nitrogen_dioxide: Optional[float] = None
    ozone: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    last_updated: str
    data_source: str     # "Open-Meteo European Atmosphere Monitoring" | "OpenAQ" | "Simulated Demo"
    is_live: bool
    hourly_trends: List[HourlyDataPoint] = []

# User Family / Lifestyle Context
class UserProfile(BaseModel):
    has_asthma_respiratory: bool = False
    has_children: bool = False
    has_elderly: bool = False
    is_outdoor_worker_athlete: bool = False
    commute_mode: str = "mixed"  # car, public_transit, cycling, walking, mixed
    city: Optional[str] = "Delhi"

# AI Chat Schemas
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    aqi_context: Optional[Dict[str, Any]] = None
    user_profile: Optional[UserProfile] = None

class AIChatResponse(BaseModel):
    reply: str
    mode: str  # "groq" or "rule_based_fallback"
    model: str
    follow_up_suggestions: List[str] = []

# Daily Routine Planner Schemas
class RoutineBlock(BaseModel):
    time_window: str     # e.g., "Morning (6:00 AM - 10:00 AM)"
    title: str
    recommendation: str
    caution_level: str   # low, medium, high
    why: str

class DailyPlannerRequest(BaseModel):
    city: str
    aqi: int
    pm2_5: Optional[float] = None
    user_profile: Optional[UserProfile] = None
    hourly_forecast: Optional[List[HourlyDataPoint]] = []

class DailyPlannerResponse(BaseModel):
    date: str
    overall_status: str
    safer_outdoor_windows: List[str]
    morning_routine: RoutineBlock
    afternoon_routine: RoutineBlock
    evening_routine: RoutineBlock
    indoor_exercise_alternatives: List[str]
    low_emission_commute_advice: str
    school_and_work_precautions: List[str]
    critical_warnings: List[str]

# Impact Tracker Schemas
class LoggedAction(BaseModel):
    id: str
    date: str
    action_type: str      # transit_replace_car, carpool, bike_walk, avoid_idle, energy_saving, audit_indoor
    label: str
    distance_km: float = 0.0
    co2_saved_kg: float
    personal_exposure_reduced: str  # qualitative note explaining PM2.5 vs CO2 distinction

class ImpactSummaryRequest(BaseModel):
    actions: List[LoggedAction] = []

class WeeklyImpactPoint(BaseModel):
    day: str
    co2_kg: float
    actions_count: int

class ImpactSummaryResponse(BaseModel):
    total_co2_saved_kg: float
    car_trips_replaced: int
    clean_km_traveled: float
    actions_completed: int
    weekly_breakdown: List[WeeklyImpactPoint]
    calculation_assumptions: List[str]
    distinction_disclaimer: str

# Community Schemas
class CommunityChallenge(BaseModel):
    id: str
    title: str
    description: str
    target_action: str
    participants_count: int
    badge_label: str

class SafetyTip(BaseModel):
    category: str
    title: str
    summary: str
    practical_steps: List[str]
    is_winter_smog_focus: bool = False
