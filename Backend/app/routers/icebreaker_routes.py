from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.services.ice_breaker_service import generate_icebreaker


router = APIRouter()

# Request schema
class IceBreakerRequest(BaseModel):
    disorder: str = Field(..., description="Learning disorder or condition to address")
    activity: str = Field(..., description="ICE BREAKER ACTIVITY")
    materials: str = Field(..., description="What Materials or If they are needed")
    setting: str = Field(..., description="Virtual / In-Person")

# Response schema
class IceBreakerResponse(BaseModel):
    activity: str

@router.post("", response_model=IceBreakerResponse, status_code=status.HTTP_200_OK)
async def get_icebreaker_activity(request: IceBreakerRequest):
    """
    Generate a lesson plan using the RAG pipeline based on the specified disorder, topic, grade level, and additional requirements.
    """
    try:
        question = "Give me an icebreaker that requires no materials"
        materials_filter = "No Materials are necessary for this activity."
        disorder="dyslexic"
        setting="In-Person"

        # rag_text = generate_icebreaker(
        #     materials=materials_filter,
        #     question=question,
        #     disorder=disorder
        # )
        rag_text = """**Title:** Marooned
**Objective:** To help participants learn to work together for the greater good of the group while also expressing their own individual feelings and perspectives.
**Materials Needed:** None
**Instructions:** You are marooned on an island. Your objective is to choose five items you would bring with you if you knew there was a chance that you might be stranded. Rules Note that each team is only allowed five items per team, not per person. Each team must discuss and defend their choices with the whole group.
**Debrief / Discussion Points:** Was the object you wanted selected by the group? For those of you whose objects weren't selected, how did it make you feel? How did you all determine what objects should and should not be brought? What might this activity symbolize within our own fraternal experiences?
**Additional Details:** Tips for Success: This activity helps members learn about others' values and problem-solving styles, and promotes teamwork. The value of the items selected to bring should be discussed and compared."""

        print(rag_text)
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
