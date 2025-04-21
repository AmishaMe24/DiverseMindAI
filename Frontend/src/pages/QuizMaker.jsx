import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Select from 'react-select' // Import React Select
import { downloadQuizAsPDF } from '../utils/quizMakerPdfGenerator'
import dropdownData from '../data/dropdownData'

export default function QuizMaker() {
  const [showOutput, setShowOutput] = useState(false)
  const assessmentRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // State for API response and loading/error states
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for available options based on selections
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [availableTopics, setAvailableTopics] = useState([])

  // State for selected values
  const [selected, setSelected] = useState({
    disorder: '',
    subject: '',
    topic: '',
    grade: '',
    questionCount: '',
  })

  // Prepare dropdown data
  const gradeOptions = Object.keys(dropdownData.topics || {}).map(grade => ({
    label: `${grade}`,
    value: grade
  }))

  const disorderOptions = dropdownData.disorders || []

  // Update available subjects when grade changes
  useEffect(() => {
    if (selected.grade && dropdownData.topics[selected.grade]) {
      const subjects = Object.keys(dropdownData.topics[selected.grade]).map(subject => ({
        label: subject,
        value: subject
      }))
      setAvailableSubjects(subjects)
      
      // Reset subject and topic when grade changes
      setSelected(prev => ({
        ...prev,
        subject: '',
        topic: ''
      }))
      setAvailableTopics([])
    }
  }, [selected.grade])

  // Update available topics when subject changes
  useEffect(() => {
    if (selected.grade && selected.subject && 
        dropdownData.topics[selected.grade] && 
        dropdownData.topics[selected.grade][selected.subject]) {
      
      const topics = dropdownData.topics[selected.grade][selected.subject].map(topic => ({
        label: topic.label,
        value: topic.value
      }))
      setAvailableTopics(topics)
      
      // Reset topic when subject changes
      setSelected(prev => ({
        ...prev,
        topic: ''
      }))
    }
  }, [selected.grade, selected.subject])

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
    if (
      !selected.disorder ||
      !selected.subject ||
      !selected.topic ||
      !selected.grade
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
        subject: selected.subject,
        topic: selected.topic,
        grade: selected.grade,
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

  // Handle PDF download using the utility function
  const handleDownloadPDF = () => {
    // Create a compatible format for the PDF generator
    const formattedDropdowns = {
      grade: { options: gradeOptions },
      subject: { options: availableSubjects },
      topic: { options: availableTopics },
      disorder: { options: disorderOptions }
    }
    
    downloadQuizAsPDF(assessment, selected, formattedDropdowns, setIsDownloading)
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

        {/* React Select Dropdowns */}
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Grade Level
          </label>
          <Select
            name="grade"
            options={gradeOptions}
            value={gradeOptions.find(option => option.value === selected.grade) || null}
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
            Subject
          </label>
          <Select
            name="subject"
            options={availableSubjects}
            value={availableSubjects.find(option => option.value === selected.subject) || null}
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
            Topic
          </label>
          <Select
            name="topic"
            options={availableTopics}
            value={availableTopics.find(option => option.value === selected.topic) || null}
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
            Learning Accommodation
          </label>
          <Select
            name="disorder"
            options={disorderOptions}
            value={disorderOptions.find(option => option.value === selected.disorder) || null}
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
