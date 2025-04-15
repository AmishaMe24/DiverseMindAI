// IceBreaker.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function IceBreaker() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const dropdownRef = useRef({});

  const dropdowns = {
    disorder: { label: "Disorder", options: ["Dyslexia", "Dyscalculia", "ADHD"] },
    setting: { label: "Setting", options: ["in person", "virtual"] },
  };

  const [selected, setSelected] = useState({ disorder: "", setting: "" });
  const [activity, setActivityType] = useState("");
  const [materials, setMaterials] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lessonPlan, setLessonPlan] = useState(null);

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

  const handleSubmit = async () => {
    if (!selected.disorder || !selected.setting) {
      setError("Please fill in all required fields");
      return;
    }

    setLessonPlan(null);
    setShowOutput(false);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        disorder: selected.disorder,
        setting: selected.setting,
        activity,
        materials,
      };

      const response = await fetch("http://localhost:8000/icebreaker-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || "Failed to fetch lesson plan");
      }

      const data = await response.json();
      setLessonPlan(data["activity"]);
      setShowOutput(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching lesson plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomDropdown = ({ name, data }) => (
    <div className="mb-7 relative">
      <label className="block mb-3 text-sm font-medium text-gray-700">{data.label}</label>
      <div className="relative" ref={(el) => (dropdownRef.current[name] = el)}>
        <button
          onClick={() => toggleDropdown(name)}
          className="flex items-center justify-between w-full p-3 text-left border bg-white border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={selected[name] ? "text-gray-800" : "text-gray-500"}>{selected[name] || "Select..."}</span>
          <ChevronDown className={`text-gray-500 transition-transform duration-200 ${openDropdown === name ? "rotate-180" : ""}`} size={18} />
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
    <div className="p-4 mt-7 flex justify-center">
      <div className="w-full ml-[14%] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">Ice Breaker Activities</h1>
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">Activity Type</label>
          <textarea
            rows="3"
            value={activity}
            onChange={(e) => setActivityType(e.target.value)}
            placeholder="E.g., Team-building, fun introduction..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">Materials</label>
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
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
          }`}
        >
          <span>{isLoading ? "Generating..." : "Generate Activity"}</span>
          {!isLoading && <span className="text-xl">🚀</span>}
        </button>

        {showOutput && (
          <div className="mt-10 border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Suggested Activity</h2>
              <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-gray-700">
              {lessonPlan}
              {/* "Two Truths and a Lie" adapted for students with {selected.disorder || "diverse needs"}. Helps break the ice while promoting memory and focus! */}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
