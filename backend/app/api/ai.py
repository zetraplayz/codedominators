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

GEMINI_MODEL = "gemini-1.5-flash"
OPENAI_MODEL = "gpt-4o-mini"
GROK_MODEL   = "grok-3-mini"
GROK_BASE    = "https://api.x.ai/v1"


# ── Core generation with provider fallback ────────────────────────────────────
def _generate(prompt: str) -> tuple[str, str]:
    """
    Returns (text, provider_name).
    Tries Gemini → OpenAI → Grok in order.
    Raises HTTPException if all fail.
    """
    errors = []

    # 1. Gemini
    if HAS_GEMINI and _GEMINI_KEYS:
        for _ in range(len(_GEMINI_KEYS)):
            try:
                key = next(_GEMINI_CYCLE)  # type: ignore
                client = _ggenai.Client(api_key=key)
                resp = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                )
                return resp.text or "", "Gemini"
            except GeminiClientError as e:
                code = getattr(e, "status_code", 0)
                if code == 429:
                    errors.append(f"Gemini 429 (key rotated)")
                    continue
                errors.append(f"Gemini {code}: {str(e)[:80]}")
                break
            except Exception as e:
                errors.append(f"Gemini: {str(e)[:80]}")
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
    text, provider = _generate(prompt)
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

    text, provider = _generate(prompt)
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

    text, provider = _generate(prompt)
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
        "model_gemini": GEMINI_MODEL,
        "model_openai": OPENAI_MODEL,
        "model_grok": GROK_MODEL,
    }
