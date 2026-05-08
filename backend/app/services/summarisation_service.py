"""
Summarisation & Translation Service
=====================================
Uses Claude Haiku API to:
1. Summarise raw scraped context into a clean, concise answer
2. Optionally translate the answer to a target language

Requires in backend/.env:
    ANTHROPIC_API_KEY=sk-ant-api03-...
"""

import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    print("[summarisation] ⚠️  ANTHROPIC_API_KEY not set in .env — web search summarisation will fail.")

MODEL      = "claude-haiku-4-5-20251001"
MAX_TOKENS = 300   # ← FIXED: limits output to ~220 words maximum

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "ar": "Arabic",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)",
    "pt": "Portuguese",
    "it": "Italian",
    "ko": "Korean",
    "ru": "Russian",
}


def summarise(context: str, question: str, target_language: str = "en") -> str:
    """
    Summarise the scraped context into a short, direct answer using Claude Haiku.
    Optionally translate to target_language in the same call.
    """
    if not ANTHROPIC_API_KEY:
        return "Summarisation unavailable — ANTHROPIC_API_KEY not configured."

    if not context or not context.strip():
        return "No usable content found to summarise."

    lang_name = SUPPORTED_LANGUAGES.get(target_language, "English")

    translation_instruction = (
        f"\nRespond entirely in {lang_name}."
        if target_language != "en"
        else ""
    )

    # ── Prompt with strict length constraint ──────────────────────────────
    prompt = f"""You are a concise RFP assistant specialising in Oracle banking products.

Answer the question using ONLY the context provided.

Rules:
- Answer in 3 to 5 sentences maximum. Be direct and to the point.
- Do not repeat the question or add any preamble like "Based on the context...".
- Include all key technical terms and product names exactly as written.
- If the answer is not in the context, respond with exactly: "Not found in the provided documentation."{translation_instruction}

Context:
{context}

Question:
{question}

Answer:"""

    try:
        client  = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        message = client.messages.create(
            model      = MODEL,
            max_tokens = MAX_TOKENS,
            messages   = [{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()

    except anthropic.AuthenticationError:
        return "Authentication failed — check your ANTHROPIC_API_KEY in .env."
    except anthropic.RateLimitError:
        return "Rate limit reached — please try again in a moment."
    except anthropic.APIConnectionError:
        return "Could not connect to Claude API — check your internet connection."
    except Exception as e:
        return f"Summarisation error: {str(e)}"


def translate_only(text: str, target_language: str) -> str:
    """
    Translate an existing answer to the target language.
    Called when user clicks a language button after receiving an answer.
    """
    if not ANTHROPIC_API_KEY:
        return "Translation unavailable — ANTHROPIC_API_KEY not configured."

    if target_language == "en":
        return text

    lang_name = SUPPORTED_LANGUAGES.get(target_language, target_language)

    prompt = f"""Translate the following text to {lang_name}.
Preserve all technical terms, product names, and structure exactly.
Return only the translated text — no explanations or preamble.

Text:
{text}"""

    try:
        client  = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        message = client.messages.create(
            model      = MODEL,
            max_tokens = MAX_TOKENS,
            messages   = [{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()

    except Exception as e:
        return f"Translation error: {str(e)}"
