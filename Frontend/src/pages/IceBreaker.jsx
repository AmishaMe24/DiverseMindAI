// IceBreaker.jsx (updated with working PDF download functionality - no Next.js)
import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function IceBreaker() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)
  const [showOutput, setShowOutput] = useState(false)
  const dropdownRef = useRef({})
  const contentRef = useRef(null)
  const [downloadInProgress, setDownloadInProgress] = useState(false)

  const dropdowns = {
    disorder: {
      label: 'Disorder',
      options: ['Dyslexia', 'Dyscalculia', 'ADHD'],
    },
    setting: { label: 'Setting', options: ['in person', 'virtual'] },
  }

  const [selected, setSelected] = useState({ disorder: '', setting: '' })
  const [activity, setActivityType] = useState('')
  const [materials, setMaterials] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lessonPlan, setLessonPlan] = useState(null)

  function extractIcebreakerJson(raw) {
    const result = {
      title: '',
      objective: '',
      materials: '',
      instructions: [],
      questions: [],
      debrief: [],
      tips: [],
      variations: [],
    }

    const lines = raw.split(/\r?\n/).map((l) => l.trim())
    let section = null

    for (let line of lines) {
      if (/^\*\*Title:\*\*/i.test(line)) {
        section = 'title'
        result.title = line.replace(/^\*\*Title:\*\*/i, '').trim()
      } else if (/^\*\*Objective:\*\*/i.test(line)) {
        section = 'objective'
        result.objective = line.replace(/^\*\*Objective:\*\*/i, '').trim()
      } else if (/^\*\*Materials Needed:\*\*/i.test(line)) {
        section = 'materials'
        result.materials = line
          .replace(/^\*\*Materials Needed:\*\*/i, '')
          .trim()
      } else if (/^\*\*Instructions:\*\*/i.test(line)) {
        section = 'instructions'
      } else if (/^Sample \"Would You Rather.*?\" Questions/i.test(line)) {
        section = 'questions'
      } else if (/^\*\*Debrief/i.test(line)) {
        section = 'debrief'
      } else if (/Tips for Success/i.test(line)) {
        section = 'tips'
      } else if (/Variations/i.test(line)) {
        section = 'variations'
      } else if (line.startsWith('*') || line.startsWith('-')) {
        if (section && ['tips', 'variations'].includes(section)) {
          result[section].push(line.replace(/^[-*]\s*/, ''))
        }
      } else if (line && section) {
        if (['instructions', 'questions', 'debrief'].includes(section)) {
          result[section].push(line)
        }
      }
    }

    return result
  }

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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const selectOption = (dropdownName, option) => {
    setSelected({ ...selected, [dropdownName]: option })
    setOpenDropdown(null)
  }

  const handleSubmit = async () => {
    if (!selected.disorder || !selected.setting) {
      setError('Please fill in all required fields')
      return
    }

    setLessonPlan(null)
    setShowOutput(false)
    setIsLoading(true)
    setError(null)

    try {
      const requestBody = {
        disorder: selected.disorder,
        setting: selected.setting,
        activity,
        materials,
      }

      const response = await fetch(
        'http://localhost:8000/icebreaker-activity',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.detail?.message || 'Failed to fetch lesson plan'
        )
      }

      const data = await response.json()
      setLessonPlan(data['activity'])
      setShowOutput(true)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      console.error('Error fetching lesson plan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const renderList = (items, ordered = false) => {
    const ListTag = ordered ? 'ol' : 'ul'
    return (
      <ListTag
        className={`${
          ordered ? 'list-decimal' : 'list-disc'
        } list-outside space-y-2 pl-6`}
      >
        {items.map((item, i) => (
          <li key={i} className="ml-1">
            <span className="inline">
              <ReactMarkdown
                components={{ p: ({ node, ...props }) => <span {...props} /> }}
              >
                {item}
              </ReactMarkdown>
            </span>
          </li>
        ))}
      </ListTag>
    )
  }

  // Browser-based PDF generation that doesn't require external libraries
  const handlePrintPDF = () => {
    if (!contentRef.current || downloadInProgress) return

    try {
      setDownloadInProgress(true)

      const content = extractIcebreakerJson(lessonPlan)
      const title = content.title || 'Icebreaker Activity'

      // Create a new window with just the content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups for this website to download the PDF')
        setDownloadInProgress(false)
        return
      }

      // Get styles from current document to maintain consistent look
      const styles = Array.from(document.styleSheets)
        .filter((styleSheet) => {
          try {
            return (
              !styleSheet.href ||
              styleSheet.href.startsWith(window.location.origin)
            )
          } catch (e) {
            return false
          }
        })
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n')
          } catch (e) {
            return ''
          }
        })
        .join('\n')

      // Add HTML content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              /* Base styles */
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.6;
                color: #333;
              }
              h3 { 
                color: #2563eb; 
                font-size: 24px;
                margin-bottom: 16px;
              }
              h4 { 
                font-size: 18px;
                margin-top: 20px;
                margin-bottom: 10px;
              }
              section {
                margin-bottom: 20px;
              }
              ul, ol { 
                margin-left: 20px;
                padding-left: 20px;
              }
              li {
                margin-bottom: 5px;
              }
              p {
                margin-bottom: 10px;
              }
              .content-wrapper {
                max-width: 800px;
                margin: 0 auto;
              }
              @media print {
                body {
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                h3 {
                  color: #2563eb !important;
                }
              }
              /* Additional styles */
              ${styles}
            </style>
          </head>
          <body>
            <div class="content-wrapper">
              ${contentRef.current.innerHTML}
            </div>
            <script>
              // Automatically trigger print dialog when content is loaded
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  // Slight delay before closing to ensure print dialog appears
                  setTimeout(() => window.close(), 100);
                }, 300);
              }
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Set timeout to reset button state if window is closed without printing
      setTimeout(() => {
        setDownloadInProgress(false)
      }, 5000)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
      setDownloadInProgress(false)
    }
  }

  const CustomDropdown = ({ name, data }) => (
    <div className="mb-7 relative">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        {data.label}
      </label>
      <div className="relative" ref={(el) => (dropdownRef.current[name] = el)}>
        <button
          onClick={() => toggleDropdown(name)}
          className="flex items-center justify-between w-full p-3 text-left border bg-white border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={selected[name] ? 'text-gray-800' : 'text-gray-500'}>
            {selected[name] || 'Select...'}
          </span>
          <ChevronDown
            className={`text-gray-500 transition-transform duration-200 ${
              openDropdown === name ? 'rotate-180' : ''
            }`}
            size={18}
          />
        </button>
        {openDropdown === name && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            {data.options.map((option) => (
              <div
                key={option}
                onClick={() => selectOption(name, option)}
                onMouseEnter={() => setHoveredOption(`${name}-${option}`)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
                  hoveredOption === `${name}-${option}`
                    ? 'bg-blue-100 text-blue-700'
                    : selected[name] === option
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-4 mt-7 flex justify-center">
      <div className="w-full ml-[14%] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
          Ice Breaker Activities
        </h1>
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Activity Type
          </label>
          <textarea
            rows="3"
            value={activity}
            onChange={(e) => setActivityType(e.target.value)}
            placeholder="E.g., Team-building, fun introduction..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Materials
          </label>
          <textarea
            rows="3"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="If or not Materials are available / What type of Materials are available"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
          }`}
        >
          <span>{isLoading ? 'Generating...' : 'Generate Activity'}</span>
          {!isLoading && <span className="text-xl">🚀</span>}
        </button>

        {showOutput && lessonPlan && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Suggested Activity
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={downloadInProgress}
                >
                  <Download size={16} />
                  <span>
                    {downloadInProgress ? 'Processing...' : 'Download PDF'}
                  </span>
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div ref={contentRef}>
              {(() => {
                const content = extractIcebreakerJson(lessonPlan)
                return (
                  <div className="space-y-6 text-gray-800 text-[15px] leading-relaxed">
                    {content.title && (
                      <h3 className="text-2xl font-semibold text-blue-700">
                        {content.title}
                      </h3>
                    )}
                    {content.objective && (
                      <section>
                        <h4 className="font-semibold text-lg">Objective</h4>
                        <p>{content.objective}</p>
                      </section>
                    )}
                    {content.materials && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Materials Needed
                        </h4>
                        <p>{content.materials}</p>
                      </section>
                    )}
                    {content.instructions.length > 0 && (
                      <section>
                        <h4 className="font-semibold text-lg">Instructions</h4>
                        {renderList(content.instructions, true)}
                      </section>
                    )}
                    {content.questions.length > 0 && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Sample Questions
                        </h4>
                        {renderList(content.questions)}
                      </section>
                    )}
                    {content.debrief.length > 0 && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Debrief / Discussion Points
                        </h4>
                        {renderList(content.debrief)}
                      </section>
                    )}
                    {content.tips.length > 0 && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Tips for Success
                        </h4>
                        {renderList(content.tips)}
                      </section>
                    )}
                    {content.variations.length > 0 && (
                      <section>
                        <h4 className="font-semibold text-lg">Variations</h4>
                        {renderList(content.variations)}
                      </section>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}