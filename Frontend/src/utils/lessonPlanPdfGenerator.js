import { marked } from 'marked'

// Function to convert markdown to HTML
export const markdownToHtml = (markdown) => {
  if (!markdown) return ''
  try {
    // Use marked to convert markdown to HTML
    return marked.parse(markdown)
  } catch (error) {
    console.error('Error parsing markdown:', error)
    // Fallback to simple formatting if marked fails
    return markdown
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^#{6}\s+(.*)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s+(.*)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s+(.*)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s+(.*)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.*)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>')
  }
}

// Function to generate PDF styles
const getPdfStyles = () => {
  return `
    <style>
      @page {
        margin: 2cm;
      }
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
      }
      h1 {
        color: #1e3a8a;
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 10px;
        font-size: 24px;
        margin-bottom: 20px;
      }
      h2 {
        color: #1e40af;
        font-size: 20px;
        margin-top: 30px;
        border-left: 4px solid #3b82f6;
        padding-left: 10px;
      }
      h3 {
        color: #2563eb;
        font-size: 18px;
        margin-top: 20px;
      }
      h4 {
        color: #3b82f6;
        font-size: 16px;
        margin-top: 16px;
      }
      h5, h6 {
        font-size: 14px;
        margin-top: 12px;
      }
      .header-info {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
      }
      .header-item {
        margin-bottom: 5px;
        font-size: 14px;
      }
      .section {
        margin-bottom: 30px;
      }
      .subsection {
        margin-bottom: 20px;
        border-left: 4px solid #3b82f6;
        padding-left: 12px;
      }
      .method-name {
        font-weight: bold;
        color: #2563eb;
        margin-bottom: 8px;
        font-size: 15px;
      }
      .strategy-box {
        background-color: #f0f4ff;
        padding: 12px 15px;
        border-radius: 5px;
        margin-top: 15px;
        border: 1px solid #dbeafe;
      }
      .strategy-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #1e40af;
      }
      ul, ol {
        padding-left: 20px;
        margin-top: 8px;
        margin-bottom: 15px;
      }
      li {
        margin-bottom: 5px;
      }
      p {
        margin-bottom: 12px;
      }
      strong {
        color: #1e40af;
      }
      .lesson-plan-content {
        background-color: #f9fafb;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #e5e7eb;
        margin-bottom: 25px;
      }
      .concept {
        font-style: italic;
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f3f4f6;
        border-radius: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      th, td {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        text-align: left;
      }
      th {
        background-color: #f3f4f6;
      }
      code {
        background-color: #f3f4f6;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 15px;
        margin-left: 0;
        color: #4b5563;
      }
    </style>
  `
}

// Generate examples HTML for PDF
const generateExamplesHtml = (examples) => {
  if (!examples || examples.length === 0) return ''

  return `
    <div class="section">
      <h2>Examples</h2>
      ${examples
        .map(
          (example) => `
        <div class="subsection">
          <h3>${example.section}</h3>
          ${
            example.methods
              ? example.methods
                  .map(
                    (method) => `
            <div style="margin-top: 15px;">
              <div class="method-name">${method.name}</div>
              <ul>
                ${
                  method.steps
                    ? method.steps
                        .map(
                          (step) => `
                  <li>${step}</li>
                `
                        )
                        .join('')
                    : ''
                }
              </ul>
            </div>
          `
                  )
                  .join('')
              : ''
          }
          
          ${
            example.executiveFunctionStrategy
              ? `
            <div class="strategy-box">
              <div class="strategy-title">${
                example.executiveFunctionStrategy.title
              }</div>
              <ul>
                ${
                  example.executiveFunctionStrategy.strategies
                    ? example.executiveFunctionStrategy.strategies
                        .map(
                          (strategy) => `
                    <li>${strategy}</li>
                  `
                        )
                        .join('')
                    : ''
                }
              </ul>
            </div>
          `
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>
  `
}

// Generate header info for PDF
const generateHeaderInfo = (lessonPlan, selected, dropdowns) => {
  const titleText = lessonPlan.lessonName || 'Generated Lesson Plan'
  
  return `
    <h1>${titleText}</h1>
    <div class="header-info">
      <div class="header-item"><strong>Subject:</strong> ${
        dropdowns.subject.options.find(
          (opt) => opt.value === selected.subject
        )?.label || selected.subject
      }</div>
      <div class="header-item"><strong>Topic:</strong> ${
        dropdowns.topic.options.find(
          (opt) => opt.value === selected.topic
        )?.label || selected.topic
      }</div>
      <div class="header-item"><strong>Grade Level:</strong> ${
        dropdowns.grade.options.find(
          (opt) => opt.value === selected.grade
        )?.label || selected.grade
      }</div>
      <div class="header-item"><strong>Accommodation For:</strong> ${
        dropdowns.disorder.options.find(
          (opt) => opt.value === selected.disorder
        )?.label || selected.disorder
      }</div>
    </div>
  `
}

// Main function to download lesson plan as PDF
export const downloadLessonPlanAsPDF = (lessonPlan, selected, dropdowns, setIsPdfLoading) => {
  if (!lessonPlan) return

  setIsPdfLoading(true)

  try {
    // Convert lesson plan markdown to HTML
    const lessonPlanHtml = markdownToHtml(lessonPlan.lessonPlan)

    // Use browser's print functionality to save as PDF
    const printWindow = window.open('', '_blank')

    if (printWindow) {
      // Get PDF styles
      const printStyles = getPdfStyles()

      // Create title for the PDF
      const titleText = lessonPlan.lessonName || 'Generated Lesson Plan'

      // Prepare header content with metadata
      const headerInfo = generateHeaderInfo(lessonPlan, selected, dropdowns)

      // Format examples for PDF
      const examplesHtml = generateExamplesHtml(lessonPlan.examples)

      // Create the print document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${titleText}</title>
          ${printStyles}
        </head>
        <body>
          ${headerInfo}
          
          <div class="section">
            <h2>Concept</h2>
            <div class="concept">${lessonPlan.concept || ''}</div>
          </div>
          
          <div class="section">
            <h2>Lesson Plan</h2>
            <div class="lesson-plan-content">
              ${lessonPlanHtml}
            </div>
          </div>
          
          ${examplesHtml}
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load
      printWindow.onload = function () {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
        setIsPdfLoading(false)
      }
    } else {
      throw new Error('Could not open print window')
    }
  } catch (err) {
    console.error('Error generating PDF:', err)
    alert('There was a problem generating the PDF. Please try again.')
    setIsPdfLoading(false)
  }
}