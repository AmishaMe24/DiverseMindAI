from fastapi import HTTPException, status, APIRouter
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.services.assesment_service import generate_assesment

router = APIRouter()

# Request schema
class AssessmentRequest(BaseModel):
    subject: str = Field(..., description="Subject for the assessment")
    disorder: str = Field(..., description="Learning disorder or condition to address")
    topic: str = Field(..., description="Mathematical topic for the assessment")
    grade: str = Field(..., description="Grade level for the assessment")

# Response schema
class AssessmentResponse(BaseModel):
    title: str
    assessment: str
    gradeLevel: str
    topic: str

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_200_OK)
async def get_assessment(request: AssessmentRequest):
    """
    Generate an assessment using the RAG pipeline based on the specified disorder, 
    topic, grade level, and additional requirements.
    """
    try:
        subject = request.subject
        topic = request.topic
        grade = request.grade
        disorder = request.disorder

        # Call the RAG pipeline
        assessment_text = generate_assesment(
            grade=grade,
            topic=topic,
            subject=subject,
            disorder=disorder
        )

        if not assessment_text:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "message": "RAG model could not generate an assessment.",
                    "inputs": request.dict(),
                    "suggestion": "Double-check the topic/disorder/grade or improve the prompt."
                }
            )

        # Create a properly structured response
        response = {
            "title": "Adaptive Math Assessment",
            "assessment": assessment_text,
            "gradeLevel": f"Grade {grade}",
            "topic": topic
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "An unexpected error occurred while generating the assessment.",
                "error": str(e),
            },
        )