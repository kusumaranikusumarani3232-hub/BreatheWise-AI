from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from models.schemas import AQIResponse, LocationSearchResponse
from services.aqi_service import aqi_service

router = APIRouter(prefix="/api/aqi", tags=["Air Quality"])

@router.get("/search", response_model=LocationSearchResponse)
async def search_locations(q: str = Query(default="", description="City or place name")):
    results = await aqi_service.search_cities(q)
    return LocationSearchResponse(results=results)

@router.get("/current", response_model=AQIResponse)
async def get_current_aqi(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    city: Optional[str] = Query(default="", description="City name"),
    country: Optional[str] = Query(default="", description="Country name"),
):
    try:
        return await aqi_service.get_aqi(latitude=lat, longitude=lon, city_name=city, country_name=country)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality data: {str(e)}")

@router.get("/city/{city_name}", response_model=AQIResponse)
async def get_aqi_by_city_name(city_name: str):
    try:
        locations = await aqi_service.search_cities(city_name)
        if not locations:
            raise HTTPException(status_code=404, detail="City not found")
        loc = locations[0]
        return await aqi_service.get_aqi(
            latitude=loc.latitude,
            longitude=loc.longitude,
            city_name=loc.name,
            country_name=loc.country
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality data: {str(e)}")
