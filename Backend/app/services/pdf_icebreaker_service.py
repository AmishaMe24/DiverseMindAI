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

def generate_icebreaker_pdf(icebreaker_data):
    """
    Generate a PDF document from icebreaker activity data
    
    Args:
        icebreaker_data: The icebreaker data from the API request
        
    Returns:
        bytes: The generated PDF as bytes
    """
    # Create a buffer to store the PDF
    buffer = BytesIO()
    
    # Extract icebreaker data
    icebreaker = icebreaker_data.icebreaker
    disorder = getattr(icebreaker_data, 'disorder', None)  # Make disorder optional
    setting = icebreaker_data.setting
    activity = icebreaker_data.activity
    materials_input = icebreaker_data.materials
    
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
    if icebreaker.title:
        content.append(Paragraph(icebreaker.title, title_style))
    else:
        content.append(Paragraph("Icebreaker Activity", title_style))
    
    content.append(Spacer(1, 0.2 * inch))
    
    # Add metadata table
    metadata = []
    if disorder:
        metadata.append(['Disorder', disorder])
    if setting:
        metadata.append(['Setting', setting])
    if activity:
        metadata.append(['Activity Type', activity])
    
    # Add executive skills if available
    exec_skills = getattr(icebreaker_data, 'exec_skills', None)
    if exec_skills:
        # Create a separate table for executive skills with better formatting
        content.append(Paragraph('Executive Function Skills', heading_style))
        
        # Create a table for executive skills
        exec_skills_data = [[Paragraph('<b>Executive Function Skills</b>', bold_label_style), 
                            Paragraph(', '.join(exec_skills), normal_style)]]
        
        exec_skills_table = Table(exec_skills_data, colWidths=[2 * inch, 3.5 * inch])
        exec_skills_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.lightblue.clone(alpha=0.3)),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.navy),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        content.append(exec_skills_table)
        content.append(Spacer(1, 0.2 * inch))
    
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
    if icebreaker.objective:
        content.append(Paragraph('Objective', heading_style))
        content.append(Paragraph(icebreaker.objective, normal_style))
        content.append(Spacer(1, 0.1 * inch))
    
    # Add materials
    if icebreaker.materials:
        content.append(Paragraph('Materials Needed', heading_style))
        content.append(Paragraph(icebreaker.materials, normal_style))
        content.append(Spacer(1, 0.1 * inch))
    
    # Add instructions
    if icebreaker.instructions:
        content.append(Paragraph('Instructions', heading_style))
        
        # Create a list of instructions
        instructions_items = []
        for i, instruction in enumerate(icebreaker.instructions):
            instructions_items.append(
                ListItem(Paragraph(instruction, list_style), leftIndent=20)
            )
        
        if instructions_items:
            instructions_list = ListFlowable(
                instructions_items,
                bulletType='1',
                leftIndent=20,
                bulletFontSize=10
            )
            content.append(instructions_list)
            content.append(Spacer(1, 0.1 * inch))
    
    # Add sample questions
    if icebreaker.questions:
        content.append(Paragraph('Sample Questions', heading_style))
        
        # Create a list of questions
        questions_items = []
        for question in icebreaker.questions:
            questions_items.append(
                ListItem(Paragraph(question, list_style), leftIndent=20)
            )
        
        if questions_items:
            questions_list = ListFlowable(
                questions_items,
                bulletType='bullet',
                leftIndent=20,
                bulletFontSize=8
            )
            content.append(questions_list)
            content.append(Spacer(1, 0.1 * inch))
    
    # Add debrief points
    if icebreaker.debrief:
        content.append(Paragraph('Debrief / Discussion Points', heading_style))
        
        # Create a list of debrief points
        debrief_items = []
        for point in icebreaker.debrief:
            debrief_items.append(
                ListItem(Paragraph(point, list_style), leftIndent=20)
            )
        
        if debrief_items:
            debrief_list = ListFlowable(
                debrief_items,
                bulletType='bullet',
                leftIndent=20,
                bulletFontSize=8
            )
            content.append(debrief_list)
            content.append(Spacer(1, 0.1 * inch))
    
    # Add tips for success
    if icebreaker.tips:
        content.append(Paragraph('Tips for Success', heading_style))
        
        # Create a list of tips
        tips_items = []
        for tip in icebreaker.tips:
            tips_items.append(
                ListItem(Paragraph(tip, list_style), leftIndent=20)
            )
        
        if tips_items:
            tips_list = ListFlowable(
                tips_items,
                bulletType='bullet',
                leftIndent=20,
                bulletFontSize=8
            )
            content.append(tips_list)
            content.append(Spacer(1, 0.1 * inch))
    
    # Add variations
    if icebreaker.variations:
        content.append(Paragraph('Variations', heading_style))
        
        # Create a list of variations
        variations_items = []
        for variation in icebreaker.variations:
            variations_items.append(
                ListItem(Paragraph(variation, list_style), leftIndent=20)
            )
        
        if variations_items:
            variations_list = ListFlowable(
                variations_items,
                bulletType='bullet',
                leftIndent=20,
                bulletFontSize=8
            )
            content.append(variations_list)
            content.append(Spacer(1, 0.1 * inch))
    
    # Build the PDF with page numbers
    doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    # Get the value of the BytesIO buffer
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
