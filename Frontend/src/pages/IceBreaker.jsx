// IceBreaker.jsx (updated with working PDF download functionality - no Next.js)
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Download } from "lucide-react";
import Select from "react-select";
import IceBreakerOutput from "../components/IceBreakerOutput";
import dropdownData from "../data/dropdownData.json";
import axios from "axios";

export default function IceBreaker() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const dropdownRef = useRef({});

  const dropdowns = {
    setting: { label: "Setting", options: ["in person", "virtual"] },
  };

  const [selected, setSelected] = useState({
    setting: "",
    exec_skills: [],
  });
  const [activity, setActivityType] = useState("");
  const [materials, setMaterials] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lessonPlan, setLessonPlan] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRef.current[openDropdown] &&
        !dropdownRef.current[openDropdown].contains(event.target)
      ) {
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

  // Handle select change for React-Select component (executive skills)
  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;

    if (name === "exec_skills") {
      // Check if user is trying to select more than 2 executive skills
      if (selectedOption && selectedOption.length > 2) {
        // Limit to first 2 selections
        const limitedOptions = selectedOption.slice(0, 2);

        // Show a warning message
        setError("You can select a maximum of 2 executive skills");

        // Update state with only the first 2 options
        setSelected((prev) => ({
          ...prev,
          exec_skills: limitedOptions.map((option) => option.value),
        }));

        // Return early to prevent processing more than 2 options
        return;
      }

      // Normal processing for 2 or fewer options
      setSelected((prev) => ({
        ...prev,
        exec_skills: selectedOption
          ? selectedOption.map((option) => option.value)
          : [],
      }));

      // Clear the error message if it was set previously
      if (error === "You can select a maximum of 2 executive skills") {
        setError(null);
      }
    }
  };

  // Custom styles for React Select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px #bfdbfe" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      padding: "2px",
      borderRadius: "0.5rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#eff6ff"
        : state.isFocused
        ? "#dbeafe"
        : null,
      color: state.isSelected ? "#2563eb" : "#374151",
      fontWeight: state.isSelected ? "500" : "400",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#bfdbfe",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  const handleSubmit = async () => {
    if (!selected.setting || selected.exec_skills.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    setLessonPlan(null);
    setShowOutput(false);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        setting: selected.setting,
        activity,
        materials,
        exec_skills: selected.exec_skills,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/icebreaker-activity`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // With axios, the response data is already parsed
      const data = response.data;
      setLessonPlan(data["activity"]);
      setShowOutput(true);
    } catch (err) {
      // Axios error handling
      setError(
        err.response?.data?.detail?.message ||
          err.message ||
          "An unexpected error occurred"
      );
      console.error("Error fetching icebreaker activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          <span className={selected[name] ? "text-gray-800" : "text-gray-500"}>
            {selected[name] || "Select..."}
          </span>
          <ChevronDown
            className={`text-gray-500 transition-transform duration-200 ${
              openDropdown === name ? "rotate-180" : ""
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
        <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
          Ice Breaker Activities
        </h1>
        {/* Custom dropdowns for setting */}
        {Object.entries(dropdowns).map(([name, data]) => (
          <CustomDropdown key={name} name={name} data={data} />
        ))}

        {/* Executive Function Skills Dropdown using React-Select */}
        <div className="mb-7">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Executive Function Skills
          </label>
          <Select
            name="exec_skills"
            options={dropdownData.exec_skills}
            value={dropdownData.exec_skills.filter((option) =>
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

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

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

        {/* Output section */}
        {showOutput && lessonPlan && (
          <IceBreakerOutput
            icebreaker={lessonPlan}
            selected={{
              setting: selected.setting,
              activity: activity,
              materials: materials,
              exec_skills: selected.exec_skills,
            }}
            dropdowns={{
              ...dropdowns,
              exec_skills: { options: dropdownData.exec_skills },
            }}
          />
        )}
      </div>
    </div>
  );
}
