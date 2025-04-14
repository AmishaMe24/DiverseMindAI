import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { marked } from 'marked'

export default function QuizMaker() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)
  const [showOutput, setShowOutput] = useState(false)
  const dropdownRef = useRef({})
  const assessmentRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // State for form data
  const [formData, setFormData] = useState({
    instructions: '',
  })

  // State for API response and loading/error states
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Dropdown data based on Enum values from the backend
  const dropdowns = {
    disorder: {
      label: 'Disorder',
      options: [
        { label: 'Dyscalculia', value: 'dyscalculia' },
        { label: 'Dyslexia', value: 'dyslexia' },
        { label: 'ADHD', value: 'adhd' },
        { label: 'Autism', value: 'autism' },
        { label: 'Other', value: 'other' },
      ],
    },
    topic: {
      label: 'Topic (Chapter)',
      options: [
        { label: 'Fractions', value: 'fractions' },
        { label: 'Decimals', value: 'decimals' },
        { label: 'Algebra', value: 'algebra' },
        { label: 'Geometry', value: 'geometry' },
        { label: 'Statistics', value: 'statistics' },
        { label: 'Measurement', value: 'measurement' },
        { label: 'Data Analysis', value: 'data_analysis' },
        { label: 'Probability', value: 'probability' },
        { label: 'Ratios', value: 'ratios' },
        { label: 'Number Sense', value: 'number_sense' },
        { label: 'Problem Solving', value: 'problem_solving' },
      ],
    },
    grade: {
      label: 'Grade Level',
      options: [
        { label: '1st Grade', value: '1' },
        { label: '2nd Grade', value: '2' },
        { label: '3rd Grade', value: '3' },
        { label: '4th Grade', value: '4' },
        { label: '5th Grade', value: '5' },
        { label: '6th Grade', value: '6' },
        { label: '7th Grade', value: '7' },
        { label: '8th Grade', value: '8' },
        { label: '9th Grade', value: '9' },
        { label: '10th Grade', value: '10' },
      ],
    },
    questionCount: {
      label: 'Number of Questions',
      options: [
        { label: '5 Questions', value: '5' },
        { label: '10 Questions', value: '10' },
        { label: '15 Questions', value: '15' },
      ],
    },
  }

  // State for selected values
  const [selected, setSelected] = useState({
    disorder: '',
    topic: '',
    grade: '',
    questionCount: '',
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRef.current[openDropdown] &&
        !dropdownRef.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Toggle dropdown open/close
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // Select an option
  const selectOption = (dropdownName, value) => {
    setSelected({ ...selected, [dropdownName]: value })
    setOpenDropdown(null)
  }

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (
      !selected.disorder ||
      !selected.topic ||
      !selected.grade ||
      !formData.instructions
    ) {
      setError('Please fill in all required fields')
      return
    }

    // Clear previous assessment before making a new request
    setAssessment(null)
    setShowOutput(false) // Hide the previous output if any

    setIsLoading(true)
    setError(null)

    try {
      // Prepare request body
      const requestBody = {
        disorder: selected.disorder,
        topic: selected.topic,
        grade: selected.grade,
        additional_info: selected.questionCount,
        prompt: formData.instructions,
      }

      // Make API call to the assessment endpoint
      const response = await fetch('http://localhost:8000/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      // Handle response
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.detail?.message || 'Failed to fetch assessment'
        )
      }

      const data = await response.json()
      setAssessment(data)
      setShowOutput(true)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      console.error('Error fetching assessment:', err)
    } finally {
      setIsLoading(false)
    }
  }

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
  const handleDownloadPDF = async () => {
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
      const topicLabel =
        dropdowns.topic.options.find(
          (option) => option.value === selected.topic
        )?.label || selected.topic
      const gradeLabel =
        dropdowns.grade.options.find(
          (option) => option.value === selected.grade
        )?.label || selected.grade

      const metadata = `Topic: ${topicLabel} | Grade Level: ${gradeLabel} | Adaptation: ${disorderLabel}`
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
      setError('Failed to generate PDF. Please try again.')
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Custom dropdown component
  const CustomDropdown = ({ name, data }) => (
    <div className="mb-7 relative">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        {data.label}
      </label>
      <div className="relative" ref={(el) => (dropdownRef.current[name] = el)}>
        <button
          onClick={() => toggleDropdown(name)}
          className="flex items-center justify-between w-full p-3 text-left border bg-white border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          <span className={selected[name] ? 'text-gray-800' : 'text-gray-500'}>
            {data.options.find((option) => option.value === selected[name])
              ?.label || 'Select...'}
          </span>
          <ChevronDown
            className={`text-gray-500 transition-transform duration-200 ${
              openDropdown === name ? 'transform rotate-180' : ''
            }`}
            size={18}
          />
        </button>

        {/* Dropdown menu */}
        {openDropdown === name && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {hoveredOption?.startsWith(name)
                ? hoveredOption.split('-')[1]
                : 'Select an option'}
            </div>
            {data.options.map(({ label, value }) => (
              <div
                key={value}
                onClick={() => selectOption(name, value)}
                onMouseEnter={() => setHoveredOption(`${name}-${value}`)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 
                  ${
                    hoveredOption === `${name}-${value}`
                      ? 'bg-blue-100 text-blue-700'
                      : selected[name] === value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Render assessment from API response
  const renderAssessment = () => {
    if (!assessment) return null

    return (
      <div className="space-y-6" ref={assessmentRef}>
        <div>
          <h3 className="font-medium text-gray-800 mb-1">Assessment Title</h3>
          <p className="text-gray-700">{assessment.title}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-1">Topic</h3>
          <p className="text-gray-700">{assessment.topic}</p>
        </div>

        {/* Display the raw assessment text as markdown */}
        {assessment.assessment && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">
              Assessment Questions
            </h3>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ReactMarkdown>{assessment.assessment}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 mt-7 flex justify-center">
      <div className="w-full ml-[14%] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
          Quiz Maker
        </h1>

        {/* Custom Dropdowns */}
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

        {/* Instructions */}
        <div className="mb-10">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            rows="5"
            placeholder="E.g., Create a 10-question quiz on fractions..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none transition-all duration-200 hover:border-blue-400"
          ></textarea>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 
            ${
              isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
            }`}
        >
          <span>{isLoading ? 'Generating...' : 'Generate Quiz'}</span>
          {!isLoading && <span className="text-xl">🚀</span>}
        </button>

        {/* Output Card */}
        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Generated Assessment
              </h2>

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading || !assessment}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shadow transition
                  ${
                    isDownloading || !assessment
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
              >
                <Download size={16} />
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>

            {assessment ? (
              renderAssessment()
            ) : (
              <div className="text-center py-8 text-gray-500">
                No assessment data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
