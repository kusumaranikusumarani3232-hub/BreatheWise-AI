from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from models.schemas import CommunityChallenge, SafetyTip

router = APIRouter(prefix="/api/community", tags=["Community Awareness"])

COMMUNITY_CHALLENGES = [
    CommunityChallenge(
        id="c1",
        title="School Zone Anti-Idling Pledge",
        description="Pledge to shut off car engines completely while waiting in pickup lines at schools or kindergartens. Children inhale 50% more air per pound of body weight.",
        target_action="Turn engine off when stationary for over 30 seconds",
        participants_count=1420,
        badge_label="Clean School Zones"
    ),
    CommunityChallenge(
        id="c2",
        title="Car-Free Winter Friday",
        description="Switch your Friday work commute from solo car driving to public transit, carpooling, or remote work.",
        target_action="1 transit or work-from-home commute per week",
        participants_count=3890,
        badge_label="Eco Commuter"
    ),
    CommunityChallenge(
        id="c3",
        title="Neighborhood Indoor Air Audit",
        description="Inspect door draft seals, replace HVAC or purifier pre-filters, and verify that kitchen range hoods vent outward.",
        target_action="Complete 5-point home seal inspection",
        participants_count=874,
        badge_label="Home Air Guardian"
    ),
    CommunityChallenge(
        id="c4",
        title="Zero Open-Burning Reporting",
        description="Report leaf-burning or municipal garbage fires directly through local government environmental hotlines.",
        target_action="Prevent 1 localized toxic smoke hotspot",
        participants_count=2150,
        badge_label="Clean Skies Watch"
    )
]

SAFETY_TIPS = [
    SafetyTip(
        category="Winter Inversion Physics",
        title="Why Winter Smog is Most Dangerous at Dawn",
        summary="A temperature inversion occurs when cold surface air gets trapped beneath a layer of warm upper air, creating a lid that locks in pollution.",
        practical_steps=[
            "Never schedule early morning jogs between 6:00 AM and 9:30 AM in winter.",
            "Postpone vigorous workouts to midday (1:00 PM - 3:30 PM) when solar radiation partially warms the ground.",
            "Seal drafts under main entry doors using rubber door sweeps or draft snakes."
        ],
        is_winter_smog_focus=True
    ),
    SafetyTip(
        category="Indoor Filtration",
        title="The Corsi-Rosenthal DIY Box Purifier",
        summary="An affordable, open-source air cleaner built from four MERV 13 furnace filters and a 20-inch box fan that outperforms many expensive purifiers.",
        practical_steps=[
            "Tape four 20x20x2 inch MERV-13 filters into a cube with directional arrows pointing inward.",
            "Place a 20-inch box fan on top blowing air upward into the room.",
            "Cardboard base on the bottom and duct tape corners to seal airtight.",
            "Provides clean air delivery rate (CADR) of over 200 CFM for under $70."
        ],
        is_winter_smog_focus=False
    ),
    SafetyTip(
        category="Mask Science",
        title="Mask Efficacy: N95 vs Surgical vs Cloth",
        summary="PM2.5 particles are 30 times thinner than human hair and slip directly through loose cloth and surgical masks.",
        practical_steps=[
            "Only NIOSH-certified N95, European FFP2, or Korean KF94 masks provide an airtight electrostatic barrier.",
            "Pinch the metal nose strip firmly against the bridge of your nose.",
            "Facial hair breaks the seal and can reduce filter efficiency by up to 60%."
        ],
        is_winter_smog_focus=True
    ),
    SafetyTip(
        category="Indoor Cooking",
        title="Kitchen Range Hood Ventilation",
        summary="Cooking with cooking oils, gas burners, or high heat generates massive spikes of PM2.5 and nitrogen dioxide (NO2) indoors.",
        practical_steps=[
            "Always switch on the exhaust fan 1 minute before turning on the stove burner.",
            "Cook on the back burners, where range hoods capture up to 70% more smoke.",
            "Avoid indoor incense sticks (agarbatti) and scented paraffin candles which emit ultrafine soot."
        ],
        is_winter_smog_focus=False
    )
]

class ShareCardRequest(BaseModel):
    city: str
    aqi: int
    category: str
    key_advice: str

class ShareCardResponse(BaseModel):
    title: str
    card_text: str
    formatted_html_snippet: str

@router.get("/challenges", response_model=List[CommunityChallenge])
async def get_challenges():
    return COMMUNITY_CHALLENGES

@router.get("/tips", response_model=List[SafetyTip])
async def get_safety_tips():
    return SAFETY_TIPS

@router.post("/share-card", response_model=ShareCardResponse)
async def generate_share_card(req: ShareCardRequest):
    card_text = (
        f"🚨 BreatheWise Air Safety Alert for {req.city}\n"
        f"AQI: {req.aqi} ({req.category})\n"
        f"Health Priority: {req.key_advice}\n\n"
        f"💡 Winter Smog Tip: Cold inversions trap microfine particulate matter at street level. "
        f"Wear an N95 mask outdoors, keep windows sealed during dawn and night, and run HEPA air filtration indoors.\n\n"
        f"Breathe Better. Live Smarter. Protect Your Community.\n"
        f"Powered by BreatheWise AI"
    )
    return ShareCardResponse(
        title=f"Air Quality Alert: {req.city} (AQI {req.aqi})",
        card_text=card_text,
        formatted_html_snippet=f"<div class='p-4 border rounded bg-slate-900 text-white'><h4>{req.city} - AQI {req.aqi} ({req.category})</h4><p>{req.key_advice}</p></div>"
    )
