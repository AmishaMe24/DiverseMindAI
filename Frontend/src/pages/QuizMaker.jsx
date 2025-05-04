import React, { useState, useEffect } from 'react'
import Select from 'react-select' // Import React Select
import QuizMakerOutput from '../components/QuizMakerOutput'
import dropdownData from '../data/dropdownData.json'
import { formatAssessmentOutput } from '../utils/assessmentFormatter';
import axios from 'axios'; // Import axios


export default function QuizMaker() {
  const [showOutput, setShowOutput] = useState(false)

  // State for API response and loading/error states
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for selected values
  const [selected, setSelected] = useState({
    exec_skills: [],
    mainSubject: '',
    topic: '',
    subtopic: '',
    grade: '',
    questionCount: '',
  })

  // State for available options based on selections
  const [availableGrades, setAvailableGrades] = useState(dropdownData.grades)
  const [availableTopics, setAvailableTopics] = useState([])
  const [availableSubtopics, setAvailableSubtopics] = useState([])

  // Update available grades when main subject changes
  useEffect(() => {
    if (selected.mainSubject) {
      // Filter grades based on selected subject
      if (selected.mainSubject === 'Science') {
        // For Science, only show grades up to 6
        setAvailableGrades(dropdownData.grades.filter(grade => 
          !isNaN(parseInt(grade.value)) && parseInt(grade.value) <= 6
        ));
      } else {
        // For Mathematics, show all grades
        setAvailableGrades(dropdownData.grades);
      }
      // Reset grade, topic, and subtopic when main subject changes
      setSelected(prev => ({ ...prev, grade: '', topic: '', subtopic: '' }))
    } else {
      setAvailableGrades(dropdownData.grades);
    }
  }, [selected.mainSubject])

  // Update available topics based on subject and grade
  useEffect(() => {
    if (selected.mainSubject === 'Science' && selected.grade) {
      // For Science, filter topics based on the selected grade
      const gradeMap = {
        '1': 'First Grade',
        '2': 'Second Grade',
        '3': 'Third Grade',
        '4': 'Fourth Grade',
        '5': 'Fifth Grade',
        '6': 'Sixth Grade',
        'K': 'Kindergarten'
      };
      
      const selectedGradeText = gradeMap[selected.grade] || selected.grade;
      
      // Filter science topics by the selected grade
      setAvailableTopics(
        dropdownData.scienceTopics.filter(topic => topic.grade === selectedGradeText) || []
      );
      
      // Reset topic when grade changes
      setSelected(prev => ({ ...prev, topic: '', subtopic: '' }));
    } else if (selected.mainSubject === 'Maths' && selected.grade) {
      // For Mathematics, use the grade-specific topics
      setAvailableTopics(dropdownData.subjects[selected.grade] || []);
      // Reset topic and subtopic when grade changes
      setSelected(prev => ({ ...prev, topic: '', subtopic: '' }));
    } else {
      setAvailableTopics([]);
    }
  }, [selected.mainSubject, selected.grade])

  // Update available subtopics when topic changes (only for Mathematics)
  useEffect(() => {
    if (selected.mainSubject === 'Maths' && selected.grade && selected.topic) {
      setAvailableSubtopics(
        dropdownData.topics[selected.grade]?.[selected.topic] || []
      )
      // Reset subtopic when topic changes
      setSelected(prev => ({ ...prev, subtopic: '' }))
    } else {
      setAvailableSubtopics([])
    }
  }, [selected.mainSubject, selected.grade, selected.topic])

  // Handle select change
  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta
    
    if (name === 'exec_skills') {
      // Check if user is trying to select more than 2 executive skills
      if (selectedOption && selectedOption.length > 2) {
        // Limit to first 2 selections
        const limitedOptions = selectedOption.slice(0, 2);
        
        // Show a warning message
        setError('You can select a maximum of 2 executive skills')
        
        // Update state with only the first 2 options
        setSelected(prev => ({
          ...prev,
          exec_skills: limitedOptions.map(option => option.value)
        }))
        
        // Return early to prevent processing more than 2 options
        return;
      }
      
      // Normal processing for 2 or fewer options
      setSelected(prev => ({
        ...prev,
        exec_skills: selectedOption ? selectedOption.map(option => option.value) : []
      }))
      
      // Clear the error message if it was set previously
      if (error === 'You can select a maximum of 2 executive skills') {
        setError(null);
      }
    } else {
      setSelected(prev => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : ''
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (selected.exec_skills.length === 0 || !selected.mainSubject || !selected.topic || !selected.grade) {
      setError('Please fill in all required fields')
      return
    }
    
    // For Mathematics, subtopic is required
    if (selected.mainSubject === 'Maths' && !selected.subtopic) {
      setError('Please select a sub-topic')
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
        exec_skills: selected.exec_skills,
        subject: selected.mainSubject,
        topic: selected.topic,
      }
      
      // Handle grade differently for Science vs Mathematics
      if (selected.mainSubject === 'Science') {
        // For Science, find the selected topic and use its grade property
        const selectedTopic = dropdownData.scienceTopics.find(topic => topic.value === selected.topic);
        requestBody.grade = selectedTopic ? selectedTopic.grade : selected.grade;
      } else {
        // For Mathematics, use the selected grade directly
        requestBody.grade = selected.grade;
        // Only include subtopic for Mathematics
        requestBody.subtopic = selected.subtopic;
      }

      // Make API call to the assessment endpoint using axios
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/assessment`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Handle success - axios automatically parses JSON and throws for non-2xx status
      const data = response.data;
      
      // Format the assessment data
      let cleanedAssessment;
      if (typeof data === 'string') {
        // If the API returns a string
        cleanedAssessment = formatAssessmentOutput(data);
        setAssessment({ assessment: cleanedAssessment });
      } else if (typeof data === 'object' && data !== null) {
        // If the API returns an object
        if (typeof data.assessment === 'string') {
          // Clean the assessment text
          data.assessment = formatAssessmentOutput(data.assessment);
          cleanedAssessment = data;
        } else {
          cleanedAssessment = data;
        }
        setAssessment(cleanedAssessment);
      }
      
      setShowOutput(true);
    } catch (err) {
      // Axios error handling
      setError(err.response?.data?.detail?.message || err.message || 'An unexpected error occurred')
      console.error('Error fetching assessment:', err)
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
          Quiz Maker
        </h1>

        {/* Form section - Modified to have one dropdown per row */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Subject Dropdown */}
          <div className="mb-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Subject
            </label>
            <Select
              name="mainSubject"
              options={dropdownData.mainSubjects}
              value={dropdownData.mainSubjects.find(option => option.value === selected.mainSubject) || null}
              onChange={handleSelectChange}
              placeholder="Select subject..."
              isClearable
              isSearchable
              styles={customStyles}
            />
          </div>

          {/* Grade Dropdown */}
          <div className="mb-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Grade Level
            </label>
            <Select
              name="grade"
              options={availableGrades}
              value={availableGrades.find(option => option.value === selected.grade) || null}
              onChange={handleSelectChange}
              placeholder="Select grade level..."
              isClearable
              isSearchable
              isDisabled={!selected.mainSubject}
              styles={customStyles}
            />
          </div>

          {/* Topic Dropdown */}
          <div className="mb-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Topic
            </label>
            <Select
              name="topic"
              options={availableTopics}
              value={availableTopics.find(option => option.value === selected.topic) || null}
              onChange={handleSelectChange}
              placeholder="Select topic..."
              isClearable
              isSearchable
              isDisabled={!selected.grade}
              styles={customStyles}
            />
          </div>

          {/* Subtopic Dropdown - Only shown for Mathematics */}
          {selected.mainSubject === 'Maths' && (
            <div className="mb-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Sub-Topic
              </label>
              <Select
                name="subtopic"
                options={availableSubtopics}
                value={availableSubtopics.find(option => option.value === selected.subtopic) || null}
                onChange={handleSelectChange}
                placeholder="Select sub-topic..."
                isClearable
                isSearchable
                isDisabled={!selected.topic}
                styles={customStyles}
              />
            </div>
          )}

          {/* Executive Function Skills Dropdown */}
          <div className="mb-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Executive Function Skills
            </label>
            <Select
              name="exec_skills"
              options={dropdownData.exec_skills}
              value={dropdownData.exec_skills.filter(option => 
                selected.exec_skills.includes(option.value)
              )}
              onChange={handleSelectChange}
              placeholder="Select executive skills..."
              isMulti
              isClearable
              isSearchable
              styles={customStyles}
            />
          </div>
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

        {/* Output section */}
        {showOutput && assessment && (
          <QuizMakerOutput 
            assessment={assessment} 
            selected={selected} 
            dropdowns={{
              grade: { options: availableGrades },
              mainSubject: { options: dropdownData.mainSubjects },
              topic: { options: availableTopics },
              subtopic: { options: availableSubtopics },
              exec_skills: { options: dropdownData.exec_skills }
            }} 
          />
        )}
      </div>
    </div>
  )
}
