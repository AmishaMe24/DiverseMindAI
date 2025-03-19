import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, RefreshCw, Award } from 'lucide-react'
import { Button } from '../components/features/button'

const NotFoundPage = () => {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore] = useState(0)

  // Generate new random numbers for the math problem
  const generateProblem = useCallback(() => {
    // Generate simple numbers (1-10) for the addition problem
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setUserAnswer('')
    setIsCorrect(null)
  }, [])

  // Initialize on component mount
  useEffect(() => {
    generateProblem()
  }, [generateProblem])

  // Check the user's answer
  const checkAnswer = () => {
    const correctAnswer = num1 + num2
    const userNum = parseInt(userAnswer)

    if (userNum === correctAnswer) {
      setIsCorrect(true)
      setScore((prev) => prev + 1)
      setTimeout(generateProblem, 1500)
    } else {
      setIsCorrect(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-7xl font-extrabold text-blue-600 mb-4">
              4<span className="text-teal-500">0</span>4
            </h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              This page is missing, but your learning journey doesn't have to
              stop! While you're here, why not practice some quick math?
            </p>
          </div>

          {/* Math mini-game */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              Math Brain Teaser
            </h3>

            <div className="flex justify-center items-center gap-4 text-3xl font-bold mb-6">
              <span>{num1}</span>
              <span>+</span>
              <span>{num2}</span>
              <span>=</span>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-20 p-2 text-center rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:outline-none"
                placeholder="?"
              />
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={checkAnswer}
                disabled={userAnswer === ''}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
              >
                Check Answer
              </Button>
            </div>

            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center p-2 rounded ${
                  isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isCorrect ? 'Correct! Great job!' : 'Not quite. Try again!'}
              </motion.div>
            )}

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={generateProblem}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                New Problem
              </button>

              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-medium">Score: {score}</span>
              </div>
            </div>
          </div>

          {/* Navigation options */}
          <div className="text-center">
            <p className="text-gray-700 mb-6">
              Ready to return to your learning journey?
            </p>

            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg">
                <div className="flex items-center justify-center">
                  <Home className="mr-2 h-5 w-5" />
                  <span>Return to Homepage</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
