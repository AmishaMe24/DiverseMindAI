/**
 * Extracts structured icebreaker data from formatted markdown text
 * @param {string} raw - The formatted icebreaker text
 * @returns {Object} - Structured icebreaker data
 */
export const extractIcebreakerJson = (raw) => {
  // Check if raw is already an object or not a string
  if (!raw || typeof raw !== 'string') {
    console.error('Invalid input to extractIcebreakerJson:', raw);
    return {
      title: '',
      objective: '',
      materials: '',
      instructions: [],
      questions: [],
      debrief: [],
      tips: [],
      variations: []
    };
  }

  const result = {
    title: '',
    objective: '',
    materials: '',
    instructions: [],
    questions: [],
    debrief: [],
    tips: [],
    variations: []
  };

  // Split the content by lines and process each section
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  let currentSection = null;
  let bulletPoints = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for section headers
    if (/^\*\*Title:\*\*/i.test(line)) {
      result.title = line.replace(/^\*\*Title:\*\*/i, '').trim();
      currentSection = null;
      continue;
    }
    
    if (/^\*\*Objective:\*\*/i.test(line)) {
      result.objective = line.replace(/^\*\*Objective:\*\*/i, '').trim();
      currentSection = null;
      continue;
    }
    
    if (/^\*\*Materials Needed:\*\*/i.test(line)) {
      result.materials = line.replace(/^\*\*Materials Needed:\*\*/i, '').trim();
      currentSection = null;
      continue;
    }
    
    if (/^\*\*Instructions:\*\*/i.test(line)) {
      currentSection = 'instructions';
      bulletPoints = [];
      continue;
    }
    
    if (/^\*\*Debrief \/ Discussion Points:\*\*/i.test(line)) {
      currentSection = 'debrief';
      bulletPoints = [];
      continue;
    }
    
    if (/^\*\*Tips for Success:\*\*/i.test(line)) {
      currentSection = 'tips';
      bulletPoints = [];
      continue;
    }
    
    if (/^\*\*Variations:\*\*/i.test(line)) {
      currentSection = 'variations';
      bulletPoints = [];
      continue;
    }
    
    // Handle "Sample Questions" section which might have different formats
    if (/Sample.*?Questions/i.test(line)) {
      currentSection = 'questions';
      bulletPoints = [];
      continue;
    }
    
    // Process content based on current section
    if (line && currentSection) {
      // Check if line is a bullet point
      if (line.startsWith('*') || line.startsWith('-')) {
        const cleanedLine = line.replace(/^[-*]\s*/, '').trim();
        if (cleanedLine) {
          result[currentSection].push(cleanedLine);
        }
      } 
      // If not a bullet point but we're in a section that expects bullet points
      else if (['instructions', 'questions', 'debrief', 'tips', 'variations'].includes(currentSection)) {
        // If it's not a section header, add it to the current section
        if (!line.includes('**') || !line.endsWith(':**')) {
          result[currentSection].push(line);
        }
      }
    }
  }

  return result;
};
