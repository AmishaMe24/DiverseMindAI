import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom' // Added useLocation hook

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation() // Get current location
  
  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  // Toggle dropdown
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev)

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Hamburger + Logo */}
            <div className="flex items-center justify-start">
              <button
                onClick={toggleSidebar}
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
              <a href="#" className="flex ms-2 md:me-24">
                <img
                  src="/src/assets/diversemind-logo.jpg"
                  className="h-8 me-3"
                  alt="Logo"
                />
                <Link to="/">
                  <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                    DiverseMind
                  </span>
                </Link>
              </a>
            </div>

            {/* User Avatar */}
            <div className="flex items-center">
              <div
                className="flex items-center ms-3 relative"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    alt="user"
                  />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm z-50">
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-900">Neil Sims</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        neil.sims@flowbite.com
                      </p>
                    </div>
                    <ul className="py-1">
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 sm:translate-x-0 shadow-md`}
        aria-label="Sidebar"
      >
        <div className="h-full px-4 pb-6 overflow-y-auto bg-white flex flex-col justify-between">
          <ul className="space-y-3 font-medium">
            {/* Homepage */}
            <li>
              <Link
                to="/"
                className={`group flex items-center p-3 rounded-xl transition ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition ${
                    isActive('/') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className={`ms-4 font-semibold ${
                  isActive('/') ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  Homepage
                </span>
              </Link>
            </li>

            {/* Lesson Plan */}
            <li>
              <Link
                to="/lesson-plan"
                className={`group flex items-center p-3 rounded-xl transition ${
                  isActive('/lesson-plan') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition ${
                    isActive('/lesson-plan') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span className={`ms-4 font-semibold ${
                  isActive('/lesson-plan') ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  Lesson Plan
                </span>
              </Link>
            </li>

            {/* Quiz Maker */}
            <li>
              <Link
                to="/quiz-maker"
                className={`group flex items-center p-3 rounded-xl transition ${
                  isActive('/quiz-maker') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition ${
                    isActive('/quiz-maker') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span className={`ms-4 font-semibold ${
                  isActive('/quiz-maker') ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  Quiz Maker
                </span>
              </Link>
            </li>

            {/* Ice Breaker Activities */}
            <li>
              <Link
                to="/ice-breaker"
                className={`group flex items-center p-3 rounded-xl transition ${
                  isActive('/ice-breaker') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition ${
                    isActive('/ice-breaker') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className={`ms-4 font-semibold ${
                  isActive('/ice-breaker') ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  Ice Breaker Activities
                </span>
              </Link>
            </li>

            {/* Feedback System */}
            <li>
              <Link
                to="/feedback"
                className={`group flex items-center p-3 rounded-xl transition ${
                  isActive('/feedback') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition ${
                    isActive('/feedback') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span className={`ms-4 font-semibold ${
                  isActive('/feedback') ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  Feedback System
                </span>
              </Link>
            </li>
          </ul>

          {/* Footer / CTA */}
          <div className="mt-8 px-3">
            <div className="bg-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-800 font-medium">
                Empowering Neurodiverse Learning ✨
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar