"""
Connect Plus AI Service — MESH
Multi-provider AI with automatic fallback:
  1. Gemini (google-genai)
  2. OpenAI / ChatGPT
  3. Grok / xAI  (OpenAI-compatible API)
"""
import os
from dotenv import load_dotenv
load_dotenv()

import itertools
import logging
from typing import List, Optional
from fastapi.concurrency import run_in_threadpool

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger("mesh_ai")

# ── SDK imports (graceful) ────────────────────────────────────────────────────
try:
    from google import genai as _ggenai
    from google.genai.errors import ClientError as GeminiClientError
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

try:
    from openai import OpenAI as _OpenAI, APIError as _OAIError # type: ignore
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

router = APIRouter()

# ── Provider Config ───────────────────────────────────────────────────────────
_GEMINI_KEYS: List[str] = []
for i in range(1, 21):
    k = os.getenv(f"GEMINI_API_KEY_{i}", "")
    if k:
        _GEMINI_KEYS.append(k)
_single = os.getenv("GEMINI_API_KEY", "")
if _single and _single not in _GEMINI_KEYS:
    _GEMINI_KEYS.append(_single)

_OPENAI_KEY  = os.getenv("OPENAI_API_KEY", "")
_GROK_KEY    = os.getenv("GROK_API_KEY", "")

_GEMINI_CYCLE = itertools.cycle(_GEMINI_KEYS) if _GEMINI_KEYS else None

# Ordered list of Gemini models to try (newest → fallback)
GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
]
OPENAI_MODEL = "gpt-4o-mini"
GROK_MODEL   = "grok-3-mini"
GROK_BASE    = "https://api.x.ai/v1"


# ── Core generation with provider fallback ────────────────────────────────────
def _generate(prompt: str) -> tuple[str, str]:
    """
    Returns (text, provider_name).
    Tries Gemini (multiple models) → OpenAI → Grok in order.
    Raises HTTPException if all fail.
    """
    errors = []

    # 1. Gemini — try each model in order with the API key
    if HAS_GEMINI and _GEMINI_KEYS:
        key = next(_GEMINI_CYCLE)  # type: ignore
        client = _ggenai.Client(api_key=key)
        for model_name in GEMINI_MODELS:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                return resp.text or "", f"Gemini ({model_name})"
            except Exception as e:
                err_str = str(e)
                # 503 = model overloaded, try next model
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    errors.append(f"{model_name}: overloaded")
                    continue
                # 404 = model not available for this key, try next
                elif "404" in err_str or "NOT_FOUND" in err_str:
                    errors.append(f"{model_name}: not available")
                    continue
                else:
                    errors.append(f"Gemini: {err_str[:100]}")
                    break

    # 2. OpenAI
    if HAS_OPENAI and _OPENAI_KEY:
        try:
            oai = _OpenAI(api_key=_OPENAI_KEY)
            resp = oai.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content or "", "OpenAI"
        except _OAIError as e:
            errors.append(f"OpenAI: {str(e)[:80]}")
        except Exception as e:
            errors.append(f"OpenAI: {str(e)[:80]}")

    # 3. Grok (xAI — OpenAI-compatible)
    if HAS_OPENAI and _GROK_KEY:
        try:
            grok = _OpenAI(api_key=_GROK_KEY, base_url=GROK_BASE)
            resp = grok.chat.completions.create(
                model=GROK_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
            )
            return resp.choices[0].message.content or "", "Grok"
        except Exception as e:
            errors.append(f"Grok: {str(e)[:80]}")

    logger.error("All AI providers failed: %s", errors)
    raise HTTPException(
        status_code=503,
        detail=f"All AI providers unavailable. Errors: {'; '.join(errors)}"
    )


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class AskRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[str] = None

class AskResponse(BaseModel):
    answer: str
    provider: str

class SearchRequest(BaseModel):
    query: str
    resource_titles: List[str]

class SearchResponse(BaseModel):
    ranked_titles: List[str]
    explanation: str
    provider: str

class SummarizeRequest(BaseModel):
    title: str
    description: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str
    suggested_tags: List[str]
    suggested_category: str
    provider: str

class IntentRequest(BaseModel):
    requirement: str

class IntentResponse(BaseModel):
    course: str
    unit: str
    topics: List[str]
    purpose: str
    duration: str
    difficulty: str
    resource_types: List[str]
    provider: str


# ── Endpoints ─────────────────────────────────────────────────────────────────
_SYSTEM = (
    "You are MESH, the AI assistant for Connect Plus — an institutional faculty resource platform. "
    "You help Staff and HOD faculty find, understand, and use teaching materials. "
    "Be professional, concise, and academic. Never expose system internals or credentials."
)


@router.post("/ask", response_model=AskResponse)
async def ask_ai(req: AskRequest):
    context_block = f"\n\nResources available:\n{req.context}" if req.context else ""
    history_block = ""
    for m in (req.history or []):
        prefix = "User" if m.role == "user" else "MESH"
        history_block += f"{prefix}: {m.content}\n"

    prompt = f"{_SYSTEM}{context_block}\n\n{history_block}User: {req.question}\nMESH:"
    text, provider = await run_in_threadpool(_generate, prompt)
    return AskResponse(answer=text.strip(), provider=provider)


