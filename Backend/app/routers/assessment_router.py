from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.services.assesment_service import generate_assesment

router = APIRouter()

# Request schema
class AssessmentRequest(BaseModel):
    subject: str = Field(..., description="Subject for the assessment")
    topic: str = Field(..., description="Mathematical topic for the assessment")
    subtopic: Optional[str] = Field(None, description="Subtopic (required only for Maths)")
    grade: str = Field(..., description="Grade level for the assessment")
    exec_skills: Optional[List[str]] = Field(default_factory=list, description="List of executive skills to address")

# Response schema
class AssessmentResponse(BaseModel):
    title: str
    assessment: str
    gradeLevel: str
    topic: str

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_200_OK)
async def get_assessment(request: AssessmentRequest):
    """
    Generate an assessment using the RAG pipeline based on the specified skills, 
    topic, grade level, and additional requirements.
    """
    try:
        subject = request.subject
        topic = request.topic
        subtopic = request.subtopic
        grade = request.grade
        exec_skills = request.exec_skills

        # Call the RAG pipeline
        assessment_text = generate_assesment(
            grade=grade,
            subject = subject,
            topic=topic,
            subtopic=subtopic,
            exec_skills = exec_skills
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