from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from io import BytesIO
from app.services.pdf_lesson_service import generate_lesson_pdf

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

@router.post("/generate-lesson-pdf")
async def generate_pdf(lesson_plan_data: LessonPlanPDF):
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