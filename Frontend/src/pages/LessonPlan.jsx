import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { marked } from 'marked' // You'll need to install this package

export default function LessonPlan() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)
  const [showOutput, setShowOutput] = useState(false)
  const dropdownRef = useRef({})
  const pdfRef = useRef()

  // State for API response and loading/error states
  const [lessonPlan, setLessonPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
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
        { label: '1st Grade', value: '1st_grade' },
        { label: '2nd Grade', value: '2nd_grade' },
        { label: '3rd Grade', value: '3rd_grade' },
        { label: '4th Grade', value: '4th_grade' },
        { label: '5th Grade', value: '5th_grade' },
        { label: '6th Grade', value: '6th_grade' },
        { label: '7th Grade', value: '7th_grade' },
        { label: '8th Grade', value: '8th_grade' },
      ],
    },
  }

  // State for selected values
  const [selected, setSelected] = useState({
    disorder: '',
    topic: '',
    grade: '',
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

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!selected.disorder || !selected.topic || !selected.grade) {
      setError('Please fill in all required fields')
      return
    }

    // Clear previous lesson plan before making a new request
    setLessonPlan(null)
    setShowOutput(false) // Hide the previous output if any

    setIsLoading(true)
    setError(null)

    try {
      // Prepare request body
      const requestBody = {
        disorder: selected.disorder,
        topic: selected.topic,
        grade: selected.grade,
      }

      // Make API call
      const response = await fetch('http://localhost:8000/lesson-plan', {
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
          errorData.detail?.message || 'Failed to fetch lesson plan'
        )
      }

      const data = await response.json()
      setLessonPlan(data)
      setShowOutput(true)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      console.error('Error fetching lesson plan:', err)
    } finally {
      setIsLoading(false)
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

  // Function to convert markdown to HTML
  const markdownToHtml = (markdown) => {
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

  // Function to handle PDF download
  const downloadPDF = () => {
    if (!lessonPlan) return

    setIsPdfLoading(true)

    try {
      // Convert lesson plan markdown to HTML
      const lessonPlanHtml = markdownToHtml(lessonPlan.lessonPlan)

      // Use browser's print functionality to save as PDF
      const printWindow = window.open('', '_blank')

      if (printWindow) {
        // Prepare CSS for PDF
        const printStyles = `
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

        // Create title for the PDF
        const titleText = lessonPlan.lessonName || 'Generated Lesson Plan'

        // Prepare header content with metadata
        const headerInfo = `
          <h1>${titleText}</h1>
          <div class="header-info">
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

        // Format examples for PDF
        let examplesHtml = ''
        if (lessonPlan.examples && lessonPlan.examples.length > 0) {
          examplesHtml = `
            <div class="section">
              <h2>Examples</h2>
              ${lessonPlan.examples
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

  // Render lesson plan from API response
  const renderLessonPlan = () => {
    if (!lessonPlan) return null

    return (
      <div id="lesson-plan-content" className="space-y-6" ref={pdfRef}>
        <div>
          <h3 className="font-medium text-gray-800 mb-1">Lesson Title</h3>
          <p className="text-gray-700">{lessonPlan.lessonName}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-1">Concept</h3>
          <p className="text-gray-700">{lessonPlan.concept}</p>
        </div>

        {/* Display the raw lesson plan text as markdown */}
        {lessonPlan.lessonPlan && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Lesson Plan</h3>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ReactMarkdown>{lessonPlan.lessonPlan}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Render examples if they exist in the structured format */}
        {lessonPlan.examples && lessonPlan.examples.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Examples</h3>
            <div className="space-y-4">
              {lessonPlan.examples.map((example, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-400 pl-4 py-1"
                >
                  <h4 className="font-medium text-gray-800">
                    {example.section}
                  </h4>

                  {example.methods &&
                    example.methods.map((method, mIndex) => (
                      <div key={mIndex} className="mt-2">
                        <p className="text-sm font-medium text-blue-600">
                          {method.name}
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-1 text-sm">
                          {method.steps &&
                            method.steps.map((step, sIndex) => (
                              <li key={sIndex}>{step}</li>
                            ))}
                        </ul>
                      </div>
                    ))}

                  {example.executiveFunctionStrategy && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700">
                        {example.executiveFunctionStrategy.title}
                      </p>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-1 text-sm">
                        {example.executiveFunctionStrategy.strategies &&
                          example.executiveFunctionStrategy.strategies.map(
                            (strategy, sIndex) => (
                              <li key={sIndex}>{strategy}</li>
                            )
                          )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
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
          Lesson Plan Generator
        </h1>

        {/* Custom Dropdowns */}
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

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
          <span>{isLoading ? 'Generating...' : 'Generate Lesson Plan'}</span>
          {!isLoading && <span className="text-xl">🚀</span>}
        </button>

        {/* Output Card */}
        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Generated Lesson Plan
              </h2>

              {/* PDF Download Button */}
              {lessonPlan && (
                <button
                  onClick={downloadPDF}
                  disabled={isPdfLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors 
                    ${
                      isPdfLoading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  <Download size={16} />
                  <span>{isPdfLoading ? 'Processing...' : 'Download PDF'}</span>
                </button>
              )}
            </div>

            {lessonPlan ? (
              renderLessonPlan()
            ) : (
              <div className="text-center py-8 text-gray-500">
                No lesson plan data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
