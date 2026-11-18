import os
import re
from typing import Dict, Any, List, Optional
from config import settings
from models.schemas import AIChatResponse, ChatMessage, UserProfile

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

SYSTEM_PROMPT = """You are BreatheWise AI, an expert, empathetic, and practical atmospheric health and air pollution assistant.
Tagline: "Breathe Better. Live Smarter. Protect Your Community."

Your purpose:
Help families and communities navigate severe urban air pollution and winter smog by explaining what they can do, why they should do it, and the personal and environmental impact of their choices.

Guidelines:
1. ALWAYS use the provided current AQI data and user family profile to contextualize answers.
2. Structure your replies clearly with bullet points and concise sections.
3. Be practical, realistic, and non-alarmist. Recommend affordable measures (e.g., DIY Corsi-Rosenthal boxes, N95 masks, sealing window cracks, timing kitchen exhaust fans).
4. Strictly clarify that houseplants alone cannot meaningfully filter toxic PM2.5 or gaseous indoor pollutants at room scale.
5. Emphasize winter smog realities: thermal inversions trap stagnant particulate pollution during cold nights and early mornings; peak outdoor exposure often occurs between 6 AM and 10 AM.
6. MEDICAL DISCLAIMER: Avoid making medical diagnoses or claiming guaranteed protection. Advise users with asthma or cardiovascular symptoms to consult healthcare professionals and carry prescribed rescue inhalers.
7. Be encouraging about low-emission community action (public transit, carpooling, anti-idling).
"""

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
        self.default_model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"

    def _get_client(self, user_override_key: Optional[str] = None):
        key = user_override_key or self.api_key or os.environ.get("GROQ_API_KEY", "")
        if key and GROQ_AVAILABLE:
            try:
                return Groq(api_key=key)
            except Exception:
                return None
        return None

    async def generate_response(
        self,
        message: str,
        history: List[ChatMessage] = [],
        aqi_context: Optional[Dict[str, Any]] = None,
        user_profile: Optional[UserProfile] = None,
        user_groq_key: Optional[str] = None
    ) -> AIChatResponse:
        client = self._get_client(user_groq_key)

        # Build context injection
        context_str = self._build_context_prompt(aqi_context, user_profile)
        
        # If client is available, try Groq
        if client:
            try:
                messages = [
                    {"role": "system", "content": f"{SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\n{context_str}"}
                ]
                # Include last few history turns
                for h in history[-6:]:
                    messages.append({"role": h.role, "content": h.content})
                messages.append({"role": "user", "content": message})

                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model=self.default_model,
                    temperature=0.6,
                    max_tokens=850,
                )
                reply = chat_completion.choices[0].message.content
                suggestions = self._generate_suggestions(message, aqi_context)
                return AIChatResponse(
                    reply=reply,
                    mode="groq",
                    model=self.default_model,
                    follow_up_suggestions=suggestions
                )
            except Exception as e:
                # Fallback on rate limit, invalid key, or network error
                print(f"[GroqService] Groq API call failed ({e}). Reverting to rule-based fallback.")

        # Fallback to intelligent rule-based engine
        fallback_reply = self._rule_based_reply(message, aqi_context, user_profile)
        suggestions = self._generate_suggestions(message, aqi_context)
        return AIChatResponse(
            reply=fallback_reply,
            mode="rule_based_fallback",
            model="breathewise-rule-engine-v1",
            follow_up_suggestions=suggestions
        )

    def _build_context_prompt(self, aqi_ctx: Optional[Dict[str, Any]], profile: Optional[UserProfile]) -> str:
        parts = []
        if aqi_ctx:
            city = aqi_ctx.get("city", "Unknown")
            aqi = aqi_ctx.get("aqi", "Unknown")
            cat = aqi_ctx.get("category", "Unknown")
            pm25 = aqi_ctx.get("pm2_5", "N/A")
            parts.append(f"Location: {city} | Current AQI: {aqi} ({cat}) | PM2.5: {pm25} µg/m³")
        if profile:
            vuln = []
            if profile.has_asthma_respiratory:
                vuln.append("Has asthma/respiratory condition")
            if profile.has_children:
                vuln.append("Has young children at home")
            if profile.has_elderly:
                vuln.append("Has elderly family members")
            if profile.is_outdoor_worker_athlete:
                vuln.append("Regular outdoor exerciser / worker")
            vuln_str = ", ".join(vuln) if vuln else "None declared"
            parts.append(f"Household Profile: {vuln_str} | Commute: {profile.commute_mode}")
        return "\n".join(parts) if parts else "General urban winter environment."

    def _rule_based_reply(
        self,
        query: str,
        aqi_ctx: Optional[Dict[str, Any]],
        profile: Optional[UserProfile]
    ) -> str:
        q = query.lower()
        aqi = aqi_ctx.get("aqi", 150) if aqi_ctx else 150
        city = aqi_ctx.get("city", "your area") if aqi_ctx else "your area"
        category = aqi_ctx.get("category", "Moderate to Unhealthy") if aqi_ctx else "Unhealthy"
        pm25 = aqi_ctx.get("pm2_5", 65.0) if aqi_ctx else 65.0

        has_asthma = profile.has_asthma_respiratory if profile else False
        has_kids = profile.has_children if profile else False
        has_elderly = profile.has_elderly if profile else False

        # 1. Outdoor safety / Going outside
        if any(w in q for w in ["safe to go outside", "outdoor", "walk", "stepping out", "outside today"]):
            if aqi > 200:
                text = (
                    f"### Current Air Quality in {city}: AQI {aqi} ({category})\n\n"
                    f"**Direct Assessment:** It is **not safe** for prolonged outdoor activity today.\n\n"
                    f"**Immediate Actions to Take:**\n"
                    f"- **Stay Indoors:** Keep outdoor transit limited to essential tasks only.\n"
                    f"- **Wear Proper Protection:** If you must step out, a fitted **N95 or FFP2 respirator** is required. Cloth masks or surgical masks do not block sub-micron PM2.5.\n"
                    f"- **Avoid Morning & Night Runs:** Winter temperature inversions compress smog closest to ground level during dawn and late night hours.\n"
                    f"- **Vehicles:** Keep car windows closed and activate internal air recirculation mode."
                )
            elif aqi > 100:
                text = (
                    f"### Current Air Quality in {city}: AQI {aqi} ({category})\n\n"
                    f"**Direct Assessment:** Outdoor activity is **risky for sensitive individuals** (children, seniors, those with asthma), while the general public should moderate strenuous workouts.\n\n"
                    f"**Recommended Guidelines:**\n"
                    f"- Shift strenuous workouts indoors or to early afternoon (1:00 PM – 4:00 PM) when sunlight slightly breaks up surface stagnation.\n"
                    f"- Children and elderly should limit outdoor playground and garden time to under 20-30 minutes."
                )
            else:
                text = (
                    f"### Current Air Quality in {city}: AQI {aqi} ({category})\n\n"
                    f"**Direct Assessment:** The air is relatively clean and safe for most outdoor activities!\n\n"
                    f"- Great time for outdoor walks, errands, and ventilating your home.\n"
                    f"- Keep track of evening changes as winter inversions can set in quickly after sunset."
                )
            if has_asthma:
                text += "\n\n> **Asthma Notice:** Keep your prescribed quick-relief bronchodilator within reach at all times."
            return text

        # 2. Children / Kids playing
        if any(w in q for w in ["children", "kid", "play outside", "school", "park"]):
            return (
                f"### Child Health Guidance for AQI {aqi} ({category})\n\n"
                f"Children breathe more air per pound of body weight than adults and their respiratory tracts are still developing.\n\n"
                f"**Recommendations:**\n"
                f"- **Play Areas:** {'Move playtime indoors. Avoid outdoor school sports or field trips.' if aqi > 100 else 'Outdoor play is safe, but monitor for coughs if sensitive.'}\n"
                f"- **Indoor Active Games:** Balloon volleyball, obstacle courses with cushions, or light dance routines.\n"
                f"- **School Commute:** Ensure school transit windows are closed or children wear a well-fitted child-sized KF94/KN95 mask if outdoors in heavy traffic.\n"
                f"- **Hydration:** Encourage regular water intake to keep mucosal membranes moist."
            )

        # 3. Elderly precautions
        if any(w in q for w in ["elderly", "senior", "grandparents", "older"]):
            return (
                f"### Senior & Vulnerable Care (Current AQI: {aqi})\n\n"
                f"Fine particulate matter (PM2.5) enters the bloodstream and strains cardiovascular and pulmonary systems in seniors.\n\n"
                f"**Top Precautions:**\n"
                f"1. **Cancel Morning Walks:** Shift strolls to indoors or climate-controlled spaces during peak inversion (6 AM - 9 AM).\n"
                f"2. **Maintain Medication:** Ensure blood pressure, cardiac, and inhaler medications are fully stocked.\n"
                f"3. **Air Purification:** Keep the bedroom air purifier running on medium-high speed overnight.\n"
                f"4. **Emergency Red Flags:** Seek immediate medical care if chest tightness, unusual wheezing, or dizziness occurs."
            )

        # 4. Exercise & Gym
        if any(w in q for w in ["exercise", "run", "jog", "workout", "cycling", "bike"]):
            if aqi > 100:
                return (
                    f"### Exercise Advisory (AQI {aqi} - {category})\n\n"
                    f"**Warning:** Deep inhalation during aerobic exercise draws PM2.5 up to 10x deeper into your alveoli.\n\n"
                    f"**What You Should Do Instead:**\n"
                    f"- **Indoor Cardio:** Jump rope, stationary bike, treadmill, or bodyweight HIIT in a closed room with air filtration.\n"
                    f"- **Strength & Yoga:** Ideal days for resistance bands, dumbbell workouts, and restorative yoga.\n"
                    f"- **Timing if You Must Cycle/Run:** The safest window is typically 1:30 PM to 4:00 PM when vertical mixing is highest, but stay away from high-traffic arterial roads."
                )
            return (
                f"### Exercise Advisory (AQI {aqi})\n\n"
                f"Air conditions are favorable for outdoor runs, cycling, and sports. Enjoy your workout, and prefer green parks over busy roads to avoid localized vehicle exhaust!"
            )

        # 5. Indoor Air Quality & Houseplants
        if any(w in q for w in ["indoor", "room", "purifier", "filter", "houseplant", "plants", "smell", "dust"]):
            return (
                f"### Science-Backed Indoor Air Optimization\n\n"
                f"Indoor air during winter can be up to 3-5x more polluted than expected due to trapped combustion and cooking fumes.\n\n"
                f"**Key Actions:**\n"
                f"1. **Active HEPA Filtration:** True HEPA filters capture 99.97% of particles down to 0.3 microns. Run continuous low speed.\n"
                f"2. **Budget Alternative:** Build a Corsi-Rosenthal Box using a standard box fan and four MERV 13 furnace filters for under $70.\n"
                f"3. **Kitchen Exhaust:** Always turn on your range hood or exhaust fan when cooking with oil or gas stoves.\n"
                f"4. **Avoid Smoke Sources:** Eliminate indoor incense (agarbatti), candle burning, and indoor tobacco smoke.\n"
                f"5. **The Houseplant Myth:** While plants are lovely decor, peer-reviewed EPA studies show houseplants cannot meaningfully cleanse room-scale PM2.5 or VOCs. Mechanical filtration is mandatory."
            )

        # 6. Winter Smog & Thermal Inversions
        if any(w in q for w in ["winter", "smog", "fog", "inversion", "why is it bad", "severe"]):
            return (
                f"### Understanding Winter Smog & Thermal Inversions\n\n"
                f"In winter, the ground cools rapidly overnight, creating a warm 'lid' of air above cold surface air—trapping emissions in a stagnant layer like a bowl.\n\n"
                f"**Why Winter Smog is Dangerous:**\n"
                f"- Low wind speeds prevent horizontal dispersion.\n"
                f"- Cold humidity condenses around particulates, forming toxic chemical smog.\n"
                f"- Biomass burning and vehicle cold-starts produce high VOCs and toxic PM2.5.\n\n"
                f"**Your Protective Strategy:**\n"
                f"- Seal doors and windows during dawn and late night hours.\n"
                f"- Only open cross-ventilation windows between 12:00 PM and 3:30 PM if AQI dips below 120."
            )

        # General helpful overview
        return (
            f"### BreatheWise Pollution Advisory for {city} (AQI: {aqi} – {category})\n\n"
            f"Currently, fine particulate matter (PM2.5: {pm25} µg/m³) is the primary concern.\n\n"
            f"**Key Daily Protections:**\n"
            f"- **Outdoor:** Limit exertion and use an N95 mask if AQI exceeds 150.\n"
            f"- **Home:** Keep windows sealed during morning smog hours; use HEPA or DIY MERV-13 air purifiers.\n"
            f"- **Commute:** Choose metro/bus or carpool to reduce citywide tailpipe emissions.\n"
            f"- **Vulnerable Members:** Keep respiratory rescue inhalers on hand and monitor seniors and young children.\n\n"
            f"*Disclaimer: BreatheWise provides air safety recommendations, not clinical diagnoses. Consult your doctor for medical symptoms.*"
        )

    def _generate_suggestions(self, message: str, aqi_ctx: Optional[Dict[str, Any]]) -> List[str]:
        return [
            "Is it safe to go outside today?",
            "Can my children play outdoors?",
            "What precautions should elderly family members take?",
            "How can I improve indoor air quality?",
            "What is a Corsi-Rosenthal DIY air purifier?"
        ]

groq_service = GroqService()
