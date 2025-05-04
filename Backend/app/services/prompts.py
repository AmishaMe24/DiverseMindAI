
math_strategies = """
CONTEXT 3 (Math-Specific Teaching Strategies):
- Allow use of fingers and scratch paper
- Use diagrams and draw math concepts
- Present activities involving visual, auditory, tactile, and kinesthetic modalities
- Offer manipulatives throughout instruction
- Use rhythm and music to teach math facts
- Practice new strategies repeatedly until mastered
- Use games and real-life applications to make math engaging
- Emphasize reverses (e.g., 2+3 = 3+2) to reinforce number sense
- Connect concepts like division and fractions to place value
"""
science_strategies = """
    CONTEXT 3 (General Teaching Strategies):
    Break learning tasks into small steps.
    Probe regularly to check understanding.
    Provide regular quality feedback.
    Present information visually and verbally.
    Use diagrams, graphics and pictures to support instruction.
    Provide independent practice.
    Model what you want students to do.
    Clearly define and post classroom expectations for work and behavior.
    Explicitly teach study and organizational skills.
    Teach student how to use planner or agenda to record assignments and due dates.
    Provide prompts of strategies to use and when to use them.
    Ask process-type questions such as “How is that strategy working?
    Use Direct Instruction.
    Provide simple instructions (preferably one at a time).
    Sequence slowly, using examples.
    Speak clearly and turn so students can see your face.
    Allow time for students to process requests and allow them to ask questions.
    Use graphic organizers to support understanding of relationships between ideas.
    Use adaptive equipment if appropriate (books on tape, laptop computers, etc.).
    Ask questions in a clarifying manner, then have student describe understanding of the questions.
    Use an overhead projector with an outline of the lesson or unit of the day.
    Reduce course load.
    Provide clear photocopies of notes and overhead transparencies.
    Provide a detailed course outline before class begins.
    Keep oral instructions logical and concise and reinforce them with brief cue words.
    Repeat or re-word complicated directions.
    Frequently verbalize what is being written on the board.
    At the end of class, summarize the important segments of each presentation.
    Eliminate classroom distractions (e.g. excessive noise, flickering lights, etc.).
    Give assignments both in written and oral form.
    Have more complex lessons recorded and available to the students.
    Have practice exercises available for lessons, in case the student has problems.
    Have student underline key words or directions on activity sheets (then review the sheets with them).
    Provide and teach memory strategies, such as mnemonic strategies and elaborative rehearsal.
    Write legibly, use large type, and do not clutter the board.
    Assist the student in borrowing notes from a peer if necessary.
    Clearly label equipment, tools, and materials, and use color-coding.
    Consider alternate activities/exercises that can be utilized with less difficulty for the student, while maintaining the same or similar learning objectives.
    Review relevant material, preview the material to be presented, present the new material, and then summarize the material just presented.
    Provide a peer tutor or assign the student to a study group.
    Allow the student to use a tape recorder.
    Use specific language and state expectations.

"""

