import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import logo from '../assets/diversemind-logo.jpg'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const code = urlParams.get('code')

    if (code) {
      setIsLoading(true)

      // Send the code to your backend
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`,
          { code },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user))
            navigate('/dashboard')
          } else {
            setError('Failed to get user data')
          }
        })
        .catch((err) => {
          console.error('Authentication error:', err)
          setError('Authentication failed')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [location.search, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      setIsLoading(true)

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          email,
          password,
        }
      )

      console.log('Login successful:', response.data)

      // Store the user details in localStorage as a single object
      localStorage.setItem(
        'user',
        JSON.stringify({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: email,
          token: response.data.token,
        })
      )

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 pb-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
          <div className="md:flex">
            <div className="w-full p-8">
              <div className="flex justify-center mb-6">
                <img
                  src={logo}
                  className="h-10"
                  alt="Company Logo"
                />
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Please enter your details to sign in
              </p>

              {error && (
                <p className="text-red-500 text-sm text-center mt-2">{error}</p>
              )}

              <form>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="mt-6 text-center">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                  </span>
                  <Link
                    to="/signup"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
              <div>
                <div className="flex items-center my-6">
                  <hr className="w-full border-gray-300" />
                  <span className="px-3 text-gray-500">or</span>
                  <hr className="w-full border-gray-300" />
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `${
                      import.meta.env.VITE_BACKEND_URL
                    }/auth/google`)
                  }
                  className="w-full flex text-black bg-gray-100 items-center justify-center gap-2 border p-3 rounded-lg hover:bg-blue-600 hover:text-white transition duration-200"
                >
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google Logo"
                  />
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Login

// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import { useNavigate, useLocation, Link } from 'react-router-dom'

// const Login = () => {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search)
//     const code = urlParams.get('code')

//     if (code) {
//       setIsLoading(true)

//       axios
//         .post(
//           `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`,
//           { code },
//           { withCredentials: true }
//         )
//         .then((response) => {
//           if (response.data.user) {
//             localStorage.setItem('user', JSON.stringify(response.data.user))
//             navigate('/dashboard')
//           } else {
//             setError('Failed to get user data')
//           }
//         })
//         .catch((err) => {
//           console.error('Authentication error:', err)
//           setError('Authentication failed')
//         })
//         .finally(() => {
//           setIsLoading(false)
//         })
//     }
//   }, [location.search, navigate])

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setError(null)

//     try {
//       setIsLoading(true)

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
//         {
//           email,
//           password,
//         }
//       )

//       localStorage.setItem(
//         'user',
//         JSON.stringify({
//           first_name: response.data.first_name,
//           last_name: response.data.last_name,
//           email: email,
//           token: response.data.token,
//         })
//       )

//       navigate('/dashboard')
//     } catch (err) {
//       console.error('Login error:', err)
//       setError(err.response?.data?.detail || 'Login failed.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
//       <div className="pt-16 pb-12">
//         <div className="max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-lg">
//           <div className="md:flex">
//             <div className="w-full p-8">
//               <div className="flex justify-center mb-6">
//                 <img
//                   src="/path-to-your-logo.svg"
//                   className="h-10"
//                   alt="Company Logo"
//                 />
//               </div>

//               <h2 className="text-2xl font-bold text-center mb-2">
//                 Welcome back
//               </h2>
//               <p className="text-center mb-8">
//                 Please enter your details to sign in
//               </p>

//               {error && (
//                 <p className="text-red-500 text-sm text-center mt-2">{error}</p>
//               )}

//               <form>
//                 <div className="mb-6">
//                   <label
//                     htmlFor="email"
//                     className="block mb-2 text-sm font-medium"
//                   >
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     className="w-full p-2.5 rounded-lg border dark:bg-gray-700"
//                     placeholder="name@company.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="mb-6">
//                   <label
//                     htmlFor="password"
//                     className="block mb-2 text-sm font-medium"
//                   >
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     id="password"
//                     className="w-full p-2.5 rounded-lg border dark:bg-gray-700"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <button
//                   onClick={handleLogin}
//                   disabled={isLoading}
//                   className="w-full p-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
//                 >
//                   {isLoading ? 'Signing in...' : 'Sign In'}
//                 </button>

//                 <div className="mt-6 text-center">
//                   <span className="text-sm">Don't have an account? </span>
//                   <Link
//                     to="/signup"
//                     className="text-sm text-blue-600 hover:underline"
//                   >
//                     Sign up
//                   </Link>
//                 </div>
//               </form>
//               <div>
//                 <div className="flex items-center my-6">
//                   <hr className="w-full" />
//                   <span className="px-3">or</span>
//                   <hr className="w-full" />
//                 </div>

//                 <button
//                   onClick={() =>
//                     (window.location.href = `${
//                       import.meta.env.VITE_BACKEND_URL
//                     }/auth/google`)
//                   }
//                   className="w-full flex items-center justify-center gap-2 border p-3 rounded-lg hover:bg-blue-600 hover:text-white transition"
//                 >
//                   <img
//                     src="https://img.icons8.com/color/16/000000/google-logo.png"
//                     alt="Google Logo"
//                   />
//                   Sign in with Google
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// export default Login
