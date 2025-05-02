import os
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from dotenv import load_dotenv
from chromadb import PersistentClient
import sys
from .prompts import get_prompt
from . import prompts

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




load_dotenv()


openai = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY")[:5])  # For debug, remove in production


def get_context(client, subject):
    map_subject = {
        'Maths': 'lesson_plans',
        'Science': 'science_lessons',
    }
    try:
        lesson_collection = client.get_collection(map_subject[subject])
    except Exception as e:
        print(f"Error getting lesson_plans collection: {e}")
        # Create the collection
        lesson_collection = client.create_collection(
            name=map_subject[subject],
            metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
        )
    # print(f'\n lesson collection--------------------------------------------------------------:\n:{lesson_collection.peek()}')
    
    # for doc in lesson_collection.get()['metadatas']:
    #     print(doc.get('grade'), doc.get('topic'))

    try:
        exec_collection = client.get_collection("exec_skills")
    except Exception as e:
        print(f"Error getting exec_skills collection: {e}")
        # Create the collection
        exec_collection = client.create_collection(
            name="exec_skills",
            metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
        )
    # print(f'\n exec_collection--------------------------------------------------------------:\n:{exec_collection.peek()}')

    return lesson_collection, exec_collection



    
# FUNCTION: Generate the augmented lesson plan
def generate_adaptive_lesson_plan(subject, grade, topic, subtopic, exec_skills):
    exec_skills = exec_skills
    print(exec_skills)
    client = PersistentClient(path="./app/chroma_store")

    lesson_collection, exec_collection = get_context(client, subject)
    # Get lesson chunks
    if subject == 'Maths':
        lesson_results = lesson_collection.query(
            query_texts=[f"Lesson for {subject} on {topic} under {subtopic} for grade {grade}"],  # semantic hint
            n_results=5,
            where={
                "$and": [
                    {"grade": str(grade).strip()},       # could be "6" or "Algebra I"
                    {"subject": subtopic.strip()}
                ]
            },
            include=["documents", "metadatas"]
        )

        lesson_context = "\n\n".join(lesson_results["documents"][0])
    elif subject == 'Science':
        lesson_results = lesson_collection.query(
            query_texts=[f"Lesson for {subject} on {topic} for grade {grade}"],  # semantic hint
            n_results=5,
            where={
                "$and": [
                    {"grade": grade.strip()},    
                    {"lesson_title": topic.strip()}
                ]
            },
            include=["documents", "metadatas"]
        )

        lesson_context = "\n\n".join(lesson_results["documents"][0])
    print(f'\nlesson_context--------------------------------------------------------------:\n:{lesson_context}')

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
    prompt = get_prompt(subject, lesson_context, exec_context, exec_skills)

    # print("\n===== LLM INPUT PROMPT =====\n")
    print(prompt)
    print(len(prompt))

    # LLM call to OpenRouter
    response = openai.chat.completions.create(
        model="gpt-4o",   # <- GPT-4o model name
        messages=[
            {"role": "system", "content": "You are a creative, structured, and neurodiversity-aware educational assistant who specializes in writing adaptive STEM lesson plans based on provided lessons, strategies and contexts"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    print("LLM raw response:", response)
    llm_output = response.choices[0].message.content

    # print("\n===== LLM OUTPUT =====\n")
    print(len(llm_output))
    return response.choices[0].message.content