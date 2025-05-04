from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from io import BytesIO
from app.services.pdf_lesson_service import generate_lesson_pdf
from app.services.pdf_quiz_service import generate_quiz_pdf
from app.services.pdf_icebreaker_service import generate_icebreaker_pdf

router = APIRouter()

class SectionModel(BaseModel):
    title: str
    method: str
    activities: str
    executiveFunction: str

class LessonPlanModel(BaseModel):
    title: Optional[str] = None
    objective: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    strand: Optional[str] = None
    topic: Optional[str] = None
    primarySOL: Optional[str] = None
    materials: Optional[str] = None
    vocabulary: Optional[str] = None
    sections: List[SectionModel]

class LessonPlanPDF(BaseModel):
    exec_skills: List[str]
    lessonPlan: LessonPlanModel

class QuestionModel(BaseModel):
    text: str
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None

class AssessmentModel(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    content: str
    questions: Optional[List[QuestionModel]] = None

class AssessmentPDF(BaseModel):
    exec_skills: List[str]
    assessment: AssessmentModel

class IcebreakerModel(BaseModel):
    title: Optional[str] = None
    objective: Optional[str] = None
    materials: Optional[str] = None
    instructions: List[str] = []
    questions: List[str] = []
    debrief: List[str] = []
    tips: List[str] = []
    variations: List[str] = []

class IcebreakerPDF(BaseModel):
    disorder: Optional[str] = None  # Made disorder optional
    setting: str
    activity: Optional[str] = None
    materials: Optional[str] = None
    exec_skills: List[str] = []
    icebreaker: IcebreakerModel

@router.post("/generate-lesson-pdf")
async def generate_lesson_pdf_endpoint(lesson_plan_data: LessonPlanPDF):
    # Generate the PDF using the service function
    pdf = generate_lesson_pdf(lesson_plan_data)
    
    # Create a response with the PDF - include grade level in filename
    filename = f"Grade{lesson_plan_data.lessonPlan.grade or ''}_{lesson_plan_data.lessonPlan.title or 'Lesson_Plan'}.pdf"
    filename = filename.replace(' ', '_')
    
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    
    return StreamingResponse(
        BytesIO(pdf), 
        media_type="application/pdf",
        headers=headers
    )

@router.post("/generate-quiz-pdf")
async def generate_quiz_pdf_endpoint(assessment_data: AssessmentPDF):
    # Generate the PDF using the service function
    pdf = generate_quiz_pdf(assessment_data)
    
    # Create a response with the PDF
    subject = assessment_data.assessment.subject or ''
    topic = assessment_data.assessment.topic or ''
    filename = f"{subject}_{topic}_Assessment.pdf"
    filename = filename.replace(' ', '_')
    
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    
    return StreamingResponse(
        BytesIO(pdf), 
        media_type="application/pdf",
        headers=headers
    )

@router.post("/generate-icebreaker-pdf")
async def generate_icebreaker_pdf_endpoint(icebreaker_data: IcebreakerPDF):
    # Generate the PDF using the service function
    pdf = generate_icebreaker_pdf(icebreaker_data)
    
    # Create a response with the PDF
    title = icebreaker_data.icebreaker.title or 'Icebreaker_Activity'
    filename = f"{title}.pdf"
    filename = filename.replace(' ', '_')
    
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    
    return StreamingResponse(
        BytesIO(pdf), 
        media_type="application/pdf",
        headers=headers
    )
