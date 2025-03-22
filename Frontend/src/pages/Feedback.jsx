// Feedback.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function Feedback() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const dropdownRef = useRef({});

  const dropdowns = {
    disorder: { label: "Disorder", options: ["Dyslexia", "Dyscalculia", "ADHD"] },
    grade: { label: "Grade Level", options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"] }
  };

  const [selected, setSelected] = useState({ disorder: "", grade: "" });

  useEffect(() => {
    function handleClickOutside(event) {
      if (openDropdown && dropdownRef.current[openDropdown] && !dropdownRef.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const selectOption = (dropdownName, option) => {
    setSelected({ ...selected, [dropdownName]: option });
    setOpenDropdown(null);
  };

  const CustomDropdown = ({ name, data }) => (
    <div className="mb-7 relative">
      <label className="block mb-3 text-sm font-medium text-gray-700">{data.label}</label>
      <div className="relative" ref={el => dropdownRef.current[name] = el}>
        <button onClick={() => toggleDropdown(name)} className="flex items-center justify-between w-full p-3 text-left border bg-white border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className={selected[name] ? "text-gray-800" : "text-gray-500"}>{selected[name] || "Select..."}</span>
          <ChevronDown className={`text-gray-500 transition-transform duration-200 ${openDropdown === name ? "rotate-180" : ""}`} size={18} />
        </button>
        {openDropdown === name && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            {data.options.map((option) => (
              <div key={option} onClick={() => selectOption(name, option)} onMouseEnter={() => setHoveredOption(`${name}-${option}`)} onMouseLeave={() => setHoveredOption(null)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${hoveredOption === `${name}-${option}` ? "bg-blue-100 text-blue-700" : selected[name] === option ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
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
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">Feedback System</h1>
        {Object.entries(dropdowns).map(([name, data]) => <CustomDropdown key={name} name={name} data={data} />)}

        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">Feedback Context</label>
          <textarea rows="4" placeholder="E.g., Collect feedback on lesson engagement for Dyslexia students..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" />
        </div>

        <button onClick={() => setShowOutput(true)} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition shadow-lg flex items-center justify-center gap-2">
          Generate Feedback Form 🚀
        </button>

        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generated Feedback</h2>
              <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <ul className="list-disc space-y-2 pl-4 text-gray-700">
              <li>Was the lesson clear and easy to follow?</li>
              <li>Were the accommodations helpful?</li>
              <li>Would you like more visual aids in future lessons?</li>
              <li>How engaged did you feel during the activities?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
