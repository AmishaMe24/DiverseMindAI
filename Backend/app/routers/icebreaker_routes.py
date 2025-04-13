from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from chromadb.config import Settings
from chromadb import PersistentClient
from app.services.ice_breaker_service import generate_icebreaker


router = APIRouter()

# Request schema
class LessonPlanRequest(BaseModel):
    disorder: str = Field(..., description="Learning disorder or condition to address")
    question: str = Field(..., description="ICE BREAKER ACTIVITY")
    materials: str = Field(..., description="What Materials or If they are needed")

# Response schema
class LessonPlanResponse(BaseModel):
    title: str
    lessonName: str
    gradeLevel: str
    concept: str
    examples: List[Dict[str, Any]]

@router.post("", response_model=LessonPlanResponse, status_code=status.HTTP_200_OK)
async def get_icebreaker_activity(request: LessonPlanRequest):
    """
    Generate a lesson plan using the RAG pipeline based on the specified disorder, topic, grade level, and additional requirements.
    """
    try:
        question = "Give me an icebreaker that requires no materials"
        materials_filter = "No Materials are necessary for this activity."
        disorder="dyslexic"

        rag_text = generate_icebreaker(
            materials=materials_filter,
            question=question,
            disorder=disorder
        )

        if not rag_text:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "message": "RAG model could not generate a lesson plan.",
                    "inputs": request.dict(),
                    "suggestion": "Double-check the topic/disorder/grade or improve the prompt."
                }
            )

        # Wrap the response into a structure your frontend expects
        response = rag_text
        

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "An unexpected error occurred while generating the lesson plan.",
                "error": str(e),
            },
        )
