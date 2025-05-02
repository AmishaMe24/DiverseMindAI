from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.lib.units import inch
from io import BytesIO
import re
from reportlab.pdfgen import canvas

# Create a custom flowable for the boxed executive function strategy
class BoxedText(Flowable):
    def __init__(self, title, content, width=6*inch, padding=6):
        Flowable.__init__(self)
        self.title = title
        self.content = content
        self.width = width
        self.padding = padding
        self.height = 0  # Will be calculated during wrap
        
    def wrap(self, availWidth, availHeight):
        # Create paragraph objects to calculate their heights
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'BoxTitle',
            parent=styles['Heading3'],
            textColor=colors.black,
            fontName='Helvetica-Bold'
        )
        content_style = ParagraphStyle(
            'BoxContent',
            parent=styles['Normal'],
            textColor=colors.black
        )
        
        title_p = Paragraph(self.title, title_style)
        content_p = Paragraph(self.content, content_style)
        
        # Calculate space needed
        title_w, title_h = title_p.wrap(self.width - 2*self.padding, availHeight)
        content_w, content_h = content_p.wrap(self.width - 2*self.padding, availHeight)
        
        # Store for drawing
        self.title_p = title_p
        self.content_p = content_p
        self.title_h = title_h
        self.content_h = content_h
        
        # Total height with padding
        self.height = title_h + content_h + 3*self.padding
        
        return self.width, self.height
    
    def draw(self):
        # Draw the box
        self.canv.setStrokeColor(colors.black)
        # Define a custom light blue that matches your product theme
        theme_light_blue = colors.lightgrey
        self.canv.setFillColor(theme_light_blue)  # Using theme color instead of generic lightgrey
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=1)
        
        # Draw the title
        self.title_p.drawOn(self.canv, self.padding, self.height - self.title_h - self.padding)
        
        # Draw a line under the title
        self.canv.setStrokeColor(colors.black)
        self.canv.line(self.padding, self.height - self.title_h - 1.5*self.padding, 
                      self.width - self.padding, self.height - self.title_h - 1.5*self.padding)
        
        # Draw the content
        self.content_p.drawOn(self.canv, self.padding, self.height - self.title_h - self.content_h - 2*self.padding)

def process_markdown_for_reportlab(text):
    """
    Process markdown text to convert it to ReportLab's paragraph markup
    """
    # Convert bold markdown (**text**) to ReportLab bold (<b>text</b>)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    
    # Convert italic markdown (*text*) to ReportLab italic (<i>text</i>)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    
    # Remove horizontal rules (---)
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
    
    return text

