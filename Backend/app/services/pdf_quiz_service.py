from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from io import BytesIO
from typing import Dict, Any, List
import re

# Create a page number function for the PDF
def add_page_number(canvas, doc):
    """
    Add page numbers to each page of the PDF
    """
    page_num = canvas.getPageNumber()
    text = f"Page {page_num}"
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.grey)
    canvas.drawRightString(
        doc.pagesize[0] - 72,  # 72 points = 1 inch, right margin
        72 / 2,                # Half of the bottom margin
        text
    )

def generate_quiz_pdf(assessment_data):
    """
    Generate a PDF document from assessment data
    
    Args:
        assessment_data: The assessment data from the API request
        
    Returns:
        bytes: The generated PDF as bytes
    """
    # Create a buffer to store the PDF
    buffer = BytesIO()
    
    # Extract assessment data
    assessment = assessment_data.assessment
    exec_skills = assessment_data.exec_skills
    
    # Create a PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=16,
        textColor=colors.navy,
        spaceAfter=10
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.navy,
        spaceAfter=5,
        spaceBefore=2
    )
    
    subheading_style = ParagraphStyle(
        'Subheading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.darkblue,
        spaceAfter=2,
        spaceBefore=2
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=5
    )
    
    list_style = ParagraphStyle(
        'List',
        parent=styles['Normal'],
        fontSize=10,
        leftIndent=20
    )
    
    # Create bold label style for section labels
    bold_label_style = ParagraphStyle(
        'BoldLabel',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica-Bold',
        textColor=colors.black,
        spaceAfter=2
    )
    
    # Create the content for the PDF
    content = []
    
    # Add title
    if assessment.title:
        content.append(Paragraph(assessment.title, title_style))
    else:
        content.append(Paragraph(f"{assessment.subject or ''} Assessment", title_style))
    
    content.append(Spacer(1, 0.2 * inch))
    
    # Add metadata table
    metadata = []
    if assessment.subject:
        metadata.append(['Subject', assessment.subject])
    if assessment.grade:
        metadata.append(['Grade', assessment.grade])
    if assessment.topic:
        metadata.append(['Topic', assessment.topic])
    if assessment.subtopic:
        metadata.append(['Sub-Topic', assessment.subtopic])
    
    if metadata:
        # Adjust column widths to give more space for the content column
        metadata_table = Table(metadata, colWidths=[1.2 * inch, 4.3 * inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.darkblue),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Align content to top for better wrapping
        ]))
        content.append(metadata_table)
        content.append(Spacer(1, 0.2 * inch))
    
    # Add executive function skills
    if exec_skills:
        content.append(Paragraph('Executive Function Skills', heading_style))
        skills_text = ', '.join(exec_skills)
        content.append(Paragraph(skills_text, normal_style))
        content.append(Spacer(1, 0.2 * inch))
    
    # Create style for question box
    question_style = ParagraphStyle(
        'Question',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=10,
        rightIndent=10,
        spaceBefore=5,
        spaceAfter=5,
        leading=14  # Increased line spacing
    )
    
    # Create style for executive function strategy with a box
    strategy_style = ParagraphStyle(
        'Strategy',
        parent=styles['Normal'],
        fontSize=10,
        leftIndent=10,
        rightIndent=10,
        spaceBefore=5,
        spaceAfter=5,
        borderWidth=1,
        borderColor=colors.black,
        borderPadding=5,
        borderRadius=5,
        backColor=colors.lightgrey.clone(alpha=0.3)
    )
    
    # Create style for question options
    option_style = ParagraphStyle(
        'Option',
        parent=styles['Normal'],
        fontSize=10,
        leftIndent=20,
        spaceBefore=2,
        spaceAfter=2
    )
    
    # Create style for question number
    question_number_style = ParagraphStyle(
        'QuestionNumber',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=1  # Center alignment
    )
    
    # Add a decorative header for the assessment questions
    content.append(Spacer(1, 0.1 * inch))
    
    # Add a simple, elegant header for assessment questions
    content.append(Paragraph('Assessment Questions', heading_style))
    content.append(Spacer(1, 0.2 * inch))
    
    # Check if we have structured questions data
    if hasattr(assessment, 'questions') and assessment.questions:
        # Use the structured questions data
        for i, question in enumerate(assessment.questions):
            # Get question number from the question object or use the index
            question_num = getattr(question, 'number', None) or (i + 1)
            
            # Create a simple, elegant question format
            question_elements = []
            
            # Add question number and type
            if hasattr(question, 'type') and question.type:
                question_elements.append(Paragraph(f"<b>Question {question_num}</b> <i>({question.type})</i>", subheading_style))
            else:
                question_elements.append(Paragraph(f"<b>Question {question_num}</b>", subheading_style))
            
            # Add the question text with proper formatting
            if hasattr(question, 'text') and question.text:
                # Clean markdown characters from the text
                cleaned_text = question.text
                cleaned_text = cleaned_text.replace('**', '')  # Remove bold markdown
                cleaned_text = cleaned_text.replace('##', '')  # Remove heading markdown
                cleaned_text = cleaned_text.replace('*', '')   # Remove italic markdown
                
                question_elements.append(Paragraph(cleaned_text, question_style))
            else:
                question_elements.append(Paragraph("No question text available", question_style))
            
            # Add options if available with simple, elegant formatting
            if hasattr(question, 'options') and question.options:
                # Add each option as a separate paragraph instead of a list
                for option in question.options:
                    # Clean markdown characters from options
                    cleaned_option = option
                    cleaned_option = cleaned_option.replace('**', '')  # Remove bold markdown
                    cleaned_option = cleaned_option.replace('##', '')  # Remove heading markdown
                    cleaned_option = cleaned_option.replace('*', '')   # Remove italic markdown
                    
                    # Add each option as a separate paragraph with proper indentation
                    question_elements.append(Paragraph(cleaned_option, option_style))
                    # Add a small space between options
                    question_elements.append(Spacer(1, 0.05 * inch))
            
            # Add executive function strategy if available with simple styling
            if hasattr(question, 'strategy') and question.strategy:
                question_elements.append(Spacer(1, 0.1 * inch))
                
                # Clean markdown characters from strategy
                cleaned_strategy = question.strategy
                cleaned_strategy = cleaned_strategy.replace('**', '')  # Remove bold markdown
                cleaned_strategy = cleaned_strategy.replace('##', '')  # Remove heading markdown
                cleaned_strategy = cleaned_strategy.replace('*', '')   # Remove italic markdown
                
                question_elements.append(Paragraph("<b>Executive Function Strategy:</b>", bold_label_style))
                question_elements.append(Paragraph(cleaned_strategy, normal_style))
            
            # Add each element to the content directly
            for element in question_elements:
                content.append(element)
            
            # Add a thin separator line between questions
            separator = Table([['']],  colWidths=[5.5 * inch])
            separator.setStyle(TableStyle([
                ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            content.append(separator)
            content.append(Spacer(1, 0.2 * inch))  # Space between questions
    else:
        # Parse the markdown content
        assessment_text = assessment.content
        
        # Split the content by question patterns
        # Look for patterns like "1.", "Question 1:", etc.
        question_pattern = r'(?:^|\n)(?:\d+\.\s+|\*\*Question\s+\d+\*\*:?\s+|Question\s+\d+:?\s+)'
        questions = re.split(question_pattern, assessment_text)
        
        # Remove any empty strings from the split
        questions = [q.strip() for q in questions if q.strip()]
        
        # Process each question
        for i, question_text in enumerate(questions):
            question_num = i + 1
            
            # Simple question formatting for unstructured content
            content.append(Paragraph(f"<b>Question {question_num}</b>", subheading_style))
            content.append(Paragraph(question_text, question_style))
            
            # Add a thin separator line between questions
            separator = Table([['']],  colWidths=[5.5 * inch])
            separator.setStyle(TableStyle([
                ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            content.append(separator)
            content.append(Spacer(1, 0.2 * inch))
    
    # Build the PDF with page numbers
    doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    # Get the value of the BytesIO buffer
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
