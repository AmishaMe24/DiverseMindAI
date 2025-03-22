import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function LessonPlan() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const dropdownRef = useRef({});
  
  // Dropdown data
  const dropdowns = {
    disorder: {
      label: "Disorder",
      options: ["Dyslexia", "Dyscalculia", "ADHD"]
    },
    topic: {
      label: "Topic (Chapter)",
      options: Array.from({ length: 11 }).map((_, i) => `Chapter ${i + 1}`)
    },
    grade: {
      label: "Grade Level",
      options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]
    }
  };
  
  // State for selected values
  const [selected, setSelected] = useState({
    disorder: "",
    topic: "",
    grade: ""
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
  const selectOption = (dropdownName, option) => {
    setSelected({...selected, [dropdownName]: option});
    setOpenDropdown(null);
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
            {selected[name] || "Select..."}
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
            {data.options.map((option) => (
              <div
                key={option}
                onClick={() => selectOption(name, option)}
                onMouseEnter={() => setHoveredOption(`${name}-${option}`)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 
                  ${hoveredOption === `${name}-${option}` 
                    ? "bg-blue-100 text-blue-700" 
                    : selected[name] === option 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 mt-8 flex justify-center">
      <div className="w-full ml-[13%] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
          Lesson Plan Generator
        </h1>

        {/* Custom Dropdowns */}
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

        {/* Additional Notes */}
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            rows="4"
            placeholder="Any additional information..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none transition-all duration-200 hover:border-blue-400"
          ></textarea>
        </div>

        {/* Main Prompt */}
        <div className="mb-10">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Main Prompt
          </label>
          <textarea
            rows="5"
            placeholder="Write your main instructions for the AI here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none transition-all duration-200 hover:border-blue-400"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          onClick={() => setShowOutput(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition shadow-lg flex items-center justify-center gap-2"
        >
          <span>Generate Lesson Plan</span>
          <span className="text-xl">🚀</span>
        </button>
        
        {/* Output Card */}
        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generated Lesson Plan</h2>
              <button 
                onClick={() => setShowOutput(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Lesson Title</h3>
                <p className="text-gray-700">Understanding Fractions in Daily Life</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Objectives</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Students will be able to identify fractions in real-world scenarios</li>
                  <li>Students will demonstrate understanding of equivalent fractions</li>
                  <li>Students will apply fraction concepts to solve practical problems</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Materials</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Fraction manipulatives</li>
                  <li>Visual worksheets with color-coding</li>
                  <li>Real-world objects (pizza model, measuring cups)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Accommodations</h3>
                <p className="text-gray-700">
                  For students with {selected.disorder || "learning differences"}: Extended time for activities,
                  multi-sensory approach with tactile materials, frequent breaks, visual supports,
                  and step-by-step instructions with examples.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}