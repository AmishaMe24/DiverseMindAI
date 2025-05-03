/**
 * Extracts structured lesson plan data from formatted markdown text
 * @param {string} raw - The formatted lesson plan text
 * @returns {Object} - Structured lesson plan data
 */
export const extractLessonPlanJson = (raw) => {
  // Check if raw is already an object or not a string
  if (!raw || typeof raw !== 'string') {
    console.error('Invalid input to extractLessonPlanJson:', raw);
    return {
      title: '',
      objective: '',
      lessonPlanName: '',
      grade: '',
      subject: '',
      strand: '',
      topic: '',
      primarySOL: '',
      materials: '',
      vocabulary: '',
      sections: []
    };
  }

  const result = {
    title: '',
    objective: '',
    lessonPlanName: '',
    grade: '',
    subject: '',
    strand: '',
    topic: '',
    primarySOL: '',
    materials: '',
    vocabulary: '',
    sections: []
  };

  console.log('raw:', raw);

  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  let currentSection = null;
  let currentSubsection = null;
  let sectionIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Extract title
    if (/^\*\*Title:\*\*/i.test(line)) {
      result.title = line.replace(/^\*\*Title:\*\*/i, '').trim();
      continue;
    }
    
    // Extract objective
    if (/^\*\*Objective:\*\*/i.test(line)) {
      result.objective = line.replace(/^\*\*Objective:\*\*/i, '').trim();
      continue;
    }
    
    // Extract grade
    if (/^\*\*Grade:\*\*/i.test(line)) {
      result.grade = line.replace(/^\*\*Grade:\*\*/i, '').trim();
      continue;
    }
    
    // Extract subject
    if (/^\*\*Subject:\*\*/i.test(line)) {
      result.subject = line.replace(/^\*\*Subject:\*\*/i, '').trim();
      continue;
    }
    
    // Extract strand
    if (/^\*\*Strand:\*\*/i.test(line)) {
      result.strand = line.replace(/^\*\*Strand:\*\*/i, '').trim();
      continue;
    }
    
    // Extract topic
    if (/^\*\*Topic:\*\*/i.test(line)) {
      result.topic = line.replace(/^\*\*Topic:\*\*/i, '').trim();
      continue;
    }
    
    // Extract primary SOL
    if (/^\*\*Primary SOL:\*\*/i.test(line)) {
      result.primarySOL = line.replace(/^\*\*Primary SOL:\*\*/i, '').trim();
      
      // Check if the next line continues the SOL (for multi-part SOLs)
      let j = i + 1;
      while (j < lines.length && 
            !lines[j].includes('**') && // Not a new section header
            !lines[j].startsWith('*') && // Not a bullet point
            lines[j].trim()) { // Not empty
        result.primarySOL += ' ' + lines[j].trim();
        j++;
      }
      i = j - 1; // Update the loop counter to skip processed lines
      continue;
    }
    
    // Extract materials
    if (/^\*\*Materials Needed:\*\*/i.test(line)) {
      // For materials, we need to handle both inline and multi-line formats
      let materials = line.replace(/^\*\*Materials Needed:\*\*/i, '').trim();
      
      // If materials is empty or just has a dash/bullet, look at next lines
      if (!materials || materials === '-' || materials === '*') {
        let materialItems = [];
        // Look ahead for bullet points that are part of materials
        let j = i + 1;
        while (j < lines.length && 
              (lines[j].startsWith('-') || lines[j].startsWith('*')) && 
              !lines[j].includes('**Lesson Plan:**') && 
              !lines[j].includes('**Vocabulary:**')) {
          materialItems.push(lines[j].replace(/^[-*]\s*/, '').trim());
          j++;
        }
        materials = materialItems.join(', ');
        i = j - 1; // Update the loop counter to skip processed lines
      }
      
      result.materials = materials;
      continue;
    }
    
    // Extract vocabulary
    if (/^\*\*Vocabulary:\*\*/i.test(line)) {
      // For vocabulary, we need to handle both inline and multi-line formats
      let vocabulary = line.replace(/^\*\*Vocabulary:\*\*/i, '').trim();
      
      // If vocabulary is empty or just has a dash/bullet, look at next lines
      if (!vocabulary || vocabulary === '-' || vocabulary === '*') {
        vocabulary = '';
        // Look ahead for bullet points that are part of vocabulary
        let j = i + 1;
        while (j < lines.length && 
              (lines[j].startsWith('-') || lines[j].startsWith('*')) && 
              !lines[j].includes('**Lesson Plan:**')) {
          vocabulary += (vocabulary ? ' ' : '') + lines[j].replace(/^[-*]\s*/, '').trim();
          j++;
        }
        i = j - 1; // Update the loop counter to skip processed lines
      }
      
      result.vocabulary = vocabulary;
      continue;
    }
    
    // Check for Lesson Plan header
    if (/^\*\*Lesson Plan:\*\*/i.test(line)) {
      continue; // Skip this header line
    }
    
    // Check for numbered section headers (e.g., "**1. Introduction (15 min)**")
    const sectionMatch = line.match(/^\*\*(\d+)\.\s+(.*?)\*\*/);
    if (sectionMatch) {
      sectionIndex++;
      currentSection = sectionMatch[2].trim();
      result.sections[sectionIndex] = {
        title: currentSection,
        method: '',
        activities: '',
        executiveFunction: ''
      };
      currentSubsection = null;
      continue;
    }
    
    // Check for subsection headers with bullet points
    if (sectionIndex >= 0) {
      // Match both formats: "* **Method:**" and "**Method:**"
      if (/^\*\s+\*\*Method:\*\*/i.test(line) || /^\*\*Method:\*\*/i.test(line)) {
        currentSubsection = 'method';
        result.sections[sectionIndex].method = line
          .replace(/^\*\s+\*\*Method:\*\*/i, '')
          .replace(/^\*\*Method:\*\*/i, '')
          .trim();
        continue;
      } else if (/^\*\s+\*\*Activities:\*\*/i.test(line) || /^\*\*Activities:\*\*/i.test(line)) {
        currentSubsection = 'activities';
        result.sections[sectionIndex].activities = line
          .replace(/^\*\s+\*\*Activities:\*\*/i, '')
          .replace(/^\*\*Activities:\*\*/i, '')
          .trim();
        continue;
      } else if (/^\*\s+\*\*Executive Function Strategy:\*\*/i.test(line) || /^\*\*Executive Function Strategy:\*\*/i.test(line)) {
        currentSubsection = 'executiveFunction';
        result.sections[sectionIndex].executiveFunction = line
          .replace(/^\*\s+\*\*Executive Function Strategy:\*\*/i, '')
          .replace(/^\*\*Executive Function Strategy:\*\*/i, '')
          .trim();
        continue;
      }
    }
    
    // Handle bullet points and additional content for current subsection
    if (line && currentSubsection && sectionIndex >= 0) {
      // Remove bullet point markers
      const cleanedLine = line.replace(/^\*\s+/, '').trim();
      
      if (cleanedLine) {
        // Append to the current subsection with proper spacing
        const currentContent = result.sections[sectionIndex][currentSubsection];
        result.sections[sectionIndex][currentSubsection] = currentContent 
          ? `${currentContent} ${cleanedLine}`
          : cleanedLine;
      }
    }
  }

  return result;
};