import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import aqi, ai, planner, impact, community
from services.aqi_service import aqi_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Graceful shutdown of persistent connection pool
    await aqi_service.close()

app = FastAPI(
    title="BreatheWise AI API",
    description="Intelligent Smart Air Pollution & Winter Smog Assistant Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(aqi.router)
app.include_router(ai.router)
app.include_router(planner.router)
app.include_router(impact.router)
app.include_router(community.router)

@app.get("/")
async def root():
    return {
        "app": "BreatheWise AI",
        "tagline": "Breathe Better. Live Smarter. Protect Your Community.",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "groq_model": settings.GROQ_MODEL
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )
