import os
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from dotenv import load_dotenv
from chromadb import PersistentClient
load_dotenv()
import sys
from . import prompts

openai = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

client = PersistentClient(
    path="./app/chroma_store"
)

# Get or create collections
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
def generate_assesment(grade, subject, topic, subtopic, exec_skills):
    client = PersistentClient(
    path="./app/chroma_store"
)
    lesson_collection, exec_collection = get_context(client, subject)
    # Get lesson chunks
    if subject == "Maths":
        lesson_results = lesson_collection.query(
        query_texts=[f"Assesment in {subject} for {subtopic} for grade {grade}"],  # semantic hint
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
        query_texts=[f"assessment for {subtopic} in {subject} for grade {grade}"],
        n_results=5,
        where={
            "$and": [
                {"grade": str(grade).strip()},       # could be "6" or "Algebra I"
                {"subject": subtopic.strip()},
                {"section": "assessment"}
            ]
        },
        include=["documents", "metadatas"]
    )

        lesson_assessment = "\n\n".join(lesson_results_assessment["documents"][0]) if lesson_results_assessment["documents"] else "No assessment found."
        print(f'lesson assesment:------------------------------------------------------------------->\n{lesson_assessment}')
    elif subject == "Science":
        lesson_results = lesson_collection.query(
        query_texts=[f"Assesment in {subject} for {topic} for {grade}"],  # semantic hint
        n_results=5,
        where={
            "$and": [
                {"grade": str(grade).strip()},       
                {"lesson_title": topic.strip()},
                {"section": {"$in": ["engage", "explain", "explore", "elaborate"]}}
            ]
        },
        include=["documents", "metadatas"]
    )
        lesson_context = "\n\n".join(lesson_results["documents"][0])

        lesson_results_assessment = lesson_collection.query(
        query_texts=[f"assessment for {topic} in {subject} for {grade}"],
        n_results=5,
        where={
            "$and": [
                {"grade": str(grade).strip()},       # could be "6" or "Algebra I"
                {"lesson_title": topic.strip()},
                {"section": "evaluate"}
            ]
        },
        include=["documents", "metadatas"]
    )
        lesson_assessment = "\n\n".join(lesson_results_assessment["documents"][0]) if lesson_results_assessment["documents"] else "No assessment found."

    
    print(f'lesson context:------------------------------------------------------------------->\n{lesson_context}')
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
    prompt = prompts.get_prompt_quiz(subject, lesson_context, lesson_assessment, exec_context, exec_skills)

    # LLM call to OpenRouter
    response = openai.chat.completions.create(
        model="gpt-4o",   # <- GPT-4o model name
        messages=[
            {"role": "system", "content": "You are a supportive and creative educational assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    llm_output = response.choices[0].message.content

    # print("\n===== LLM OUTPUT =====\n")
    # print(llm_output)
    return response.choices[0].message.content