# Create a page number class
class PageNumberCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_page_number(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        page_num = self._pageNumber
        text = f"Page {page_num} of {page_count}"
        self.setFont("Helvetica", 9)
        self.drawRightString(letter[0] - 72, 0.5 * inch, text)

def generate_lesson_pdf(lesson_plan_data):
    """
    Generate a PDF for a lesson plan
    
    Args:
        lesson_plan_data: A dictionary containing lesson plan information
        
    Returns:
        BytesIO: A buffer containing the generated PDF
    """
    # Create a BytesIO buffer to receive PDF data
    buffer = BytesIO()
    
    # Create the PDF document using ReportLab with our custom canvas for page numbers
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=72)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        textColor=colors.black  # Ensure title is black
    )
    
    # Custom styles - all with black text
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        textColor=colors.black,  # Changed from blue to black
        spaceAfter=5
    )
    
    # Create a custom normal style with more space after paragraphs
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        textColor=colors.black,  # Ensure text is black
        spaceAfter=5
    )
    
    # Create a custom bullet style with more space
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        textColor=colors.black,  # Ensure text is black
        leftIndent=20,
        spaceAfter=5,
        spaceBefore=5 
    )
    
    # Add title
    elements.append(Paragraph(f"{lesson_plan_data.lessonName}", title_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Add metadata table
    metadata = [
        ["Subject", lesson_plan_data.subject],
        ["Grade Level", lesson_plan_data.grade],
        ["Topic", lesson_plan_data.topic]
    ]
    
    if lesson_plan_data.subtopic:
        metadata.append(["Sub-Topic", lesson_plan_data.subtopic])
    
    # Format executive skills
    exec_skills_str = ", ".join(lesson_plan_data.exec_skills)
    metadata.append(["Executive Function Skills", exec_skills_str])
    
    # Create the table with Paragraph objects for better text wrapping
    data = []
    for row in metadata:
        data.append([
            Paragraph(row[0], ParagraphStyle('TableHeader', fontName='Helvetica-Bold')),
            Paragraph(row[1], ParagraphStyle('TableCell', wordWrap='CJK', leading=14))
        ])
    
    # Create the table
    metadata_table = Table(data, colWidths=[1.5*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),  # Change back to light grey for header column
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),  # Ensure header text is black
        ('TEXTCOLOR', (1, 0), (1, -1), colors.black),  # Ensure content text is black
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Align text to top of cell
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(metadata_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add concept
    elements.append(Paragraph("Concept", section_title))
    elements.append(Paragraph(lesson_plan_data.concept, normal_style))
    
    # Process and add lesson plan content
    elements.append(Paragraph("Lesson Plan", section_title))
    
    # Clean the lesson plan text to remove dashes
    cleaned_lesson_plan = lesson_plan_data.lessonPlan.replace("---", "")
    
    # Split the markdown content by lines and process it
    lines = cleaned_lesson_plan.split('\n')
    current_text = ""
    
    # Track if we're processing a numbered section to control spacing
    in_numbered_section = False
    
    # Variables to track executive function strategy sections
    in_exec_strategy = False
    exec_strategy_title = ""
    exec_strategy_content = ""
    
    for i, line in enumerate(lines):
        # Skip lines that are just dashes
        if re.match(r'^-+$', line.strip()):
            continue
            
        # Process the line to convert markdown to ReportLab markup
        processed_line = process_markdown_for_reportlab(line)
        
        # Check if this is a numbered heading (like "5. Title")
        is_numbered_heading = re.match(r'^\d+\.\s+', line.strip())
        
        # Check if this is an Executive Function Strategy section
        if "Executive Function Strategy:" in line:
            # If there's accumulated text, add it first
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            
            # Start collecting the executive function strategy content
            in_exec_strategy = True
            
            # Extract the full title including text after the colon
            strategy_match = re.search(r'Executive Function Strategy:(.+)', line)
            if strategy_match and strategy_match.group(1).strip():
                # Process any markdown in the strategy title (like bold text)
                strategy_title_text = process_markdown_for_reportlab("Executive Function Strategy:" + strategy_match.group(1))
                exec_strategy_title = strategy_title_text
            else:
                exec_strategy_title = "Executive Function Strategy"
                
            exec_strategy_content = ""
            continue
        
        # If we're in an executive function strategy section, collect the content
        if in_exec_strategy:
            # Check if we've reached the end of the executive function strategy section
            # (next section heading or empty line followed by heading)
            next_line_is_heading = False
            if i < len(lines) - 1:
                next_line = lines[i + 1].strip()
                next_line_is_heading = (next_line.startswith('#') or 
                                       re.match(r'^\d+\.\s+', next_line) or
                                       "Method:" in next_line or
                                       "Activities:" in next_line)
            
            if (is_numbered_heading or line.startswith('#') or 
                "Method:" in line or "Activities:" in line or next_line_is_heading):
                # End of executive function strategy section
                if exec_strategy_content:
                    # Add the boxed executive function strategy
                    elements.append(Spacer(1, 0.1*inch))
                    elements.append(BoxedText(exec_strategy_title, exec_strategy_content))
                    elements.append(Spacer(1, 0.1*inch))
                    in_exec_strategy = False
                    
                    # Process the current line normally (below)
                else:
                    # If there's no content yet, this line is part of the strategy
                    exec_strategy_content += processed_line
                    continue
            else:
                # Still in executive function strategy section
                if exec_strategy_content:
                    exec_strategy_content += "<br/>" + processed_line
                else:
                    exec_strategy_content = processed_line
                continue
        
        # Simple markdown processing
        if line.startswith('# '):
            # If there's accumulated text, add it first
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            # Add the heading
            elements.append(Paragraph(processed_line[2:], title_style))
            in_numbered_section = False
        elif line.startswith('## '):
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            elements.append(Paragraph(processed_line[3:], section_title))
            in_numbered_section = False
        elif line.startswith('### '):
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            elements.append(Paragraph(processed_line[4:], section_title))
            in_numbered_section = False
        elif is_numbered_heading:
            # Handle numbered headings (like "5. Real-Life Applications")
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            
            # Add only a small spacer before numbered headings (except the first one)
            if in_numbered_section:
                elements.append(Spacer(1, 0.1*inch))
            
            # Add the numbered heading with bold formatting
            elements.append(Paragraph(f"<b>{processed_line}</b>", section_title))
            in_numbered_section = True
        elif line.startswith('- '):
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            # Use the bullet style for bullet points to increase spacing
            elements.append(Paragraph("• " + processed_line[2:], bullet_style))
        elif line.strip() == '':
            if current_text:
                elements.append(Paragraph(current_text, normal_style))
                current_text = ""
            
            # Add smaller spacers for empty lines
            elements.append(Spacer(1, 0.05*inch))
        else:
            if current_text:
                current_text += "<br/>" + processed_line
            else:
                current_text = processed_line
    
    # Add any remaining text
    if current_text:
        elements.append(Paragraph(current_text, normal_style))
    
    # Add any remaining executive function strategy
    if in_exec_strategy and exec_strategy_content:
        elements.append(Spacer(1, 0.1*inch))
        elements.append(BoxedText(exec_strategy_title, exec_strategy_content))
        elements.append(Spacer(1, 0.1*inch))
    
    # Build the PDF with our custom canvas for page numbers
    doc.build(elements, canvasmaker=PageNumberCanvas)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf