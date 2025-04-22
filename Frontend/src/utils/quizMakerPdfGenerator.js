import { marked } from 'marked';

// Extract only the assessment content, removing any introductory text
const filterLLMResponse = (text) => {
  // First, check if there's an introductory phrase to remove
  const introPattern = /^Okay,\s+I'm\s+ready\s+to\s+help[\s\S]*?((?=\*\*)|$)/i;
  let cleanedText = text.replace(introPattern, '');

  cleanedText = cleanedText.replace(/\*\*Here's\s+the\s+redesigned\s+assessment:\*\*[\s\n]*/i, '');
  const conclusionPattern = /By\s+implementing\s+these\s[\s\S]*$/i;
  cleanedText = cleanedText.replace(conclusionPattern, '');
  
  // Now extract just the assessment content
  const headingPattern = /(\*\*[^*]+\*\*[\s\S]*)/i;
  const match = cleanedText.match(headingPattern);
  
  // Return only the assessment content or the cleaned text if no specific heading found
  return match ? match[1].trim() : cleanedText.trim();
};

// Generate and print PDF using browser's print functionality
export const downloadQuizAsPDF = (assessment, selected, dropdowns, setIsDownloading) => {
  if (!assessment) return;
  setIsDownloading(true);

  try {
    // Prepare content - filter out introductory text
    const raw = assessment.assessment || '';
    const relevant = filterLLMResponse(raw);
    const htmlContent = marked(relevant);

    // Utility to get labels from dropdown selections
    const getLabel = (type, value) =>
      dropdowns[type].options.find(o => o.value === value)?.label || value;

    const title = assessment.title || 'Math Assessment';
    const subject = getLabel('subject', selected.subject);
    const topic = getLabel('topic', selected.topic);
    const grade = getLabel('grade', selected.grade);
    const adaptation = getLabel('disorder', selected.disorder);

    // Build HTML for printing with header information
    const headerHtml = `
      <h1>${title}</h1>
      <p><strong>Subject:</strong> ${subject} &bull;
         <strong>Topic:</strong> ${topic} &bull;
         <strong>Grade:</strong> ${grade} &bull;
         <strong>Adaptation:</strong> ${adaptation}</p>
      <hr />
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          h1 { font-size: 24px; color: #2563EB; margin: 0 0 8px; }
          h2 { font-size: 20px; color: #3B82F6; margin: 16px 0 8px; }
          h3 { font-size: 18px; color: #60A5FA; margin: 14px 0 8px; }
          p { margin: 4px 0; font-size: 12px; color: #1F2937; }
          ul { margin: 8px 0 16px 20px; }
          li { margin-bottom: 4px; }
          pre { background: #F3F4F6; padding: 8px; border-radius: 4px; }
          code { background: #F3F4F6; padding: 2px 4px; border-radius: 3px; }
          blockquote { border-left: 4px solid #3B82F6; padding-left: 8px; color: #4B5563; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #D1D5DB; padding: 6px; font-size: 12px; }
          th { background: #F3F4F6; }
          details { margin: 10px 0; }
          summary { cursor: pointer; font-weight: bold; color: #4B5563; }
          .formula-box { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div style="padding: 0 15mm;">
          ${headerHtml}
          ${htmlContent}
        </div>
        <script>
          window.onload = () => { 
            window.print(); 
            // Close the window after print dialog is closed (may not work in all browsers)
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    // Open new window and write content for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.focus();
  } catch (err) {
    console.error('Print generation error', err);
    alert('Failed to prepare print. Please try again.');
  } finally {
    // Ensure downloading state is reset even when print completes
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  }
};