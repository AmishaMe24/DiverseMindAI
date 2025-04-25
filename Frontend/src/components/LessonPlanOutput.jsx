import React, { useRef, useState} from 'react'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { downloadLessonPlanAsPDF } from '../utils/lessonPlanPdfGenerator'

export default function LessonPlanOutput({ lessonPlan, selected, dropdowns }) {
  const pdfRef = useRef()
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Function to handle PDF download
  const downloadPDF = () => {
    downloadLessonPlanAsPDF(lessonPlan, selected, dropdowns, setIsPdfLoading)
  }

  if (!lessonPlan) return null

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generated Lesson Plan</h2>
        <button
          onClick={downloadPDF}
          disabled={isPdfLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={18} />
          {isPdfLoading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      </div>

      <div id="lesson-plan-content" className="space-y-6" ref={pdfRef}>
        <div>
          <h3 className="font-medium text-gray-800 mb-1">Lesson Title</h3>
          <p className="text-gray-700">{lessonPlan.lessonName}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-1">Concept</h3>
          <p className="text-gray-700">{lessonPlan.concept}</p>
        </div>

        {/* Display the raw lesson plan text as markdown */}
        {lessonPlan.lessonPlan && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Lesson Plan</h3>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ReactMarkdown>{lessonPlan.lessonPlan}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Display examples if available */}
        {lessonPlan.examples && lessonPlan.examples.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Examples</h3>
            <ul className="list-disc pl-5 space-y-2">
              {lessonPlan.examples.map((example, index) => (
                <li key={index} className="text-gray-700">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}