from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from urllib.parse import urlparse

from app.services.scraper_service       import search_from_url
from app.services.summarisation_service import summarise, translate_only, SUPPORTED_LANGUAGES
from app.core.auth import get_current_user

router = APIRouter(prefix="/web", tags=["web-search"])


# ── Validation ─────────────────────────────────────────────────────────────

def _validate_url(url: str) -> str:
    url = url.strip()
    if not url:
        raise ValueError("URL cannot be empty")
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("URL must start with http:// or https://")
        if not parsed.netloc:
            raise ValueError("Invalid URL — missing domain")
    except ValueError:
        raise
    except Exception:
        raise ValueError("Invalid URL format")
    return url


# ── Schemas ────────────────────────────────────────────────────────────────

class WebSearchRequest(BaseModel):
    url:             str
    question:        str
    target_language: str = "en"

    @field_validator("url")
    @classmethod
    def val_url(cls, v):
        return _validate_url(v)

    @field_validator("question")
    @classmethod
    def val_question(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty")
        if len(v) > 1000:
            raise ValueError("Question is too long (max 1000 characters)")
        return v

    @field_validator("target_language")
    @classmethod
    def val_lang(cls, v):
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language. Supported: {list(SUPPORTED_LANGUAGES.keys())}")
        return v


class TranslateRequest(BaseModel):
    text:            str
    target_language: str

    @field_validator("target_language")
    @classmethod
    def val_lang(cls, v):
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language code: {v}")
        return v


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/ask_web")
def ask_web(body: WebSearchRequest, current_user: dict = Depends(get_current_user)):
    """
    Accepts any publicly accessible URL including:
    - Web pages (HTML)
    - PDF files
    - DOCX files
    - Excel files (.xlsx / .xls)
    - SharePoint shared links (publicly accessible)

    Flow:
        1. Detect content type (HTML / PDF / DOCX / Excel)
        2. Extract text using the appropriate extractor
        3. Chunk → embed → rerank → top context
        4. Claude Haiku → summarise + optionally translate
    """
    context = search_from_url(body.url, body.question)

    no_answer_phrases = [
        "No Answer Found",
        "Could not fetch",
        "No usable content",
        "Access denied",
        "Page not found",
        "extraction unavailable",
        "extraction error",
    ]
    if any(phrase in context for phrase in no_answer_phrases):
        return {
            "answer":          context,
            "language":        body.target_language,
            "language_name":   SUPPORTED_LANGUAGES.get(body.target_language, "English"),
            "context_preview": "",
        }

    answer = summarise(context, body.question, body.target_language)

    return {
        "answer":          answer,
        "language":        body.target_language,
        "language_name":   SUPPORTED_LANGUAGES.get(body.target_language, "English"),
        "context_preview": context[:300] + "..." if len(context) > 300 else context,
    }


@router.post("/translate")
def translate(body: TranslateRequest, current_user: dict = Depends(get_current_user)):
    if not body.text.strip():
        raise HTTPException(status_code=422, detail="Text to translate cannot be empty")

    translated = translate_only(body.text, body.target_language)

    return {
        "translated_text": translated,
        "language":        body.target_language,
        "language_name":   SUPPORTED_LANGUAGES.get(body.target_language, "English"),
    }


@router.get("/languages")
def get_languages(_: dict = Depends(get_current_user)):
    return {
        "languages": [
            {"code": code, "name": name}
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }
