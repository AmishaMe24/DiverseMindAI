import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { extractLessonPlanJson } from '../utils/lessonPlanFormatter'
import axios from 'axios'

export default function LessonPlanOutput({ lessonPlan, selected, dropdowns }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(null)

  // Function to handle PDF download
  const downloadPDF = async () => {
    try {
      setIsPdfLoading(true);
      setPdfError(null);
      
      // Make sure we have all required data
      if (!lessonPlan || !selected) {
        throw new Error('Missing lesson plan data');
      }
      
      // Get the label for each executive skill
      const execSkillsLabels = selected.exec_skills.map(skillValue => {
        const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
        return skill ? skill.label : skillValue;
      });
      
      // Extract all the content from the lesson plan
      const content = typeof lessonPlan.lessonPlan === 'string' 
        ? extractLessonPlanJson(lessonPlan.lessonPlan)
        : lessonPlan.lessonPlan;
      
      // Prepare the data for PDF generation with all extracted information
      const pdfData = {
        exec_skills: execSkillsLabels,
        lessonPlan: {
          title: content.title || '',
          objective: content.objective || '',
          grade: content.grade || selected.grade,
          subject: content.subject || selected.mainSubject,
          strand: content.strand || '',
          topic: content.topic || selected.topic,
          primarySOL: content.primarySOL || '',
          materials: content.materials || '',
          vocabulary: content.vocabulary || '',
          sections: content.sections || []
        },
      };
      
      // Use the PDF route to download the PDF
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/pdf/generate-lesson-pdf`,
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
      let filename = 'lesson-plan.pdf';
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
          {isPdfLoading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      
      {pdfError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Error generating PDF:</p>
          <p>{pdfError}</p>
        </div>
      )}

      <div id="lesson-plan-content" className="space-y-2">
        {/* Display the structured lesson plan */}
        {lessonPlan.lessonPlan && (
          <div>
            <div className="">
              {(() => {
                const content = typeof lessonPlan.lessonPlan === 'string' 
                  ? extractLessonPlanJson(lessonPlan.lessonPlan)
                  : lessonPlan.lessonPlan;
                
                return (
                  <div className="space-y-2 text-gray-800 text-[15px] leading-relaxed">
                    {content.title && (
                      <h3 className="text-2xl font-semibold text-blue-700">
                        {content.title}
                      </h3>
                    )}
                    
                    {content.objective && (
                      <section>
                        <h4 className="font-semibold text-lg">Objective</h4>
                        <p>{content.objective}</p>
                      </section>
                    )}
                    
                    {content.grade && (
                      <section>
                        <h4 className="font-semibold text-lg">Grade</h4>
                        <p>{content.grade}</p>
                      </section>
                    )}
                    
                    {content.subject && (
                      <section>
                        <h4 className="font-semibold text-lg">Subject</h4>
                        <p>{content.subject}</p>
                      </section>
                    )}
                    
                    {content.strand && (
                      <section>
                        <h4 className="font-semibold text-lg">Strand</h4>
                        <p>{content.strand}</p>
                      </section>
                    )}
                    
                    {content.topic && (
                      <section>
                        <h4 className="font-semibold text-lg">Topic</h4>
                        <p>{content.topic}</p>
                      </section>
                    )}
                    
                    {content.primarySOL && (
                      <section>
                        <h4 className="font-semibold text-lg">Primary SOL</h4>
                        <p>{content.primarySOL}</p>
                      </section>
                    )}
                    
                    {content.materials && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Materials Needed
                        </h4>
                        <p>{content.materials}</p>
                      </section>
                    )}
                    
                    {content.vocabulary && (
                      <section>
                        <h4 className="font-semibold text-lg">
                          Vocabulary
                        </h4>
                        <p>{content.vocabulary}</p>
                      </section>
                    )}
                    
                    {content.sections && content.sections.length > 0 && (
                      <div className="space-y-6">
                        {content.sections.map((section, index) => (
                          <section key={index} className="border-l-4 border-blue-200 pl-4 py-1">
                            <h4 className="font-semibold text-lg text-blue-700">
                              {section.title}
                            </h4>
                            
                            {section.method && (
                              <div className="mt-3">
                                <h5 className="font-medium text-gray-800">Method</h5>
                                <p className="mt-1">{section.method}</p>
                              </div>
                            )}
                            
                            {section.activities && (
                              <div className="mt-3">
                                <h5 className="font-medium text-gray-800">Activities</h5>
                                {section.activities.split('- ').filter(item => item.trim()).map((activity, idx) => (
                                  <p key={idx} className="mt-1 pl-4 border-l-2 border-gray-200">
                                    {activity.trim()}
                                  </p>
                                ))}
                              </div>
                            )}
                            
                            {section.executiveFunction && (
                              <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                                <h5 className="font-medium text-gray-800">Executive Function Strategy</h5>
                                <p className="mt-1">{section.executiveFunction}</p>
                              </div>
                            )}
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
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
