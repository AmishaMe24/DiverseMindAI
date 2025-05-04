/**
 * Extracts structured quiz data from formatted markdown text
 * @param {string} raw - The formatted quiz text
 * @returns {Object} - Structured quiz data
 */
export const extractQuizJson = (raw) => {
  // Check if raw is already an object or not a string
  if (!raw || typeof raw !== 'string') {
    console.error('Invalid input to extractQuizJson:', raw);
    return {
      title: '',
      questions: []
    };
  }

  const result = {
    title: '',
    questions: []
  };

  // First, clean the text by removing common preamble and conclusion patterns
  let cleanedText = cleanAssessmentText(raw);
  
  // Extract title if present (usually at the beginning)
  const titleMatch = cleanedText.match(/^#\s+(.*?)(?:\n|$)/);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
    // Remove the title from the text
    cleanedText = cleanedText.replace(titleMatch[0], '');
  }

  // Find all question sections using regex to capture the question number and content
  const questionRegex = /###\s+Question\s+(\d+)([\s\S]*?)(?=###\s+Question\s+\d+|$)/g;
  const questions = [];
  let match;
  
  // Use exec to iterate through all matches
  while ((match = questionRegex.exec(cleanedText)) !== null) {
    const questionNumber = match[1];
    const questionContent = match[2].trim();
    
    // Extract question type if present
    let questionType = '';
    const typeMatch = questionContent.match(/\*\*Question Type\*\*:\s*(.*?)(?:\n|$)/);
    if (typeMatch) {
      questionType = typeMatch[1].trim();
    }
    
    // Extract the actual question
    let questionText = '';
    const questionMatch = questionContent.match(/\*\*Question\*\*:\s*([\s\S]*?)(?=\*\*Executive Function Strategy\*\*:|$)/);
    if (questionMatch) {
      questionText = questionMatch[1].trim();
    }
    
    // Extract executive function strategy
    let strategy = '';
    const strategyMatch = questionContent.match(/\*\*Executive Function Strategy\*\*:\s*(.*?)(?:\n\*\*Justification\*\*:|$)/s);
    if (strategyMatch) {
      strategy = strategyMatch[1].trim();
    }
    
    // Extract options if present
    const options = extractOptions(questionContent);
    
    questions.push({
      number: questionNumber,
      type: questionType,
      text: questionText,
      strategy: strategy,
      options: options
    });
  }
  
  // If no questions were found with the ### format, try an alternative approach
  if (questions.length === 0) {
    // Try to find questions with a different format (e.g., "Question 1:", "1.", etc.)
    const altQuestionPattern = /(?:^|\n)(?:Question\s+(\d+):|(\d+)\.)\s*([\s\S]*?)(?=(?:\n|^)(?:Question\s+\d+:|\d+\.)|$)/g;
    
    while ((match = altQuestionPattern.exec(cleanedText)) !== null) {
      const questionNumber = match[1] || match[2];
      const questionContent = match[3].trim();
      
      questions.push({
        number: questionNumber,
        type: '',
        text: questionContent,
        strategy: '',
        options: extractOptions(questionContent)
      });
    }
  }
  
  // Set the questions in the result
  result.questions = questions;
  
  return result;
};

/**
 * Helper function to clean assessment text
 * @param {string} text - The assessment text to clean
 * @returns {string} - Cleaned assessment text
 */
const cleanAssessmentText = (text) => {
  if (typeof text !== 'string') return text;
  
  let cleanedText = text;
  
  // Remove common preamble patterns
  const preamblePatterns = [
    /^Based on the provided CONTEXT \d+, CONTEXT \d+, and CONTEXT \d+.*?\n\n/is,
    /^To improve the assessment tasks.*?\n\n/is,
    /^Here's a revised version*?\n\n/is,
    /^I will redesign the assessment tasks.*?\n\n/is,
    /^Based on the instructional content.*?\n\n/is,
    /^Here are redesigned assessment tasks.*?\n\n/is,
    /^I have redesigned the assessment.*?\n\n/is,
    /^Below are the redesigned assessment.*?\n\n/is,
    /^To improve or redesign the assessment tasks.*?\n\n/is,
    /^Here are the redesigned assessment tasks.*?\n\n/is,
    /^To address the task, I'll redesign the assessment.*?\n\n/is
  ];
  
  // Remove common conclusion patterns
  const conclusionPatterns = [
    /\n\nBy incorporating*?$/is,
    /\n\nThese redesigned assessment tasks.*?$/is,
    /\n\nThrough these modifications.*?$/is,
    /\n\nBy redesigning the assessment tasks*?$/is,
    /\n\nIn conclusion,.*?$/is,
    /\n\nThese assessments are designed.*?$/is
  ];
  
  // Try each preamble pattern until one works
  for (const pattern of preamblePatterns) {
    if (pattern.test(cleanedText)) {
      cleanedText = cleanedText.replace(pattern, '');
      break; // Stop after first successful replacement
    }
  }
  
  // Try each conclusion pattern until one works
  for (const pattern of conclusionPatterns) {
    if (pattern.test(cleanedText)) {
      cleanedText = cleanedText.replace(pattern, '');
      break; // Stop after first successful replacement
    }
  }
  
  // Clean up any excessive whitespace
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  return cleanedText;
};

/**
 * Extract options from question text if present
 * @param {string} questionText - The question text
 * @returns {Array} - Array of options if found, empty array otherwise
 */
const extractOptions = (questionText) => {
  const options = [];
  
  // Look for patterns like "a)", "A.", "1.", etc.
  const optionLines = questionText.split('\n');
  
  for (const line of optionLines) {
    const trimmedLine = line.trim();
    // Match option patterns like "a)", "A.", "1.", etc.
    if (/^[a-z]\)|\([a-z]\)|^[A-Z]\.|\d+\./.test(trimmedLine)) {
      options.push(trimmedLine);
    }
  }
  
  return options;
};
