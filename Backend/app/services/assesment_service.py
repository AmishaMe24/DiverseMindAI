import os
import chromadb
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv
from chromadb import PersistentClient
load_dotenv()
import sys

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

LLMs = {
    'llama':'meta-llama/llama-4-maverick:free',
    'gemini':'google/gemini-2.0-flash-exp:free',
    'deepseek':'deepseek/deepseek-r1-zero:free'
}
# SETUP — your persistent DB + OpenRouter
openai.api_base = "https://openrouter.ai/api/v1"
openai.api_key = os.getenv('LLM_KEY')
llm_model = LLMs['llama']  # Update this to your actual model on OpenRouter


# Executive Skill Map
executive_skill_map = {
    "dyscalculia": ["Enhancing Working Memory", "Cultivating Metacognition", "Fostering Organization", "Promoting, Planning, and Prioritizing"],
    "dyslexia": ["Task Initiation", "Sustained Attention", "Metacognition", "Organization"],
    "autism": ["Emotional Control", "Flexibility", "Goal-Directed Persistence", "Time Management"]
}



# FUNCTION: Generate the augmented lesson plan
# Load ChromaDB collections

# file_path = os.path.abspath("")
# Modify the ChromaDB client initialization part
client = PersistentClient(
    path="./app/chroma_store"
)

# Get or create collections
try:
    lesson_collection = client.get_collection("lesson_plans")
except Exception as e:
    print(f"Error getting lesson_plans collection: {e}")
    # Create the collection
    lesson_collection = client.create_collection(
        name="lesson_plans",
        metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
    )

try:
    exec_collection = client.get_collection("exec_skills")
except Exception as e:
    print(f"Error getting exec_skills collection: {e}")
    # Create the collection
    exec_collection = client.create_collection(
        name="exec_skills",
        metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
    )
    
# FUNCTION: Generate the augmented lesson plan
def generate_assesment(grade, topic, subject, disorder):
    disorder_key = disorder.lower()
    exec_skills = executive_skill_map.get(disorder_key, [])
    # Get lesson chunks
    lesson_results = lesson_collection.query(
    query_texts=[f"Assesment for {topic} in {subject} for grade {grade}"],  # semantic hint
    n_results=5,
    where={
        "$and": [
            {"grade": str(grade).strip()},       # could be "6" or "Algebra I"
            {"subject": topic.strip()},
            {"section": {"$in": ["intro_context", "instructional_steps"]}}
        ]
    },
    include=["documents", "metadatas"]
)
    lesson_context = "\n\n".join(lesson_results["documents"][0])

    lesson_results_assessment = lesson_collection.query(
    query_texts=[f"assessment for {topic} in {subject} grade {grade}"],
    n_results=5,
    where={
        "$and": [
            {"grade": str(grade).strip()},       # could be "6" or "Algebra I"
            {"subject": topic.strip()},
            {"section": "assessment"}
        ]
    },
    include=["documents", "metadatas"]
)

    lesson_assessment = "\n\n".join(lesson_results_assessment["documents"][0]) if lesson_results_assessment["documents"] else "No assessment found."
    print(f'lesson assesment:------------------------------------------------------------------->\n{lesson_assessment}')
    

    # Get exec strategy chunks
    exec_contexts = []
    for skill in exec_skills:
        results = exec_collection.query(
            query_texts=[f"Strategies for {skill}"],
            n_results=2,
            where={"executive_skill": skill},
            include=["documents"]
        )
        exec_contexts.extend(results["documents"][0])
    exec_context = "\n\n".join(exec_contexts)

    #print(f'exec_context:{exec_context}')

    # Prompt template
    prompt = f"""
You are an expert educational support assistant helping special education teachers design inclusive math assessments for neurodiverse learners.

Your task is to improve or redesign the assessment tasks provided in CONTEXT 2 so they:
- Align closely with the instructional content in CONTEXT 1.
- Apply evidence-based executive functioning strategies from CONTEXT 3, specifically for students with {disorder.title()}.
- Are accessible, scaffolded, and support cognitive challenges such as working memory, attention, planning, and self-monitoring.
- Use a variety of assessment types (e.g., visual aids, scaffolded steps, short responses).
- After each assessment question, include a short explanation of how the design supports executive functioning needs.

CONTEXT 1 (Lesson Plan):
{lesson_context}

CONTEXT 2 (Original Assessment Questions):
{lesson_assessment}

CONTEXT 3 (Executive Function Strategies for {disorder.title()}):
{exec_context}
"""

    # LLM call to OpenRouter
    response = openai.ChatCompletion.create(
        model=llm_model,
        messages=[
            {"role": "system", "content": "You are a supportive and creative educational assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    llm_output = response.choices[0].message.content

    print("\n===== LLM OUTPUT =====\n")
    print(llm_output)
    return response.choices[0].message.content