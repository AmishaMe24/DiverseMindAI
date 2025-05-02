from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from app.services.pdf_lesson_service import generate_lesson_pdf

router = APIRouter()

class LessonPlanPDF(BaseModel):
    lessonName: str
    concept: str
    lessonPlan: str
    subject: str
    grade: str
    topic: str
    subtopic: Optional[str] = None
    exec_skills: List[str]

@router.post("/generate-lesson-pdf")
async def generate_pdf(lesson_plan_data: LessonPlanPDF):
    # Generate the PDF using the service function
    pdf = generate_lesson_pdf(lesson_plan_data)
    
    # Create a response with the PDF - include grade level in filename
    filename = f"Grade{lesson_plan_data.grade}_{lesson_plan_data.lessonName.replace(' ', '_')}.pdf"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    
    return StreamingResponse(
        BytesIO(pdf), 
        media_type="application/pdf",
        headers=headers
    )