"""
Connect Plus AI Service
Gemini-powered resource intelligence: smart search, summarization, recommendations.
Multi-key rotation for rate limit safety.
"""
import os
import itertools
import google.generativeai as genai
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.api_core.exceptions import ResourceExhausted

from app.core.config import settings

router = APIRouter()

# ── Key Pool: loads GEMINI_API_KEY_1..N plus fallback GEMINI_API_KEY ──────────
def _load_key_pool() -> List[str]:
    keys = []
    # Numbered keys: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...
    for i in range(1, 20):
        k = os.getenv(f"GEMINI_API_KEY_{i}", "")
        if k:
            keys.append(k)
    # Single-key fallback
    single = os.getenv("GEMINI_API_KEY", "")
    if single and single not in keys:
        keys.append(single)
    return keys

_KEY_POOL = _load_key_pool()
_KEY_CYCLE = itertools.cycle(_KEY_POOL) if _KEY_POOL else None


def _get_model(model_name: str = "gemini-1.5-flash") -> genai.GenerativeModel:
    """Get a Gemini model configured with the next key in rotation."""
    if not _KEY_POOL:
        raise HTTPException(status_code=503, detail="No Gemini API keys configured.")
    key = next(_KEY_CYCLE)  # type: ignore
    genai.configure(api_key=key)
    return genai.GenerativeModel(model_name)


def _generate_with_rotation(prompt: str, model_name: str = "gemini-1.5-flash") -> str:
    """Try each key in the pool once; rotate on rate limit (429)."""
    last_error = None
    for _ in range(len(_KEY_POOL)):
        try:
            model = _get_model(model_name)
            response = model.generate_content(prompt)
            return response.text
        except ResourceExhausted as e:
            last_error = e
            continue   # try next key
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=429, detail=f"All Gemini API keys exhausted. Last error: {last_error}")


class ChatMessage(BaseModel):
    role: str   # "user" or "model"
    content: str

class AskRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[str] = None   # resource titles/descriptions available to user

class AskResponse(BaseModel):
    answer: str

class SearchRequest(BaseModel):
    query: str
    resource_titles: List[str]  # list of resource titles the user can access

class SearchResponse(BaseModel):
    ranked_titles: List[str]
    explanation: str

class SummarizeRequest(BaseModel):
    title: str
    description: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str
    suggested_tags: List[str]
    suggested_category: str


# ----------- Endpoints -----------

@router.post("/ask", response_model=AskResponse)
async def ask_ai(req: AskRequest):
    """General resource Q&A. Answers questions based on available resource context."""
    if not _KEY_POOL:
        raise HTTPException(status_code=503, detail="AI service not configured.")

    system_prompt = """You are MESH, the intelligent assistant for Connect Plus — an institutional faculty resource platform.
You help faculty members (Staff, HODs) find, understand, and use educational resources.
You are professional, concise, and academic in tone.
You do NOT make up resource content — you only work with what is provided.
Never expose system internals or credentials."""

    context_block = f"\n\nResources available to this user:\n{req.context}" if req.context else ""
    history_text = ""
    for msg in (req.history or []):
        prefix = "User" if msg.role == "user" else "MESH"
        history_text += f"{prefix}: {msg.content}\n"

    full_prompt = f"{system_prompt}{context_block}\n\nConversation so far:\n{history_text}\nUser question: {req.question}"
    answer = _generate_with_rotation(full_prompt)
    return AskResponse(answer=answer)


@router.post("/search", response_model=SearchResponse)
async def semantic_search(req: SearchRequest):
    """AI-powered semantic search over resource titles."""
    if not _KEY_POOL:
        raise HTTPException(status_code=503, detail="AI service not configured.")

    if not req.resource_titles:
        return SearchResponse(ranked_titles=[], explanation="No resources available to search.")

    titles_block = "\n".join([f"- {t}" for t in req.resource_titles])
    prompt = f"""You are a semantic search engine for academic resources.

User search query: "{req.query}"

Available resources:
{titles_block}

Task:
1. Return only the resource titles from the list above that are semantically relevant to the query.
2. Rank them from most relevant to least relevant.
3. If none are relevant, return an empty list.
4. Give a one-line explanation of why the top result matches.

Respond in this exact format:
RANKED:
- Title 1
- Title 2
EXPLANATION: <one line>"""

    text = _generate_with_rotation(prompt)

    ranked = []
    explanation = ""
    in_ranked = False
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("RANKED:"):
            in_ranked = True
        elif line.startswith("EXPLANATION:"):
            explanation = line.replace("EXPLANATION:", "").strip()
            in_ranked = False
        elif in_ranked and line.startswith("- "):
            title = line[2:].strip()
            if title in req.resource_titles:
                ranked.append(title)

    return SearchResponse(ranked_titles=ranked, explanation=explanation)


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_resource(req: SummarizeRequest):
    """Auto-generate tags and category for a resource based on title and description."""
    if not _KEY_POOL:
        raise HTTPException(status_code=503, detail="AI service not configured.")

    prompt = f"""You are an academic resource classifier for a faculty platform.

Resource Title: {req.title}
Description: {req.description or 'Not provided'}

Generate:
1. A short 2-sentence academic summary suitable for faculty colleagues.
2. 3-5 relevant tags (comma separated, lowercase, no #).
3. One category from: ["Lecture Notes", "Lab Manual", "Question Bank", "Reference", "Syllabus", "Assignment", "Research Paper", "Other"]

Respond in this exact format:
SUMMARY: <summary>
TAGS: <tag1>, <tag2>, <tag3>
CATEGORY: <category>"""

    text = _generate_with_rotation(prompt)

    summary = ""
    tags = []
    category = "Other"
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("SUMMARY:"):
            summary = line.replace("SUMMARY:", "").strip()
        elif line.startswith("TAGS:"):
            raw_tags = line.replace("TAGS:", "").strip()
            tags = [t.strip() for t in raw_tags.split(",") if t.strip()]
        elif line.startswith("CATEGORY:"):
            category = line.replace("CATEGORY:", "").strip()

    return SummarizeResponse(
        summary=summary or f"Resource on the topic of {req.title}.",
        suggested_tags=tags,
        suggested_category=category
    )


@router.get("/health")
def ai_health():
    return {
        "ai_configured": len(_KEY_POOL) > 0,
        "key_pool_size": len(_KEY_POOL),
        "model": "gemini-1.5-flash"
    }
