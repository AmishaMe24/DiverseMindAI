import os
import chromadb
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv
from chromadb import PersistentClient
load_dotenv()
import sys

embedder = SentenceTransformer("all-MiniLM-L6-v2")

LLMs = {
    'llama':'meta-llama/llama-4-maverick:free',
    'gemini':'google/gemini-2.0-flash-exp:free',
    'deepseek':'deepseek/deepseek-r1-zero:free'
}
# SETUP — your persistent DB + OpenRouter
openai.api_base = "https://openrouter.ai/api/v1"
openai.api_key = os.getenv('LLM_KEY')
llm_model = LLMs['gemini']
print("LLM_KEY:", os.getenv("LLM_KEY"))

# Executive Skill Map
executive_skill_map = {
    "dyscalculia": ["Enhancing Working Memory", "Cultivating Metacognition", "Fostering Organization", "Promoting, Planning, and Prioritizing"],
    "dyslexia": ["Task Initiation", "Sustained Attention", "Metacognition", "Organization"],
    "autism": ["Emotional Control", "Flexibility", "Goal-Directed Persistence", "Time Management"]
}


def get_context(client):
    try:
        icebreaker_collection = client.get_collection("icebreakers")
    except Exception as e:
        print(f"Error getting icebreakers collection: {e}")
        # Create the collection
        icebreaker_collection = client.create_collection(
            name="icebreakers",
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

    print(f'icebreaker_collection{icebreaker_collection.peek()}')
    print(f'exec_collection{exec_collection.peek()}')

    return icebreaker_collection, exec_collection

def retrieve_context_from_chroma_with_metadata(query, collection, embedder, k=4, materials_filter=None):
    query_embedding = embedder.encode([query]).tolist()[0]

    chroma_filter = None
    if materials_filter:
        chroma_filter = {"materials_needed": {"$eq": materials_filter}}

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where=chroma_filter
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    return docs, metadatas

def build_prompt(exec_context,icebreaker_context, query, disorder):
    return f"""You are an assistant for special education teachers. Your task is to generate a icebreaker excercise that aligns with the structure provided, while incorporating cognitive strategies from executive function skills helpful for students with {disorder}.

        Use the ice-breaker content provided in CONTEXT 1 and the executive functioning strategies provided in CONTEXT 2.
        
        CONTEXT 1 - 
        {icebreaker_context}

        CONTEXT 2 (Executive Function Strategies for {disorder}):
        {exec_context}

        User Query: {query}

        answer the user's query **by returning the complete activity in this format**:

        Title:
        Objective:
        Materials Needed:
        Instructions:
        Debrief / Discussion Points:
        Additional Details:
        """

def query_llama(prompt,client):
    response = client.chat.completions.create(
        model="meta-llama/llama-3-8b-instruct",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

def ask_question_rag(question, collection, embedder, materials_filter=None, k=4,client=None):
    docs, metas = retrieve_context_from_chroma_with_metadata(
        query=question,
        collection=collection,
        embedder=embedder,
        k=k,
        materials_filter=materials_filter
    )
    context = "\n---\n".join(docs)
    # prompt = build_prompt(context, question)
    # answer = query_llama(prompt,client)
    return context

def generate_icebreaker(question,materials, disorder):
    disorder_key = disorder.lower()
    exec_skills = executive_skill_map.get(disorder_key, [])
    client = PersistentClient(
        path="../chroma_store1"
    )
    lesson_collection, exec_collection = get_context(client)

    client = PersistentClient(path="native_chroma_icebreakers")
    icebreaker_collection = get_context(client)
    icebreaker_context = ask_question_rag(
        question=question,
        collection=icebreaker_collection,
        embedder=embedder,
        materials_filter=materials,
        k=4,
        client=client
    )


    # print(f'lesson_context:{lesson_context}')

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

    prompt = build_prompt(exec_context,icebreaker_context,disorder.title())

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