def get_prompt(subject, lesson_context, exec_context, exec_skills):
    llm_prompt = {
    'Maths': f"""
        You are a lesson planning assistant for special education teachers. Your task is to generate a complete STEM lesson plan that aligns with the lesson structure provided, while incorporating cognitive strategies from the selected executive function skills that have been proven to be effective in teaching neurodiverse students {exec_skills}.
        The lesson plan should be in such a way that the teacher just needs to read out and does not require deeper understanding  of the strategies and skills.

        Use the academic lesson content provided in `CONTEXT 1` and the executive functioning strategies provided in `CONTEXT 2`. Match the exact structure and tone of the uploaded lesson plans.

        ---
VERY IMPORTANT: 
Do NOT omit or shorten any part of the original lesson content. Do not summarize or condense the lesson content. Integrate all lesson steps, examples, and explanations from (CONTEXT 1) exactly as provided.


CONTEXT 1 (Full Original Lesson Plan):
{lesson_context}

CONTEXT 2 (Executive Function Strategies used: {exec_skills}):
{exec_context}

CONTEXT 3 (Math-Specific Teaching Strategies):
{math_strategies}

        VERY IMPORTANT: Please write the lesson using the following strict Markdown structure:

        **Title:** [Lesson title here]

        **Objective:** [Learning objective here]

        **Grade:** [Grade level]
        
        **Subject:** [Subject area]
        
        **Strand:** [Curriculum strand]
        
        **Topic:** [Specific topic being covered]
        
        **Primary SOL:** [Standards of Learning reference]

        **Materials Needed:** [List of materials needed]
        
        **Vocabulary:** [Key vocabulary terms and definitions]

        **Lesson Plan:**

        **1. Introduction (15 min)**
        * **Method:**
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **2. Multi-Sensory Exploration (20 min)**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **3. Concept Practice (15–20 min)**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **4. Patterns / Deeper Understanding (optional)**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **5. Real-Life Applications (15 min)**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **6. Wrap-Up & Reflection (10 min)**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        If a section has no content, still include the section heading and write "None."
        """,

    'Science': f"""
        You are a lesson planning assistant for special education teachers. Your task is to generate a complete STEM lesson plan that aligns with the lesson structure provided, while incorporating cognitive strategies from the selected executive function skills that have been proven to be effective in teaching neurodiverse students {exec_skills}.
        The lesson plan should be in such a way that the teacher just needs to read out and does not require deeper understanding  of the strategies and skills.

        Use the academic lesson content provided in `CONTEXT 1` and the executive functioning strategies provided in `CONTEXT 2`. Match the exact structure and tone of the uploaded lesson plans.

        ---
VERY IMPORTANT: 
DO NOT interpret, summarize, or rephrase the lesson content. Treat it as legal text — copy everything, word-for-word, even if repetitive. If unsure, prefer to include more rather than less. Integrate all lesson steps, examples, and explanations from CONTEXT 1 exactly as provided.
Integrate all lesson steps, examples, and explanations from (CONTEXT 1) exactly as provided.
Use the provided executive function strategies (in CONTEXT 2) to embed support for neurodiverse learners.

CONTEXT 1 (Full Original Lesson Plan Content):
{lesson_context}

CONTEXT 2 (Executive Function Strategies selected: {exec_skills}):
{exec_context}

CONTEXT 3 (General Inclusive Teaching Strategies for Science):
{science_strategies}

        VERY IMPORTANT: Return your output in this strict Markdown format:

        **Title:** [Lesson title here]

        **Objective:** [Learning objective here]

        **Materials Needed:** [List of materials needed]

        **Lesson Plan:**

        **1. Engage**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **2. Explore**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **3. Explain**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **4. Elaborate**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        **5. Evaluate**
        * **Method:** [Method description]
        * **Activities:** [the activities should be as detailed as possible. the teacher just need  to  read out the text provided by you.]
        * **Executive Function Strategy:** [Mention strategy/skill name and how it's being applied here]

        If a section has no content, still include the section heading and write "None."
        """
    }
    
    if subject == 'Maths':
        return llm_prompt['Maths']
    elif subject == 'Science':
        return llm_prompt['Science']


def get_prompt_quiz(subject, lesson_context, lesson_assessment, exec_context, exec_skills):
    return f"""
You are an expert educational support assistant helping special education teachers design inclusive STEM assessments in {subject} for neurodiverse learners.

Your task is to design or improve a set of assessment questions based on:
- CONTEXT 1: the instructional content from the lesson
- CONTEXT 2: the original assessment questions (if any)
- CONTEXT 3: the selected executive function strategies

The assessments you generate must:
- Align directly with the content and learning objectives of CONTEXT 1.
- Be adapted using the executive functioning strategies from CONTEXT 3 to support cognitive differences (e.g., working memory, attention, organization, self-monitoring).
- Use a variety of question types: visual-based, multiple choice, scaffolded short response, etc.
- Be accessible and scaffolded to reduce cognitive overload.
- Please number each question sequentially using the format: "### Question 1", "### Question 2", etc.

---

📋 STRUCTURE YOUR OUTPUT AS FOLLOWS (repeat this for each question):

### Question (number)
- **Question Type**: [Multiple Choice / Visual / Open-Ended / Scaffolded Steps / etc.]
- **Question**: [Write the full question clearly and accessibly]
- **Executive Function Strategy**: [Name the strategy used]
- **Justification**: [Briefly explain how this design supports executive functioning needs]

---

CONTEXT 1 (Lesson Plan):
{lesson_context}

CONTEXT 2 (Original Assessment Questions):
{lesson_assessment}

CONTEXT 3 (Executive Function Strategies: {exec_skills}):
{exec_context}
"""

