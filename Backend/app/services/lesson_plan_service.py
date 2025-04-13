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
llm_model = LLMs['gemini']  # Update this to your actual model on OpenRouter
print("LLM_KEY:", os.getenv("LLM_KEY"))  # This should show the key (or None)

# Executive Skill Map
executive_skill_map = {
    "dyscalculia": ["Enhancing Working Memory", "Cultivating Metacognition", "Fostering Organization", "Promoting, Planning, and Prioritizing"],
    "dyslexia": ["Task Initiation", "Sustained Attention", "Metacognition", "Organization"],
    "autism": ["Emotional Control", "Flexibility", "Goal-Directed Persistence", "Time Management"]
}


def get_context(client):
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

    print(f'lesson_collection{lesson_collection.peek()}')
    print(f'exec_collection{exec_collection.peek()}')

    return lesson_collection, exec_collection


# FUNCTION: Generate the augmented lesson plan
# Load ChromaDB collections

# file_path = os.path.abspath("")
# Modify the ChromaDB client initialization part


# Get or create collections

    
# FUNCTION: Generate the augmented lesson plan
def generate_adaptive_lesson_plan(grade, topic, subject, disorder):
    disorder_key = disorder.lower()
    exec_skills = executive_skill_map.get(disorder_key, [])
    client = PersistentClient(
    path="../chroma_store1"
)

    
    lesson_collection, exec_collection = get_context(client)
    # Get lesson chunks
    lesson_results = lesson_collection.query(
        query_texts=[f"{topic} in {subject} for grade {grade}"],  # semantic hint
        n_results=5,
        where={
            "$and": [
                {"grade": str(grade).strip()},
                {"subject": subject.strip()},
                {"topic": topic.strip()}
            ]
        },
        include=["documents", "metadatas"]
    )

    print(f'lesson  results--------------------------------------------------------------:\n{lesson_results}')
    
    
    lesson_context = "\n\n".join(lesson_results["documents"][0])
    print(f'lesson_context:{lesson_context}')

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

    print(f'exec_context--------------------------------------------------------------:\n{exec_context}')

    # Prompt template
    prompt = f"""
    You are a lesson planning assistant for special education teachers. Your task is to generate a complete math lesson plan that aligns with the lesson structure provided, while incorporating cognitive strategies from executive function skills helpful for students with {disorder.title()}.

    Use the academic lesson content provided in CONTEXT 1 and the executive functioning strategies provided in CONTEXT 2. Match the exact structure and tone of the uploaded lesson plans.

    CONTEXT 1 (Lesson Plan Content):
    {lesson_context}

    CONTEXT 2 (Executive Function Strategies for {disorder.title()}):
    {exec_context}
    {math_strategies}

    ---

    Please write the lesson using the following structure:

    1. Introduction (15 min)
    2. Multi-Sensory Exploration (20 min)
    3. Concept Practice (15–20 min)
    4. Patterns / Deeper Understanding (optional)
    5. Real-Life Applications (15 min)
    6. Wrap-Up & Reflection (10 min)

    Each section should include
    - Method
    - Activities
    - Executive Function Strategy
    """

    print("\n===== LLM INPUT PROMPT =====\n")
    print(prompt)

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