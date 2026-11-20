import datetime
from typing import List, Optional
from models.schemas import (
    DailyPlannerResponse, RoutineBlock, UserProfile, HourlyDataPoint
)

class RecommendationEngine:
    def generate_daily_plan(
        self,
        city: str,
        aqi: int,
        pm2_5: Optional[float] = None,
        user_profile: Optional[UserProfile] = None,
        hourly_forecast: Optional[List[HourlyDataPoint]] = None
    ) -> DailyPlannerResponse:
        today_str = datetime.date.today().strftime("%A, %B %d, %Y")
        
        # Analyze hourly forecast to find safer outdoor windows
        safer_windows = []
        if hourly_forecast and len(hourly_forecast) > 0:
            # Sort or find points with lowest AQI
            valid_points = [p for p in hourly_forecast if p.us_aqi is not None]
            if valid_points:
                lowest_point = min(valid_points, key=lambda x: x.us_aqi or 999)
                time_str = lowest_point.time.split("T")[-1] if "T" in lowest_point.time else lowest_point.time
                safer_windows.append(f"Lowest pollution window forecast around {time_str} (Estimated AQI: {lowest_point.us_aqi})")
        
        # Default climatological winter inversion window if no forecast points
        if not safer_windows:
            if aqi > 150:
                safer_windows.append("1:00 PM – 3:30 PM (Solar heating allows partial atmospheric vertical dispersion)")
            else:
                safer_windows.append("11:30 AM – 4:00 PM (Optimal daylight dispersion window)")

        has_kids = user_profile.has_children if user_profile else False
        has_asthma = user_profile.has_asthma_respiratory if user_profile else False
        has_elderly = user_profile.has_elderly if user_profile else False

        # Overall Status
        if aqi <= 50:
            overall_status = "Optimal Air Quality – Outdoor activities fully endorsed."
        elif aqi <= 100:
            overall_status = "Moderate – Safe for general public; sensitive groups reduce long runs."
        elif aqi <= 150:
            overall_status = "Caution: Unhealthy for Sensitive Groups – Modify outdoor routines."
        elif aqi <= 200:
            overall_status = "High Smog Alert: Unhealthy – Transition workouts indoors, wear N95 outdoors."
        elif aqi <= 300:
            overall_status = "Very Unhealthy Smog – Severe inversion. Strict indoor containment."
        else:
            overall_status = "Emergency Hazardous Smog – Absolute outdoor avoidance required."

        # Morning Routine
        if aqi > 150:
            m_caution = "high"
            m_title = "High Smog Inversion Window"
            m_rec = "Keep doors and windows sealed. Postpone outdoor running or morning strolls. Run bedroom air purifier on medium."
            m_why = "Cold surface air traps vehicle emissions and ground dust near the earth's surface between 6 AM and 10 AM, causing peak diurnal PM2.5 spikes."
        elif aqi > 100:
            m_caution = "medium"
            m_title = "Moderate Morning Haze"
            m_rec = "Sensitive family members should exercise indoors. Wear an N95/KF94 mask if commuting via two-wheeler or open bus."
            m_why = "Morning rush hour emissions accumulate quickly before sunlight creates convective air mixing."
        else:
            m_caution = "low"
            m_title = "Crisp Clean Morning"
            m_rec = "Enjoy natural outdoor ventilation, morning walks, and open windows for fresh air exchange."
            m_why = "AQI is in a safe bracket and pollutants are dispersed."

        # Afternoon Routine
        if aqi > 150:
            a_caution = "medium"
            a_title = "Partial Dispersion Window"
            a_rec = "Essential outdoor errands or necessary commutes are safest now. If ventilating briefly, do a quick 15-minute cross-breeze, then seal."
            a_why = "Maximum solar thermal radiation occurs between 1:00 PM and 3:30 PM, temporarily breaking the inversion ceiling."
        else:
            a_caution = "low"
            a_title = "Optimal Daytime Hours"
            a_rec = "Safe for general transit, school pickups, and outdoor park visits."
            a_why = "Daytime wind flow and sunlight help clear local vehicle exhaust plumes."

        # Evening Routine
        if aqi > 150:
            e_caution = "high"
            e_title = "Night Cooling Inversion"
            e_rec = "Seal all balcony doors. Turn on kitchen exhaust fan while cooking dinner. Turn bedroom purifier on 45 minutes before sleep."
            e_why = "As the ground cools rapidly after sunset, warm air forms a ceiling, re-trapping wood burning and nighttime traffic fumes."
        else:
            e_caution = "low"
            e_title = "Comfortable Evening"
            e_rec = "Standard domestic routine. Keep exhaust fans running during heavy frying or cooking."
            e_why = "Cooking fumes (aerosolized oils) are a top source of indoor fine particulates regardless of outdoor AQI."

        morning = RoutineBlock(time_window="Morning (6:00 AM – 10:30 AM)", title=m_title, recommendation=m_rec, caution_level=m_caution, why=m_why)
        afternoon = RoutineBlock(time_window="Afternoon (11:00 AM – 4:00 PM)", title=a_title, recommendation=a_rec, caution_level=a_caution, why=a_why)
        evening = RoutineBlock(time_window="Evening & Night (5:00 PM – 10:00 PM)", title=e_title, recommendation=e_rec, caution_level=e_caution, why=e_why)

        # Indoor exercise alternatives
        indoor_exercises = [
            "Bodyweight Strength Circuit (Pushups, squats, lunges, and core planks)",
            "Low-impact Yoga or Pilates with diaphragmatic breathing",
            "Indoor Stair Climbing or Stationary Cycle interval session",
            "Resistance Band Full-body Training in an air-purified room"
        ]

        # Commuting advice
        if aqi > 150:
            commute_advice = "Prefer air-filtered public transit (Metro/subway trains) or carpooling with vehicle air recirculation (AC Recirculate button active). Avoid open-air two-wheelers, auto-rickshaws, or cycling near arterial road corridors."
        else:
            commute_advice = "Public transit, cycling, or walking are great sustainable choices today to reduce personal carbon footprint and citywide emissions."

        # School & work precautions
        school_work = []
        if has_kids or aqi > 100:
            school_work.append("Request schools suspend outdoor sports fields and physical education during peak morning hours.")
            school_work.append("Provide children with well-fitted KF94 / child-sized N95 masks for bus and van stops.")
        school_work.append("Ensure office and school HVAC units have clean MERV 13 or HEPA intake filters.")
        if has_asthma:
            school_work.append("Keep a quick-relief bronchodilator in school backpacks or work desks.")

        # Critical warnings
        warnings = []
        if aqi > 200:
            warnings.append("Severe winter smog alert: PM2.5 levels exceed safe limits by several multiples.")
            warnings.append("Vulnerable groups (seniors, infants, asthma patients) must avoid any strenuous outdoor exertion.")
        if has_asthma:
            warnings.append("Asthma Risk: Cold smog causes rapid bronchoconstriction. Inhale through the nose and keep rescue medication accessible.")

        return DailyPlannerResponse(
            date=today_str,
            overall_status=overall_status,
            safer_outdoor_windows=safer_windows,
            morning_routine=morning,
            afternoon_routine=afternoon,
            evening_routine=evening,
            indoor_exercise_alternatives=indoor_exercises,
            low_emission_commute_advice=commute_advice,
            school_and_work_precautions=school_work,
            critical_warnings=warnings
        )

recommendation_engine = RecommendationEngine()
