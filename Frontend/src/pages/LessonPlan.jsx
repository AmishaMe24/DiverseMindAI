import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import LessonPlanOutput from '../components/LessonPlanOutput'
import dropdownData from '../data/dropdownData.json'
import { formatLessonPlanOutput } from '../utils/lessonPlanFormatter';

export default function LessonPlan() {
  const [showOutput, setShowOutput] = useState(false)

  // State for API response and loading/error states
  const [lessonPlan, setLessonPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
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

      const data = await response.json();
      
      // Format the lesson plan text if it exists
      if (data && data.lessonPlan) {
        data.lessonPlan = formatLessonPlanOutput(data.lessonPlan);
      }
      
      setLessonPlan(data);
      setShowOutput(true);
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

  return (
    <div className="p-4 mt-7 flex justify-center">
      <div className="w-full ml-[14%] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
          Lesson Plan Generator
        </h1>

        {/* Form section - Modified to have one dropdown per row */}
        <div className="flex flex-col gap-6 mb-8">
          {Object.entries(dropdowns).map(([name, data]) => (
            <div key={name} className="mb-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {data.label}
              </label>
              <Select
                name={name}
                options={data.options}
                value={
                  selected[name]
                    ? { value: selected[name], label: selected[name] }
                    : null
                }
                onChange={handleSelectChange}
                placeholder={`Select ${data.label.toLowerCase()}...`}
                isClearable
                isSearchable
                styles={customStyles}
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Lesson Plan 🚀'
          )}
        </button>

        {/* Output section */}
        {showOutput && lessonPlan && (
          <LessonPlanOutput 
            lessonPlan={lessonPlan} 
            selected={selected} 
            dropdowns={dropdowns} 
          />
        )}
      </div>
    </div>
  )
}
