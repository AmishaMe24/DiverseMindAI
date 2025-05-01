from fastapi import HTTPException, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from chromadb.config import Settings
from chromadb import PersistentClient
from app.services.lesson_plan_service import generate_adaptive_lesson_plan


router = APIRouter()

# Request schema
class LessonPlanRequest(BaseModel):
    subject: str = Field(..., description="Subject for the lesson plan")
    topic: str = Field(..., description="Topic for the lesson based on the subject")
    subtopic: Optional[str] = Field(None, description="Subtopic (required only for Maths)")
    grade: str = Field(..., description="Grade level for the lesson")
    exec_skills: Optional[List[str]] = Field(default_factory=list, description="List of executive skills to address")


# Response schema
class LessonPlanResponse(BaseModel):
    title: str
    lessonName: str
    gradeLevel: str
    concept: str
    lessonPlan: str

@router.post("", response_model=LessonPlanResponse, status_code=status.HTTP_200_OK)
async def get_lesson_plan(request: LessonPlanRequest):
    """
    Generate a lesson plan using the RAG pipeline based on the specified disorder, topic, grade level, and additional requirements.
    """
    try:
        # subject = 'Measurement and Geometry'
        # topic = 'Money Counts'
        # grade = '3'
        # disorder = 'dyscalculia'
        
        # print("Hard coded: ", subject, topic, grade, disorder)
        
        subject = request.subject
        topic = request.topic
        subtopic=request.subtopic
        grade = request.grade
        exec_skills = request.exec_skills
        
        print("From request param", subject, topic, subtopic, grade, exec_skills)

        # Call the RAG pipeline
        rag_text = generate_adaptive_lesson_plan(
            grade= grade,
            subject= subject,
            topic= topic,
            subtopic = subtopic,
            exec_skills = exec_skills,
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
            "title": "Adaptive Math Lesson Plan",
            "lessonName": f"Math Lesson: {topic}",
            "gradeLevel": f"Grade {grade}",
            "concept": topic,
            "lessonPlan": rag_text,  # The raw text from your LLM
            "examples": []  # Empty array for now
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
