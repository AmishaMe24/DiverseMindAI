import React, { useState, useRef, useEffect } from "react";

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-8 me-3"
                  alt="Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                  DiverseMind
                </span>
              </a>
            </div>

            {/* User Avatar */}
            <div className="flex items-center">
              <div className="flex items-center ms-3 relative" ref={dropdownRef}>
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
                  <div className="absolute right-0 top-9.5 mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm z-50">
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

      SIDEBAR
      <aside
  className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } bg-white border-r border-gray-200 sm:translate-x-0 shadow-md`}
  aria-label="Sidebar"
>
  <div className="h-full px-4 pb-6 overflow-y-auto bg-white flex flex-col justify-between">
    <ul className="space-y-3 font-medium">

      {/* Homepage */}
      <li>
        <a
          href="#"
          className="group flex items-center p-3 rounded-xl transition hover:bg-blue-50"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-7-7v18" />
          </svg>
          <span className="ms-4 text-gray-900 group-hover:text-blue-600 font-semibold">
            Homepage
          </span>
        </a>
      </li>

      {/* Lesson Plan */}
      <li>
        <a
          href="#"
          className="group flex items-center p-3 rounded-xl transition hover:bg-blue-50"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l7-4 7 4V3H5z" />
          </svg>
          <span className="ms-4 text-gray-900 group-hover:text-blue-600 font-semibold">
            Lesson Plan
          </span>
        </a>
      </li>

      {/* Quiz Maker */}
      <li>
        <a
          href="#"
          className="group flex items-center p-3 rounded-xl transition hover:bg-blue-50"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0v1a4 4 0 11-8 0v-1" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6" />
          </svg>
          <span className="ms-4 text-gray-900 group-hover:text-blue-600 font-semibold">
            Quiz Maker
          </span>
        </a>
      </li>

      {/* Ice Breaker Activities */}
      <li>
        <a
          href="#"
          className="group flex items-center p-3 rounded-xl transition hover:bg-blue-50"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4-4 4 4m0 0l-4 4-4-4" />
          </svg>
          <span className="ms-4 text-gray-900 group-hover:text-blue-600 font-semibold">
            Ice Breaker Activities
          </span>
        </a>
      </li>

      {/* Feedback System */}
      <li>
        <a
          href="#"
          className="group flex items-center p-3 rounded-xl transition hover:bg-blue-50"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v9l-4-4H7a2 2 0 01-2-2V8a2 2 0 012-2h2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6M15 3l-3 3m3-3l3 3" />
          </svg>
          <span className="ms-4 text-gray-900 group-hover:text-blue-600 font-semibold">
            Feedback System
          </span>
        </a>
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
    );
    };

    export default Sidebar;
