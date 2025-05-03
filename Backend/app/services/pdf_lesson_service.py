from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from io import BytesIO
from typing import Dict, Any, List

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

def generate_lesson_pdf(lesson_plan_data):
    """
    Generate a PDF document from lesson plan data
    
    Args:
        lesson_plan_data: The lesson plan data from the API request
        
    Returns:
        bytes: The generated PDF as bytes
    """
    # Create a buffer to store the PDF
    buffer = BytesIO()
    
    # Extract lesson plan data
    lesson_plan = lesson_plan_data.lessonPlan
    exec_skills = lesson_plan_data.exec_skills
    
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
    
    # Create style for executive function strategy content with a box
    exec_function_style = ParagraphStyle(
        'ExecFunction',
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
    
    # Create the content for the PDF
    content = []
    
    # Add title
    if lesson_plan.title:
        content.append(Paragraph(lesson_plan.title, title_style))
    else:
        content.append(Paragraph(f"{lesson_plan.subject or ''} Lesson Plan", title_style))
    
    content.append(Spacer(1, 0.2 * inch))
    
    # Add metadata table
    metadata = []
    if lesson_plan.grade:
        metadata.append(['Grade', lesson_plan.grade])
    if lesson_plan.subject:
        metadata.append(['Subject', lesson_plan.subject])
    if lesson_plan.topic:
        metadata.append(['Topic', lesson_plan.topic])
    if lesson_plan.strand:
        metadata.append(['Strand', lesson_plan.strand])
    if lesson_plan.primarySOL:
        # Create a paragraph for the Primary SOL to enable text wrapping
        sol_paragraph = Paragraph(lesson_plan.primarySOL, normal_style)
        metadata.append(['Primary SOL', sol_paragraph])
    
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
    
    # Add objective
    if lesson_plan.objective:
        content.append(Paragraph('Objective', heading_style))
        content.append(Paragraph(lesson_plan.objective, normal_style))
        content.append(Spacer(1, 0.1 * inch))
    
    # Add executive function skills
    if exec_skills:
        content.append(Paragraph('Executive Function Skills', heading_style))
        skills_text = ', '.join(exec_skills)
        content.append(Paragraph(skills_text, normal_style))
        content.append(Spacer(1, 0.1 * inch))
    
    # Add materials
    if lesson_plan.materials:
        content.append(Paragraph('Materials Needed', heading_style))
        
        # Display materials as a single line of text, regardless of format
        materials = lesson_plan.materials
        # Remove any bullet points if they exist
        if ',' in materials or materials.startswith('-') or materials.startswith('*'):
            # Split by commas or bullet points
            if ',' in materials:
                materials_list = materials.split(',')
            else:
                materials_list = materials.replace('- ', '').replace('* ', '').split('\n')
            
            # Clean up each item and join with commas
            cleaned_materials = []
            for item in materials_list:
                item_text = item.strip()
                if item_text:
                    # Remove any leading bullet points or dashes
                    item_text = item_text.lstrip('-* ')
                    cleaned_materials.append(item_text)
            
            # Join all materials with commas
            materials = ', '.join(cleaned_materials)
        
        # Display as a single paragraph
        content.append(Paragraph(materials, normal_style))
        content.append(Spacer(1, 0.1 * inch))
        
    # Add vocabulary
    if lesson_plan.vocabulary:
        content.append(Paragraph('Vocabulary', heading_style))
        content.append(Paragraph(lesson_plan.vocabulary, normal_style))
        content.append(Spacer(1, 0.1 * inch))
    
    # Add sections - now guaranteed to have title, method, activities, and executiveFunction
    if lesson_plan.sections:
        content.append(Paragraph('Lesson Plan', heading_style))
        content.append(Spacer(1, 0.1 * inch))
        
        for i, section in enumerate(lesson_plan.sections):
            # Add section title
            content.append(Paragraph(section.title, subheading_style))
            
            # Add method with bold label
            content.append(Paragraph('<b>Method:</b>', bold_label_style))
            content.append(Paragraph(section.method, normal_style))
            content.append(Spacer(1, 0.05 * inch))
            
            # Add activities with bold label
            content.append(Paragraph('<b>Activities:</b>', bold_label_style))
            
            # Process activities - handle bullet points
            activities = section.activities
            if activities.startswith('- '):
                activities_list = activities.split('- ')
                activities_items = []
                for item in activities_list:
                    item_text = item.strip()
                    if item_text:
                        activities_items.append(ListItem(Paragraph(item_text, list_style)))
                
                if activities_items:
                    activities_flowable = ListFlowable(
                        activities_items,
                        bulletType='bullet',
                        leftIndent=20,
                        bulletFontSize=8
                    )
                    content.append(activities_flowable)
            else:
                content.append(Paragraph(activities, normal_style))
            
            content.append(Spacer(1, 0.05 * inch))
            
            # Add executive function strategy with bold label and box
            content.append(Paragraph('<b>Executive Function Strategy:</b>', bold_label_style))
            
            # Create a table for the executive function strategy with a border
            exec_table = Table([[Paragraph(section.executiveFunction, normal_style)]], 
                              colWidths=[5.5 * inch])
            exec_table.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey.clone(alpha=0.3)),
                ('PADDING', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            content.append(exec_table)
            
            content.append(Spacer(1, 0.2 * inch))
    
    # Build the PDF with page numbers
    doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    # Get the value of the BytesIO buffer
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes