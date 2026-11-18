from fastapi import APIRouter
from models.schemas import DailyPlannerRequest, DailyPlannerResponse
from services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/planner", tags=["Daily Routine Planner"])

@router.post("/daily", response_model=DailyPlannerResponse)
async def generate_daily_routine(request: DailyPlannerRequest):
    return recommendation_engine.generate_daily_plan(
        city=request.city,
        aqi=request.aqi,
        pm2_5=request.pm2_5,
        user_profile=request.user_profile,
        hourly_forecast=request.hourly_forecast
    )
