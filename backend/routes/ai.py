from fastapi import APIRouter, HTTPException
from models.schemas import AIChatRequest, AIChatResponse
from services.groq_service import groq_service

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(request: AIChatRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        response = await groq_service.generate_response(
            message=request.message.strip(),
            history=request.history,
            aqi_context=request.aqi_context,
            user_profile=request.user_profile,
            user_groq_key=request.user_groq_key
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")
