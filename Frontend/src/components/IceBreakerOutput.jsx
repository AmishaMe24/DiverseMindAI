import React, { useState } from 'react'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { extractIcebreakerJson } from '../utils/iceBreakerFormatter'

export default function IceBreakerOutput({ icebreaker, selected, dropdowns }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(null)


  // Function to handle PDF download
  const downloadPDF = async () => {
    try {
      setIsPdfLoading(true);
      setPdfError(null);
      
      // Make sure we have all required data
      if (!icebreaker || !selected) {
        throw new Error('Missing icebreaker data');
      }
      
      // Extract all the content from the icebreaker
      const content = extractIcebreakerJson(icebreaker);
      
      // Get the label for each executive skill
      const execSkillsLabels = selected.exec_skills ? selected.exec_skills.map(skillValue => {
        const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
        return skill ? skill.label : skillValue;
      }) : [];
      
      // Prepare the data for PDF generation with all extracted information
      const pdfData = {
        setting: selected.setting,
        activity: selected.activity || '',
        materials: selected.materials || '',
        exec_skills: execSkillsLabels,
        icebreaker: content
      };
      
      // Use the PDF route to download the PDF
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/pdf/generate-icebreaker-pdf`,
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
      let filename = 'icebreaker-activity.pdf';
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

  // Helper function to render lists
  const renderList = (items, ordered = false) => {
    const ListTag = ordered ? 'ol' : 'ul'
    return (
      <ListTag
        className={`${
          ordered ? 'list-decimal' : 'list-disc'
        } list-outside space-y-2 pl-6`}
      >
        {items.map((item, i) => (
          <li key={i} className="ml-1">
            <span className="inline">
              <ReactMarkdown
                components={{ p: ({ node, ...props }) => <span {...props} /> }}
              >
                {item}
              </ReactMarkdown>
            </span>
          </li>
        ))}
      </ListTag>
    )
  }

  if (!icebreaker) return null

  const content = extractIcebreakerJson(icebreaker);

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Suggested Activity</h2>
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

      <div id="icebreaker-content" className="space-y-2">
        {/* Display the structured icebreaker */}
        {icebreaker && (
          <div>
            <div className="">
              <div className="space-y-2 text-gray-800 text-[15px] leading-relaxed">
                {content.title && (
                  <h3 className="text-2xl font-semibold text-blue-700">
                    {content.title}
                  </h3>
                )}
                
                <section>
                  <h4 className="font-semibold text-lg">Setting</h4>
                  <p>{selected.setting}</p>
                </section>
                
                {selected.activity && (
                  <section>
                    <h4 className="font-semibold text-lg">Activity Type</h4>
                    <p>{selected.activity}</p>
                  </section>
                )}
                
                {selected.exec_skills && selected.exec_skills.length > 0 && (
                  <section>
                    <h4 className="font-semibold text-lg">Executive Function Skills</h4>
                    <p>{selected.exec_skills.map(skillValue => {
                      const skill = dropdowns.exec_skills.options.find(opt => opt.value === skillValue);
                      return skill ? skill.label : skillValue;
                    }).join(', ')}</p>
                  </section>
                )}
                
                {content.objective && (
                  <section>
                    <h4 className="font-semibold text-lg">Objective</h4>
                    <p>{content.objective}</p>
                  </section>
                )}
                
                {content.materials && (
                  <section>
                    <h4 className="font-semibold text-lg">Materials Needed</h4>
                    <p>{content.materials}</p>
                  </section>
                )}
                
                {content.instructions.length > 0 && (
                  <section className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-700">Instructions</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <ol className="list-decimal list-outside pl-5 space-y-2">
                        {content.instructions.map((instruction, idx) => (
                          <li key={idx} className="pl-2">
                            <ReactMarkdown>{instruction}</ReactMarkdown>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>
                )}
                
                {content.questions.length > 0 && (
                  <section className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-700">Sample Questions</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <ul className="list-disc list-outside pl-5 space-y-2">
                        {content.questions.map((question, idx) => (
                          <li key={idx} className="pl-2">
                            <ReactMarkdown>{question}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
                
                {content.debrief.length > 0 && (
                  <section className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-700">Debrief / Discussion Points</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <ul className="list-disc list-outside pl-5 space-y-2">
                        {content.debrief.map((point, idx) => (
                          <li key={idx} className="pl-2">
                            <ReactMarkdown>{point}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
                
                {content.tips.length > 0 && (
                  <section className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-700">Tips for Success</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <ul className="list-disc list-outside pl-5 space-y-2">
                        {content.tips.map((tip, idx) => (
                          <li key={idx} className="pl-2">
                            <ReactMarkdown>{tip}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
                
                {content.variations.length > 0 && (
                  <section className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-700">Variations</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <ul className="list-disc list-outside pl-5 space-y-2">
                        {content.variations.map((variation, idx) => (
                          <li key={idx} className="pl-2">
                            <ReactMarkdown>{variation}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
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
