/**
 * Cleans and formats the raw lesson plan output from the API
 * @param {string} rawOutput - The raw lesson plan text from the API
 * @returns {string} - Cleaned and formatted lesson plan text
 */
export const formatLessonPlanOutput = (rawOutput) => {
  if (!rawOutput) return '';
  
  // Remove \boxed{ at the beginning and } at the end
  let cleanedOutput = rawOutput.replace(/^\s*\\boxed{\s*/g, '').replace(/}\s*$/g, '');
  
  // Remove any other LaTeX-style formatting that might be present
  cleanedOutput = cleanedOutput.replace(/\\[a-zA-Z]+{([^}]*)}/g, '$1');
  
  // Clean up any excessive whitespace
  cleanedOutput = cleanedOutput.replace(/\n{3,}/g, '\n\n');
  
  return cleanedOutput;
};