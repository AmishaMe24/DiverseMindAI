import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { marked } from 'marked'

// Fallback markdown formatter using regex
const fallbackMarkdownFormatter = (markdown) => {
  if (!markdown) return ''

  // Basic formatting
  let formatted = markdown
    // Headers
    .replace(
      /^# (.*$)/gm,
      '<h1 style="font-size:24px; margin-top:24px; margin-bottom:12px; color:#2563EB;">$1</h1>'
    )
    .replace(
      /^## (.*$)/gm,
      '<h2 style="font-size:20px; margin-top:20px; margin-bottom:10px; color:#3B82F6;">$1</h2>'
    )
    .replace(
      /^### (.*$)/gm,
      '<h3 style="font-size:18px; margin-top:18px; margin-bottom:9px; color:#60A5FA;">$1</h3>'
    )
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Italic
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    // Lists
    .replace(/^\s*-\s(.*$)/gm, '• $1<br>')
    .replace(/^\s*\d+\.\s(.*$)/gm, (match, p1, offset, string) => {
      // Extract the number
      const num = string.substring(offset).match(/^\s*(\d+)\./)[1]
      return `${num}. ${p1}<br>`
    })
    // Line breaks
    .replace(/\n/g, '<br>')

  return formatted
}

// Generate and download PDF with enhanced styling
export const downloadQuizAsPDF = async (assessment, selected, dropdowns, setIsDownloading) => {
  if (!assessment) return

  setIsDownloading(true)

  try {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Set up document properties
    pdf.setProperties({
      title: assessment.title || 'Quiz',
      subject: `${selected.topic} - Grade ${selected.grade}`,
      creator: 'Quiz Maker Application',
    })

    // Add custom font if needed
    pdf.setFont('helvetica', 'normal')

    // Set margins
    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - margin * 2

    // Header with title and metadata styling
    let yPos = margin

    // Add title
    pdf.setFillColor(240, 249, 255) // Light blue background
    pdf.rect(margin, yPos, contentWidth, 20, 'F')
    pdf.setDrawColor(59, 130, 246) // Border color
    pdf.rect(margin, yPos, contentWidth, 20, 'S')

    pdf.setFontSize(16)
    pdf.setTextColor(30, 64, 175) // Dark blue for title
    pdf.setFont('helvetica', 'bold')
    pdf.text(assessment.title || 'Quiz', pageWidth / 2, yPos + 8, {
      align: 'center',
    })

    // Add metadata
    pdf.setFontSize(10)
    pdf.setTextColor(71, 85, 105) // Slate color for metadata
    pdf.setFont('helvetica', 'normal')

    const disorderLabel =
      dropdowns.disorder.options.find(
        (option) => option.value === selected.disorder
      )?.label || selected.disorder
    const subjectLabel =
      dropdowns.subject.options.find(
        (option) => option.value === selected.subject
      )?.label || selected.subject
    const topicLabel =
      dropdowns.topic.options.find(
        (option) => option.value === selected.topic
      )?.label || selected.topic
    const gradeLabel =
      dropdowns.grade.options.find(
        (option) => option.value === selected.grade
      )?.label || selected.grade

    const metadata = `Subject: ${subjectLabel} | Topic: ${topicLabel} | Grade Level: ${gradeLabel} | Adaptation: ${disorderLabel}`
    pdf.text(metadata, pageWidth / 2, yPos + 15, { align: 'center' })

    yPos += 25 // Move down

    // Try to convert markdown to HTML using marked
    let contentHtml = ''
    try {
      contentHtml = marked(assessment.assessment || '')
    } catch (err) {
      console.warn('Marked library failed, using fallback formatter', err)
      contentHtml = fallbackMarkdownFormatter(assessment.assessment || '')
    }

    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = contentHtml
    tempDiv.style.width = `${contentWidth}mm`
    tempDiv.style.padding = '10px'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.color = '#1F2937'
    tempDiv.style.backgroundColor = '#FFFFFF'
    tempDiv.style.lineHeight = '1.5'

    // Style specific elements in the HTML
    const styles = `
      h1, h2, h3, h4, h5, h6 { 
        color: #2563EB; 
        margin-top: 16px; 
        margin-bottom: 8px; 
      }
      h1 { font-size: 20px; }
      h2 { font-size: 18px; }
      h3 { font-size: 16px; }
      p { margin-bottom: 10px; }
      ul, ol { margin-left: 20px; padding-left: 0; }
      li { margin-bottom: 5px; }
      pre { 
        background-color: #F3F4F6; 
        padding: 10px; 
        border-radius: 5px; 
        white-space: pre-wrap; 
      }
      code { 
        font-family: monospace; 
        background-color: #F3F4F6; 
        padding: 2px 4px; 
        border-radius: 3px; 
      }
      blockquote {
        border-left: 4px solid #3B82F6;
        padding-left: 10px;
        margin-left: 0;
        font-style: italic;
        color: #4B5563;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 10px;
      }
      th, td {
        border: 1px solid #D1D5DB;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #F3F4F6;
        font-weight: bold;
      }
    `

    // Add styles to temp div
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    tempDiv.appendChild(styleElement)

    // Need to add tempDiv to the document for html2canvas to work
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    // Render content with html2canvas
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Handle multi-page content
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
      heightLeft -= pageHeight - yPos - margin
      position = heightLeft - imgHeight

      // Add new pages if content overflows
      while (heightLeft > 0) {
        pdf.addPage()
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight,
          '',
          'FAST',
          0,
          position
        )
        heightLeft -= pageHeight - margin * 2
        position -= pageHeight - margin * 2
      }

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - margin / 2
        )
      }

      // Save the PDF with a meaningful filename
      const fileName = `${
        assessment.title || 'Quiz'
      }_${topicLabel}_Grade${gradeLabel}.pdf`
      pdf.save(fileName)
    } finally {
      // Clean up the temporary element
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
  } finally {
    setIsDownloading(false)
  }
}