import React, { useState } from 'react'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { formatAssessmentOutput } from '../utils/assessmentFormatter'
import { extractQuizJson } from '../utils/quizMakerFormatter'

export default function QuizMakerOutput({ assessment, selected, dropdowns }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(null)

  // Function to handle PDF download
  const downloadPDF = async () => {
    try {
      setIsPdfLoading(true);
      setPdfError(null);
      
      // Make sure we have all required data
      if (!assessment || !selected) {
        throw new Error('Missing assessment data');
      }
      
      // Get the label for each executive skill
      const execSkillsLabels = selected.exec_skills.map(skillValue => {
        const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
        return skill ? skill.label : skillValue;
      });
      
      // Format and extract structured data from the assessment content
      const formattedAssessment = typeof assessment.assessment === 'string' 
        ? formatAssessmentOutput(assessment.assessment)
        : assessment.assessment;
      
      // Extract structured quiz data
      const quizData = extractQuizJson(formattedAssessment);
      
      // Prepare the data for PDF generation with all extracted information
      const pdfData = {
        exec_skills: execSkillsLabels,
        assessment: {
          title: quizData.title || assessment.title || 'Assessment',
          subject: selected.mainSubject,
          grade: selected.grade,
          topic: selected.topic,
          subtopic: selected.subtopic || '',
          content: formattedAssessment,
          questions: quizData.questions
        },
      };
      
      // Use the PDF route to download the PDF
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/pdf/generate-quiz-pdf`,
        pdfData,
        {
          responseType: 'blob', // Important for handling binary data
        }
      );
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or create a default one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'quiz-assessment.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
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
      setPdfError(error.message || 'Failed to download PDF');
      // Don't show alert as we'll display the error in the UI
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

  // Function to clean markdown characters from text
  const cleanMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
  };

  if (!assessment) return null

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generated Assessment</h2>
        <button
          onClick={downloadPDF}
          disabled={isPdfLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={18} />
          {isPdfLoading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      
      {pdfError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Error generating PDF:</p>
          <p>{pdfError}</p>
        </div>
      )}

      <div id="assessment-content" className="space-y-2">
        {/* Display the structured assessment */}
        {assessment && (
          <div>
            <div className="">
              <div className="space-y-2 text-gray-800 text-[15px] leading-relaxed">
                {assessment.title && (
                  <h3 className="text-2xl font-semibold text-blue-700">
                    {assessment.title}
                  </h3>
                )}
                
                <section>
                  <h4 className="font-semibold text-lg">Subject</h4>
                  <p>{selected.mainSubject}</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-lg">Grade Level</h4>
                  <p>{selected.grade}</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-lg">Topic</h4>
                  <p>{selected.topic}</p>
                </section>
                
                {selected.mainSubject === 'Maths' && selected.subtopic && (
                  <section>
                    <h4 className="font-semibold text-lg">Sub-Topic</h4>
                    <p>{selected.subtopic}</p>
                  </section>
                )}
                
                <section>
                  <h4 className="font-semibold text-lg">Executive Function Skills</h4>
                  <p>{formatExecSkills()}</p>
                </section>
                
                {/* Display the assessment content in a structured format */}
                {assessment.assessment && (
                  <section>
                    <h4 className="font-semibold text-lg">Assessment Questions</h4>
                    <div className="mt-2">
                      {(() => {
                        const quizData = extractQuizJson(assessment.assessment);
                        return (
                          <div className="space-y-6">
                            {quizData.questions.length > 0 ? (
                              quizData.questions.map((question, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="mb-2">
                                    <span className="font-semibold text-blue-700">
                                      Question {question.number || (index + 1)}
                                    </span>
                                    {question.type && (
                                      <span className="ml-2 text-sm text-gray-500">({question.type})</span>
                                    )}
                                  </div>
                                  
                                <div className="mb-3">
                                  {/* Handle markdown characters properly */}
                                  <ReactMarkdown 
                                    components={{
                                      // Remove styling from markdown elements but keep the content
                                      strong: ({node, ...props}) => <span {...props} />,
                                      em: ({node, ...props}) => <span {...props} />,
                                      h1: ({node, ...props}) => <span className="font-semibold" {...props} />,
                                      h2: ({node, ...props}) => <span className="font-semibold" {...props} />,
                                      h3: ({node, ...props}) => <span className="font-semibold" {...props} />
                                    }}
                                  >
                                    {question.text || "No question text available"}
                                  </ReactMarkdown>
                                </div>
                                  
                                  {question.options && question.options.length > 0 && (
                                    <div className="mb-3 pl-4">
                                      {question.options.map((option, optIndex) => (
                                      <div key={optIndex} className="mb-1">
                                        <ReactMarkdown
                                          components={{
                                            // Remove styling from markdown elements but keep the content
                                            strong: ({node, ...props}) => <span {...props} />,
                                            em: ({node, ...props}) => <span {...props} />,
                                            h1: ({node, ...props}) => <span className="font-semibold" {...props} />,
                                            h2: ({node, ...props}) => <span className="font-semibold" {...props} />,
                                            h3: ({node, ...props}) => <span className="font-semibold" {...props} />
                                          }}
                                        >
                                          {option}
                                        </ReactMarkdown>
                                      </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {question.strategy && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-sm font-medium text-gray-700">Executive Function Strategy: </span>
                                      <span className="text-sm text-gray-600">{cleanMarkdown(question.strategy)}</span>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
                                <p>No structured questions found. The assessment may be in a different format.</p>
                                <div className="mt-2 p-4 bg-white rounded border border-gray-200">
                                  <ReactMarkdown>{assessment.assessment}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
