from fastapi import HTTPException, Query, Body, status, APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import json

router = APIRouter()


class LessonPlanRequest(BaseModel):
    disorder: str = Field(..., description="Learning disorder or condition to address")
    topic: str = Field(..., description="Mathematical topic for the lesson")
    grade: str = Field(..., description="Grade level for the lesson")
    additional_info: Optional[str] = Field(
        None, description="Additional information or requirements"
    )
    prompt: str = Field(..., description="Main prompt for lesson plan generation")


class LessonPlanResponse(BaseModel):
    title: str
    lessonName: str
    gradeLevel: str
    concept: str
    examples: List[Dict[str, Any]]


LESSON_PLANS = {
    ("dyscalculia", "fractions", "5th_grade"): {
        "title": "Lesson Structure (Specifically Designed for Dyscalculic Students)",
        "lessonName": "Adding and Subtracting Fractions (For Dyscalculic Students)",
        "gradeLevel": "5th Grade",
        "concept": "Understanding Addition and Subtraction of Fractions with Like and Unlike Denominators",
        "examples": [
            {
                "number": 1,
                "section": "Introduction (15 minutes) – Using Familiar & Repetitive Concepts",
                "methods": [
                    {
                        "name": "Real-Life Context",
                        "steps": [
                            "Start with something familiar and tangible:",
                            "Bring in a real pizza, a chocolate bar, or a set of measuring cups.",
                            'Ask: "What happens when we share this among friends?"',
                            "Physically divide the pizza/bar into equal parts and let students touch & move pieces.",
                            'Explain: "Each part is called a fraction. This tells us how much each person gets."',
                        ],
                        "boardWriting": [
                            "A fraction is a part of a whole.",
                            "The top number (numerator) = how many pieces we have.",
                            "The bottom number (denominator) = how many pieces make the whole.",
                        ],
                    },
                    {
                        "name": "Visual and Verbal Reinforcement",
                        "steps": [
                            "Repeat the definition multiple times throughout the lesson."
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Working Memory Support: Since students with dyscalculia struggle to hold numbers in their minds, the use of real-life objects helps anchor concepts in long-term memory.",
                        "Task Initiation: Starting with something familiar (pizza, chocolate, or measuring cups) reduces the cognitive barrier and makes math less intimidating.",
                        "Sustained Attention: Repeating key definitions multiple times supports retention.",
                    ],
                },
            },
            {
                "number": 2,
                "section": "Multi-Sensory Exploration (20 minutes) – Building Concrete Understanding",
                "methods": [
                    {
                        "name": "Hands-on",
                        "steps": [
                            "Provide fraction strips, real objects, or LEGO bricks to represent fractions physically.",
                            "Give students a rectangle divided into 3 equal parts and ask them to color in 2 parts.",
                            'Ask: "How do we write this as a fraction?" (Answer: 2/3)',
                            "Repeat this for multiple examples, ensuring constant repetition.",
                        ],
                    },
                    {
                        "name": "Error-Free Learning",
                        "steps": [
                            "Instead of testing, let students explore without pressure.",
                            "Provide pre-drawn fraction circles or bars, and guide them through coloring in parts.",
                        ],
                        "guidance": [
                            '"We will do the first one together."',
                            '"Now let\'s do one with a partner."',
                            '"Finally, try one by yourself."',
                        ],
                    },
                    {
                        "name": "Physical Activity – Walk the Fractions",
                        "steps": [
                            "Tape a life-sized fraction number line on the floor.",
                            "Call out fractions, and have students stand on the correct place.",
                            'Example: "Stand on ½! Now move to ¾. What do you notice?"',
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Cognitive Flexibility: Using multiple representations (fraction bars, number lines, real-life objects) helps students switch between different ways of thinking about fractions.",
                        "Response Inhibition: Structured, step-by-step guidance prevents students from guessing and making repeated mistakes.",
                        'Self-Monitoring: The "Walk the Fractions" activity helps students physically place themselves in learning, which strengthens their ability to check their own work.',
                    ],
                },
            },
            {
                "number": 3,
                "section": "Adding Fractions with Like Denominators (15 minutes) – Step-by-Step Guidance",
                "methods": [
                    {
                        "name": "Hands-On Demonstration",
                        "steps": [
                            "Provide paper pizza slices or measuring cups and ask:",
                            '"If we have 1/4 of a pizza and get another 1/4, how much do we have?"',
                            "Stack two ¼ pieces together to show that they make 2/4 (or ½).",
                            "Let students physically stack fraction tiles to feel and see the addition process.",
                        ],
                    },
                    {
                        "name": "Break It Down with Color Coding",
                        "steps": [
                            "Write: 1/4 + 1/4 = ?",
                            "Numerators in red → show that we add the numbers on top.",
                            "Denominators in blue → show that they stay the same.",
                            "Have students highlight or circle these parts in different colors.",
                        ],
                    },
                    {
                        "name": "Guided Practice",
                        "steps": [
                            "Give students pre-drawn fraction circles.",
                            "Ask them to cut & combine parts to physically model addition.",
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Organization & Planning: Color-coding helps students visually separate fraction parts, reducing cognitive overload.",
                        "Metacognition: Physically stacking fraction tiles supports self-reflection, allowing students to correct misconceptions before moving to abstract calculations.",
                        "Task Persistence: Hands-on practice with pre-drawn circles provides a structured way to complete the task without overwhelming students.",
                    ],
                },
            },
            {
                "number": 4,
                "section": "Adding Fractions with Unlike Denominators (20 minutes) – Using Scaffolding & Errorless Learning",
                "methods": [
                    {
                        "name": "Matching Games with Fraction Strips to Introduce Common Denominators",
                        "steps": [
                            "Have fraction strips where students find equivalent fractions.",
                            '"Find a fraction strip that is the same size as ½ but divided into more pieces."',
                            "Students discover that ½ = 2/4 = 3/6 by matching strips.",
                        ],
                    },
                    {
                        "name": "Step-by-Step Conversion with Hands-On Manipulatives",
                        "example": "1/3 + 1/4 = ?",
                        "steps": [
                            "Provide fraction bars for 1/3 and 1/4.",
                            "Ask students to line them up and see where they meet (at 12).",
                            'Guide them: "We need both fractions to have 12 pieces to compare them."',
                            "Rewrite together: 1/3 = 4/12, 1/4 = 3/12",
                            "Now add: 4/12 + 3/12 = 7/12",
                        ],
                    },
                    {
                        "name": "Repetition & Hands-On Worksheets",
                        "steps": [
                            "Have students repeat this process with fraction strips before trying it with numbers.",
                            "Use a worksheet with matching fraction bars to help guide students",
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Task Persistence: Breaking the task into smaller, achievable steps keeps students engaged.",
                        "Flexibility: Allowing students to explore equivalent fractions through physical matching improves their ability to approach problems in different ways.",
                        "Impulse Control: The structured progression prevents students from guessing and making repeated mistakes.",
                    ],
                },
            },
            {
                "number": 5,
                "section": "Subtracting Fractions (15 minutes) – Keeping It Simple",
                "methods": [
                    {
                        "name": "Real-World Demonstrations with Water Cups & LEGO Bricks",
                        "steps": [
                            "Use cups of water or LEGO bricks.",
                            '"We have ¾ of a cup of juice. We drink ¼ of a cup. How much is left?"',
                            "Pour out the ¼ to see the answer visually (½ remains).",
                            "Repeat using real food items (e.g., breaking crackers into parts).",
                        ],
                    },
                    {
                        "name": "Pre-Filled Worksheets for Error-Free Learning",
                        "steps": [
                            "Instead of asking students to solve from scratch, give partially completed problems to fill in gaps.",
                            "Provide a problem where the denominators are already rewritten to match.",
                            "¾ - ¼ = ?",
                            'Guide them: "The denominator stays the same, now subtract the top numbers."',
                            "Have them highlight the denominator in blue and the numerator in red.",
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Goal-Directed Persistence: Using real-world objects makes math feel meaningful and achievable.",
                        "Self-Regulation: Providing pre-filled worksheets reduces frustration and keeps students motivated.",
                        "Sustained Attention: Simple, hands-on demonstrations ensure engagement without overwhelming students.",
                    ],
                },
            },
            {
                "number": 6,
                "section": "Real-Life Applications & Wrap-Up (10 minutes) – Connecting to Daily Life",
                "methods": [
                    {
                        "name": "Baking with Fractions Using Measuring Cups",
                        "steps": [
                            'Bring in measuring cups and have students "measure" ingredients.',
                            '"If we need ¾ cup of sugar and already have ¼ cup, how much more do we need?"',
                            "Students physically measure the amounts using real or pretend ingredients.",
                        ],
                    },
                    {
                        "name": "Exit Ticket Reflection (Drawing and Writing About Learning)",
                        "steps": [
                            "Ask each student to draw one thing they learned and write one question they still have.",
                            "Celebrate small wins!",
                            '"You did an amazing job today! Tomorrow, we\'ll practice with more fun activities."',
                        ],
                    },
                ],
                "executiveFunctionStrategy": {
                    "title": "Relevant Executive Function Strategy from Smart but Scattered",
                    "strategies": [
                        "Emotional Control: Relating fractions to cooking and real life reduces anxiety about math.",
                        "Metacognition: The exit ticket reflection reinforces learning, allowing students to track their own progress.",
                        "Confidence Building: Celebrating achievements boosts motivation and reduces math anxiety.",
                    ],
                },
            },
        ],
    }
}


@router.post(
    "", response_model=LessonPlanResponse, status_code=status.HTTP_200_OK
)
async def get_lesson_plan(request: LessonPlanRequest):
    """
    Generate a lesson plan based on the specified disorder, topic, grade level, and additional requirements.

    - **disorder**: Learning disorder or condition to address (as string)
    - **topic**: Mathematical topic for the lesson (as string)
    - **grade**: Grade level for the lesson (as string)
    - **additional_info**: Any additional needs or requirements
    - **prompt**: Main prompt describing what's needed

    Returns a structured lesson plan in JSON format.
    """
    try:
        # Normalize input strings (lowercase, replace spaces with underscores)
        disorder = request.disorder.lower().strip().replace(" ", "_")
        topic = request.topic.lower().strip().replace(" ", "_")
        grade = request.grade.lower().strip().replace(" ", "_")

        # Get the key for lookup
        key = (disorder, topic, grade)

        # Check if we have a pre-made lesson plan
        if key in LESSON_PLANS:
            return LESSON_PLANS[key]

        # If the exact match isn't found, try a fuzzy match (basic version)
        for k, plan in LESSON_PLANS.items():
            stored_disorder, stored_topic, stored_grade = k

            # Simple fuzzy matching logic - adjust as needed
            disorder_match = disorder in stored_disorder or stored_disorder in disorder
            topic_match = topic in stored_topic or stored_topic in topic
            grade_match = grade in stored_grade or stored_grade in grade

            if disorder_match and topic_match and grade_match:
                return plan

        # If still not found, return a 404 with helpful message
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": "No lesson plan found with the specified criteria.",
                "submitted": {
                    "disorder": request.disorder,
                    "topic": request.topic,
                    "grade": request.grade,
                },
                "suggestion": "Please check your inputs or provide more details in the prompt.",
            },
        )

    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes
        raise
    except Exception as e:
        # Catch any unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "An error occurred while processing your request.",
                "error": str(e),
            },
        )