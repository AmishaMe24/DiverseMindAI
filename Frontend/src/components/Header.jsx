import React from 'react'
import { Link } from 'react-router-dom'
export default function Header() {
  return (
    <header>
      <nav className="bg-white shadow-md px-4 lg:px-6 py-3">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          {/* Logo  */}
          <Link to="/" className="flex items-center">
            <img
              src="/src/assets/diversemind-logo.jpg"
              className="mr-3 h-6 sm:h-9 rounded-full"
              alt="Diversemind Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-900">
              Diversemind
            </span>
          </Link>

          {/* Right side container with nav items and buttons */}
          <div className="flex items-center">
            <div className="hidden lg:flex mr-10">
              <ul className="flex flex-row space-x-8 font-medium">
                {['Home', 'Features', 'Team', 'Contact'].map((item, index) => (
                  <li key={index}>
                    <Link
                      to="/"
                      className="block py-2 text-gray-700 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-600 lg:p-0"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Login and signup buttons */}
            <div className="flex items-center">
              <Link
                to="/login"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2"
              >
                Sign Up
              </Link>

              {/* Hamburger Menu */}
              <button
                data-collapse-toggle="mobile-menu"
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
