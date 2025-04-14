from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.services.ice_breaker_service import generate_icebreaker


router = APIRouter()

# Request schema
class IceBreakerRequest(BaseModel):
    disorder: str = Field(..., description="Learning disorder or condition to address")
    question: str = Field(..., description="ICE BREAKER ACTIVITY")
    materials: str = Field(..., description="What Materials or If they are needed")
    setting: str = Field(..., description="Virtual / In-Person")

# Response schema
class IceBreakerResponse(BaseModel):
    activity: str

@router.post("", response_model=IceBreakerRequest, status_code=status.HTTP_200_OK)
async def get_icebreaker_activity(request: IceBreakerResponse):
    """
    Generate a lesson plan using the RAG pipeline based on the specified disorder, topic, grade level, and additional requirements.
    """
    try:
        question = "Give me an icebreaker that requires no materials"
        materials_filter = "No Materials are necessary for this activity."
        disorder="dyslexic"
        setting="In-Person"

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
        
        response = {
            "activity": rag_text
        }
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
