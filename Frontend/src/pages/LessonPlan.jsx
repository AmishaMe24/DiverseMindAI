import React, { useState, useEffect, useRef } from 'react'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Select from 'react-select'
import { downloadLessonPlanAsPDF } from '../utils/lessonPlanPdfGenerator'
import dropdownData from '../data/dropdownData.json'

export default function LessonPlan() {
  const [showOutput, setShowOutput] = useState(false)
  const pdfRef = useRef()

  // State for API response and loading/error states
  const [lessonPlan, setLessonPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for selected values
  const [selected, setSelected] = useState({
    disorder: '',
    subject: '',
    topic: '',
    grade: '',
  })

  // State for available options based on selections
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [availableTopics, setAvailableTopics] = useState([])

  // Update available subjects when grade changes
  useEffect(() => {
    if (selected.grade) {
      setAvailableSubjects(dropdownData.subjects[selected.grade] || [])
      // Reset subject and topic when grade changes
      setSelected(prev => ({ ...prev, subject: '', topic: '' }))
    } else {
      setAvailableSubjects([])
    }
  }, [selected.grade])

  // Update available topics when subject changes
  useEffect(() => {
    if (selected.grade && selected.subject) {
      setAvailableTopics(
        dropdownData.topics[selected.grade]?.[selected.subject] || []
      )
      // Reset topic when subject changes
      setSelected(prev => ({ ...prev, topic: '' }))
    } else {
      setAvailableTopics([])
    }
  }, [selected.grade, selected.subject])

  // Dropdown data based on JSON file
  const dropdowns = {
    grade: {
      label: 'Grade Level',
      options: dropdownData.grades,
    },
    subject: {
      label: 'Subject',
      options: availableSubjects,
    },
    topic: {
      label: 'Topic (Chapter)',
      options: availableTopics,
    },
    disorder: {
      label: 'Learning Accommodation',
      options: dropdownData.disorders,
    },
  }

  // Handle select change
  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta
    setSelected(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!selected.disorder || !selected.subject || !selected.topic || !selected.grade) {
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
        subject: selected.subject,
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

  // Custom styles for React Select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px #bfdbfe' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
      padding: '2px',
      borderRadius: '0.5rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#eff6ff' 
        : state.isFocused 
          ? '#dbeafe' 
          : null,
      color: state.isSelected ? '#2563eb' : '#374151',
      fontWeight: state.isSelected ? '500' : '400',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#bfdbfe',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  }

  // Function to handle PDF download - simplified to use the utility
  const downloadPDF = () => {
    downloadLessonPlanAsPDF(lessonPlan, selected, dropdowns, setIsPdfLoading)
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

        {/* React Select Dropdowns */}
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            {dropdowns.grade.label}
          </label>
          <Select
            name="grade"
            options={dropdowns.grade.options}
            value={dropdowns.grade.options.find(option => option.value === selected.grade) || null}
            onChange={(option, action) => handleSelectChange(option, { ...action, name: 'grade' })}
            placeholder="Select grade level..."
            isClearable={false}
            isSearchable={true}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            {dropdowns.subject.label}
          </label>
          <Select
            name="subject"
            options={dropdowns.subject.options}
            value={dropdowns.subject.options.find(option => option.value === selected.subject) || null}
            onChange={(option, action) => handleSelectChange(option, { ...action, name: 'subject' })}
            placeholder="Select subject..."
            isClearable={false}
            isSearchable={true}
            isDisabled={!selected.grade}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            {dropdowns.topic.label}
          </label>
          <Select
            name="topic"
            options={dropdowns.topic.options}
            value={dropdowns.topic.options.find(option => option.value === selected.topic) || null}
            onChange={(option, action) => handleSelectChange(option, { ...action, name: 'topic' })}
            placeholder="Select topic..."
            isClearable={false}
            isSearchable={true}
            isDisabled={!selected.subject}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            {dropdowns.disorder.label}
          </label>
          <Select
            name="disorder"
            options={dropdowns.disorder.options}
            value={dropdowns.disorder.options.find(option => option.value === selected.disorder) || null}
            onChange={(option, action) => handleSelectChange(option, { ...action, name: 'disorder' })}
            placeholder="Select accommodation..."
            isClearable={false}
            isSearchable={true}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
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
