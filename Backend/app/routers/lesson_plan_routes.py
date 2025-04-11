from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from chromadb.config import Settings
from chromadb import PersistentClient
from app.services.lesson_plan_service import generate_adaptive_lesson_plan


router = APIRouter()

# Request schema
class LessonPlanRequest(BaseModel):
    disorder: str = Field(..., description="Learning disorder or condition to address")
    topic: str = Field(..., description="Mathematical topic for the lesson")
    grade: str = Field(..., description="Grade level for the lesson")
    additional_info: Optional[str] = Field(None, description="Additional information or requirements")
    prompt: str = Field(..., description="Main prompt for lesson plan generation")

# Response schema
class LessonPlanResponse(BaseModel):
    title: str
    lessonName: str
    gradeLevel: str
    concept: str
    examples: List[Dict[str, Any]]

@router.post("", response_model=LessonPlanResponse, status_code=status.HTTP_200_OK)
async def get_lesson_plan(request: LessonPlanRequest):
    """
    Generate a lesson plan using the RAG pipeline based on the specified disorder, topic, grade level, and additional requirements.
    """
    try:
        # Normalize input
        # disorder = request.disorder.lower().strip().replace(" ", "_")
        # topic = request.topic.lower().strip().replace(" ", "_")
        # grade = request.grade.lower().strip().replace(" ", "_")

        subject = 'Number and Number Sense'
        topic = 'Reading, writing, and identifying the place value of six-digit numerals'
        grade = '3'
        disorder = 'dyscalculia'

        

        # Call the RAG pipeline
        rag_text = generate_adaptive_lesson_plan(
            grade=grade,
            topic=topic,
            subject = subject,
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
