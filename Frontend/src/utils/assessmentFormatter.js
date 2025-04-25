/**
 * Cleans and formats the raw assessment output from the API
 * @param {string|object} rawOutput - The raw assessment data from the API
 * @returns {string|object} - Cleaned and formatted assessment data
 */
export const formatAssessmentOutput = (rawOutput) => {
  if (!rawOutput) return null;
  
  // If the input is a string, clean it directly
  if (typeof rawOutput === 'string') {
    return cleanAssessmentText(rawOutput);
  }
  
  // If the input is an object with an assessment property
  if (typeof rawOutput === 'object' && rawOutput !== null) {
    // Create a copy of the object to avoid mutating the original
    const result = { ...rawOutput };
    
    // Clean the assessment text if it exists
    if (typeof result === 'string') {
      return cleanAssessmentText(result);
    } else if (typeof result === 'object' && result !== null && typeof result.assessment === 'string') {
      result.assessment = cleanAssessmentText(result.assessment);
      return result;
    }
    return result;
  }
  
  // If we can't process it, return it unchanged
  return rawOutput;
};

/**
 * Helper function to clean assessment text
 * @param {string} text - The assessment text to clean
 * @returns {string} - Cleaned assessment text
 */
const cleanAssessmentText = (text) => {
  if (typeof text !== 'string') return text;
  
  let cleanedText = text;
  
  // First, check if "Redesigned Assessment Tasks:" is present in the text
  const tasksTitleIndex = cleanedText.indexOf('Redesigned Assessment Tasks:');
  
  // If the title exists, return everything from that point onwards
  if (tasksTitleIndex !== -1) {
    cleanedText = cleanedText.substring(tasksTitleIndex);
    
    // Clean up any excessive whitespace
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    
    return cleanedText;
  }
  
  // If the specific title isn't found, try other common patterns
  
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
  
  // Check for "**Redesigned Assessment Tasks**" format (with asterisks)
  const boldTasksTitleIndex = cleanedText.indexOf('**Redesigned Assessment Tasks**');
  
  // If the bold title exists, return everything from that point onwards
  if (boldTasksTitleIndex !== -1) {
    cleanedText = cleanedText.substring(boldTasksTitleIndex);
    
    // Also check for conclusion text after finding the title
    for (const pattern of conclusionPatterns) {
      if (pattern.test(cleanedText)) {
        cleanedText = cleanedText.replace(pattern, '');
        break;
      }
    }
  }
  
  // Clean up any excessive whitespace
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  return cleanedText;
};