@router.post("/search", response_model=SearchResponse)
async def semantic_search(req: SearchRequest):
    if not req.resource_titles:
        return SearchResponse(ranked_titles=[], explanation="No resources to search.", provider="none")

    titles_block = "\n".join(f"- {t}" for t in req.resource_titles)
    prompt = f"""You are a semantic search engine for academic resources.

Search query: "{req.query}"

Available resources:
{titles_block}

Return only relevant titles from the list above, ranked best to worst.
If none match, return empty.

Respond in EXACTLY this format:
RANKED:
- Title 1
- Title 2
EXPLANATION: <one line reason for top result>"""

    text, provider = await run_in_threadpool(_generate, prompt)
    ranked, explanation, in_ranked = [], "", False
    for line in text.strip().split("\n"):
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

    return SearchResponse(ranked_titles=ranked, explanation=explanation, provider=provider)


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_resource(req: SummarizeRequest):
    prompt = f"""You are an academic resource classifier for a faculty platform.

Title: {req.title}
Description: {req.description or 'Not provided'}

Generate the following:
1. A 2-sentence academic summary for faculty colleagues.
2. 3-5 relevant tags (comma separated, lowercase, no #).
3. One category from: Lecture Notes, Lab Manual, Question Bank, Reference, Syllabus, Assignment, Research Paper, Other

Respond in EXACTLY this format:
SUMMARY: <summary>
TAGS: <tag1>, <tag2>, <tag3>
CATEGORY: <category>"""

    text, provider = await run_in_threadpool(_generate, prompt)
    summary, tags, category = "", [], "Other"
    for line in text.strip().split("\n"):
        line = line.strip()
        if line.startswith("SUMMARY:"):
            summary = line.replace("SUMMARY:", "").strip()
        elif line.startswith("TAGS:"):
            tags = [t.strip() for t in line.replace("TAGS:", "").split(",") if t.strip()]
        elif line.startswith("CATEGORY:"):
            category = line.replace("CATEGORY:", "").strip()

    return SummarizeResponse(
        summary=summary or f"Resource covering {req.title}.",
        suggested_tags=tags,
        suggested_category=category,
        provider=provider,
    )

@router.post("/intent", response_model=IntentResponse)
async def extract_intent(req: IntentRequest):
    prompt = f"""You are an academic curriculum mapping assistant.
Analyze the following natural-language teaching requirement:
"{req.requirement}"

Extract the following information:
1. Course Name (guess if not explicit)
2. Unit Name/Number (guess if not explicit)
3. Topics (comma separated)
4. Purpose (e.g. Lecture, Practical, Assignment, Review)
5. Duration (e.g. 2 hours)
6. Difficulty (Beginner, Intermediate, Advanced)
7. Preferred resource types (comma separated: Lecture Notes, Presentation, Concept Notes, Practical/Lab, Question Bank)

Respond in EXACTLY this format:
COURSE: <course>
UNIT: <unit>
TOPICS: <topics>
PURPOSE: <purpose>
DURATION: <duration>
DIFFICULTY: <difficulty>
RESOURCE_TYPES: <resource_types>"""

    text, provider = await run_in_threadpool(_generate, prompt)
    
    course, unit, purpose, duration, difficulty = "", "", "", "", ""
    topics, resource_types = [], []
    
    for line in text.strip().split("\n"):
        line = line.strip()
        if line.startswith("COURSE:"): course = line.replace("COURSE:", "").strip()
        elif line.startswith("UNIT:"): unit = line.replace("UNIT:", "").strip()
        elif line.startswith("TOPICS:"): topics = [t.strip() for t in line.replace("TOPICS:", "").split(",") if t.strip()]
        elif line.startswith("PURPOSE:"): purpose = line.replace("PURPOSE:", "").strip()
        elif line.startswith("DURATION:"): duration = line.replace("DURATION:", "").strip()
        elif line.startswith("DIFFICULTY:"): difficulty = line.replace("DIFFICULTY:", "").strip()
        elif line.startswith("RESOURCE_TYPES:"): resource_types = [t.strip() for t in line.replace("RESOURCE_TYPES:", "").split(",") if t.strip()]

    return IntentResponse(
        course=course,
        unit=unit,
        topics=topics,
        purpose=purpose,
        duration=duration,
        difficulty=difficulty,
        resource_types=resource_types,
        provider=provider
    )


@router.get("/health")
def ai_health():
    providers = []
    if HAS_GEMINI and _GEMINI_KEYS:
        providers.append(f"Gemini ({len(_GEMINI_KEYS)} key(s))")
    if HAS_OPENAI and _OPENAI_KEY:
        providers.append("OpenAI/ChatGPT")
    if _GROK_KEY:
        providers.append("Grok/xAI")
    return {
        "status": "ok" if providers else "no_providers",
        "providers_ready": providers,
        "fallback_order": ["Gemini", "OpenAI", "Grok"],
        "model_gemini": GEMINI_MODELS[0],
        "model_openai": OPENAI_MODEL,
        "model_grok": GROK_MODEL,
    }
