import os
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from dotenv import load_dotenv
from chromadb import PersistentClient
load_dotenv()
import sys

embedder = SentenceTransformer("all-MiniLM-L6-v2")

openai = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)



# def get_context(client):
#     try:
#         icebreaker_collection = client.get_collection("icebreakers")
#     except Exception as e:
#         print(f"Error getting icebreakers collection: {e}")
#         icebreaker_collection = client.create_collection(
#             name="icebreakers",
#             metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
#         )

#     try:
#         exec_collection = client.get_collection("exec_skills")
#     except Exception as e:
#         print(f"Error getting exec_skills collection: {e}")
#         exec_collection = client.create_collection(
#             name="exec_skills",
#             metadata={"hnsw:space": "cosine"}  # Choose appropriate embedding space
#         )

#     print(f'icebreaker_collection{icebreaker_collection.peek()}')
#     print(f'exec_collection{exec_collection.peek()}')

#     return icebreaker_collection, exec_collection

def retrieve_context_from_chroma_with_metadata(query, collection, embedder, k=4, materials_filter=None):
    query_embedding = embedder.encode([query + materials_filter]).tolist()[0]

    chroma_filter = None
    # if materials_filter:
    #     chroma_filter = {"materials_needed": {"$eq": materials_filter}}

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where=chroma_filter
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    return docs, metadatas

def build_prompt(exec_context, icebreaker_context, query, exec_skills):
    return f"""You are an assistant for special education teachers. Generate an icebreaker exercise incorporating the following cognitive strategies {exec_skills}.

Use the icebreaker content provided in CONTEXT 1 and the executive functioning strategies in CONTEXT 2.

CONTEXT 1 - 
{icebreaker_context}

CONTEXT 2 (Executive Function Strategies: {exec_skills}):
{exec_context}

User Query: {query}

⚡ VERY IMPORTANT: Return your output in this strict Markdown format:

**Title:** [title here]

**Objective:** [objective here]

**Materials Needed:** [materials needed here]

**Instructions:** 
* Step 1
* Step 2

**Debrief / Discussion Points:** 
* Point 1
* Point 2

**Tips for Success:** 
* Tip 1
* Tip 2

**Variations:** 
* Variation 1
* Variation 2

If a section has no content, still include the section heading and write "None."
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

def generate_icebreaker(question,materials, exec_skills):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CHROMA_PATH = os.path.join(os.path.dirname(BASE_DIR), "chroma_store")

    exec_skills = exec_skills

    client = PersistentClient(path=CHROMA_PATH)

    exec_collection = client.get_collection("exec_skills")

    CHROMA_PATH = os.path.join(BASE_DIR, "icebreakers")

    client = PersistentClient(path=CHROMA_PATH)
    icebreaker_collection = client.get_collection("icebreakers")

    # print(icebreaker_collection.peek())

    icebreaker_context = ask_question_rag(
        question=question,
        collection=icebreaker_collection,
        embedder=embedder,
        materials_filter=materials,
        k=4,
        client=client
    )


    print(f'icebreaker Context:{icebreaker_context}')

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

    prompt = build_prompt(exec_context,icebreaker_context, question,exec_skills)
    response = openai.chat.completions.create(
        model='gpt-4o',
        messages=[
            {"role": "system", "content": "You are a supportive and creative educational assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    llm_output = response.choices[0].message.content

    print("\n===== LLM OUTPUT =====\n")
    print(llm_output)
    return response.choices[0].message.content