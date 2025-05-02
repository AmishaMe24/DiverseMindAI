import React, { useState } from 'react'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

export default function LessonPlanOutput({ lessonPlan, selected, dropdowns }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Function to handle PDF download
  const downloadPDF = async () => {
    try {
      setIsPdfLoading(true)
      
      // Format executive skills for the API
      const execSkillsLabels = selected.exec_skills.map(skillValue => {
        const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
        return skill ? skill.label : skillValue;
      });
      
      // Prepare data for the API
      const pdfData = {
        lessonName: lessonPlan.lessonName,
        concept: lessonPlan.concept,
        lessonPlan: lessonPlan.lessonPlan,
        subject: selected.mainSubject,
        grade: selected.grade,
        topic: selected.topic,
        subtopic: selected.subtopic || null,
        exec_skills: execSkillsLabels
      };
      
      // Make API call to generate PDF
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/pdf/generate-lesson-pdf`,
        pdfData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers['Content-Disposition'];
      let filename = `Grade${selected.grade}_${selected.subtopic.replace(/\s+/g, '_')}_LessonPlan.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Format executive skills for display
  const formatExecSkills = () => {
    return selected.exec_skills.map(skillValue => {
      const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
      return skill ? skill.label : skillValue;
    }).join(', ');
  };

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

      <div id="lesson-plan-content" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Subject</h3>
            <p className="text-gray-700">{selected.mainSubject}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Grade Level</h3>
            <p className="text-gray-700">{selected.grade}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Topic</h3>
            <p className="text-gray-700">{selected.topic}</p>
          </div>
          {selected.mainSubject !== 'Science' && (
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Sub-Topic</h3>
              <p className="text-gray-700">{selected.subtopic}</p>
            </div>
          )}
          <div className={selected.mainSubject === 'Science' ? "md:col-span-1" : "md:col-span-2"}>
            <h3 className="font-medium text-gray-800 mb-1">Executive Function Skills</h3>
            <p className="text-gray-700">{formatExecSkills()}</p>
          </div>
        </div>

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
