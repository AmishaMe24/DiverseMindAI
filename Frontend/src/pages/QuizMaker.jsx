import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function QuizMaker() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const dropdownRef = useRef({});

  // State for form data
  const [formData, setFormData] = useState({
    instructions: ""
  });

  // State for API response and loading/error states
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown data based on Enum values from the backend
  const dropdowns = {
    disorder: {
      label: "Disorder",
      options: [
        { label: "Dyscalculia", value: "dyscalculia" },
        { label: "Dyslexia", value: "dyslexia" },
        { label: "ADHD", value: "adhd" },
        { label: "Autism", value: "autism" },
        { label: "Other", value: "other" }
      ]
    },
    topic: {
      label: "Topic (Chapter)",
      options: [
        { label: "Fractions", value: "fractions" },
        { label: "Decimals", value: "decimals" },
        { label: "Algebra", value: "algebra" },
        { label: "Geometry", value: "geometry" },
        { label: "Statistics", value: "statistics" },
        { label: "Measurement", value: "measurement" },
        { label: "Data Analysis", value: "data_analysis" },
        { label: "Probability", value: "probability" },
        { label: "Ratios", value: "ratios" },
        { label: "Number Sense", value: "number_sense" },
        { label: "Problem Solving", value: "problem_solving" }
      ]
    },
    grade: {
      label: "Grade Level",
      options: [
        { label: "1st Grade", value: "1" },
        { label: "2nd Grade", value: "2" },
        { label: "3rd Grade", value: "3" },
        { label: "4th Grade", value: "4" },
        { label: "5th Grade", value: "5" },
        { label: "6th Grade", value: "6" },
        { label: "7th Grade", value: "7" },
        { label: "8th Grade", value: "8" },
        { label: "9th Grade", value: "9" },
        { label: "10th Grade", value: "10" }
      ]
    },
    questionCount: {
      label: "Number of Questions",
      options: [
        { label: "5 Questions", value: "5" },
        { label: "10 Questions", value: "10" },
        { label: "15 Questions", value: "15" }
      ]
    }
  };

  // State for selected values
  const [selected, setSelected] = useState({
    disorder: "",
    topic: "",
    grade: "",
    questionCount: ""
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (openDropdown && 
          dropdownRef.current[openDropdown] && 
          !dropdownRef.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Toggle dropdown open/close
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Select an option
  const selectOption = (dropdownName, value) => {
    setSelected({...selected, [dropdownName]: value});
    setOpenDropdown(null);
  };

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!selected.disorder || !selected.topic || !selected.grade || !formData.instructions) {
      setError("Please fill in all required fields");
      return;
    }
  
    // Clear previous assessment before making a new request
    setAssessment(null);
    setShowOutput(false); // Hide the previous output if any
  
    setIsLoading(true);
    setError(null);
  
    try {
      // Prepare request body
      const requestBody = {
        disorder: selected.disorder,
        topic: selected.topic,
        grade: selected.grade,
        additional_info: selected.questionCount,
        prompt: formData.instructions
      };
  
      // Make API call to the assessment endpoint
      const response = await fetch('http://localhost:8000/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to fetch assessment');
      }
  
      const data = await response.json();
      setAssessment(data);
      setShowOutput(true);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error fetching assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Custom dropdown component
  const CustomDropdown = ({ name, data }) => (
    <div className="mb-7 relative">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        {data.label}
      </label>
      <div className="relative" ref={el => dropdownRef.current[name] = el}>
        <button 
          onClick={() => toggleDropdown(name)}
          className="flex items-center justify-between w-full p-3 text-left border bg-white border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          <span className={selected[name] ? "text-gray-800" : "text-gray-500"}>
            {data.options.find(option => option.value === selected[name])?.label || "Select..."}
          </span>
          <ChevronDown 
            className={`text-gray-500 transition-transform duration-200 ${openDropdown === name ? "transform rotate-180" : ""}`} 
            size={18} 
          />
        </button>
        
        {/* Dropdown menu */}
        {openDropdown === name && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {hoveredOption?.startsWith(name) ? hoveredOption.split('-')[1] : 'Select an option'}
            </div>
            {data.options.map(({ label, value }) => (
              <div
                key={value}
                onClick={() => selectOption(name, value)}
                onMouseEnter={() => setHoveredOption(`${name}-${value}`)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 
                  ${hoveredOption === `${name}-${value}` 
                    ? "bg-blue-100 text-blue-700" 
                    : selected[name] === value 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render assessment from API response
  const renderAssessment = () => {
    if (!assessment) return null;

    return (
      <div className="space-y-6">
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
            <h3 className="font-medium text-gray-800 mb-2">Assessment Questions</h3>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ReactMarkdown>
                {assessment.assessment}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  };

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
            ${isLoading 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
            }`}
        >
          <span>{isLoading ? "Generating..." : "Generate Quiz"}</span>
          {!isLoading && <span className="text-xl">🚀</span>}
        </button>
        
        {/* Output Card */}
        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generated Assessment</h2>
            </div>
            
            {assessment ? renderAssessment() : (
              <div className="text-center py-8 text-gray-500">
                No assessment data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}