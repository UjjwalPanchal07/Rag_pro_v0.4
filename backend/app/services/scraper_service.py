import re
import requests
import numpy as np
from bs4 import BeautifulSoup

from app.models.embedding_model import get_embedding, get_embeddings
from app.models.reranker_model import rerank

PAGE_TIMEOUT_SEC = 12
CHUNK_SIZE   = 5    # sentences per chunk
TOP_K        = 10   # candidates passed to reranker
TOP_CONTEXT  = 1    # ← FIXED: only the single best chunk sent to LLM
THRESHOLD    = 0.10 # minimum reranker score to return an answer

# Simple URL → (chunks, vecs) cache so batch queries on the same URL
# only fetch and embed once per process lifetime.
_page_cache: dict = {}


def _fetch_text(url: str) -> str:
    r = requests.get(
        url,
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=PAGE_TIMEOUT_SEC,
    )
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "noscript", "iframe", "form"]):
        tag.decompose()
    body = soup.find("body") or soup
    return body.get_text(separator=" ", strip=True)


_MAX_WORDS_PER_SENTENCE = 40
_SUB_SPLIT_WORDS        = 30


def _chunk(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text)

    sentences: list[str] = []
    for part in parts:
        part = part.strip()
        if not part or len(part) < 20:
            continue
        words = part.split()
        if len(words) <= _MAX_WORDS_PER_SENTENCE:
            sentences.append(part)
        else:
            for i in range(0, len(words), _SUB_SPLIT_WORDS):
                sub = " ".join(words[i : i + _SUB_SPLIT_WORDS])
                if len(sub) >= 20:
                    sentences.append(sub)

    return [
        " ".join(sentences[i : i + CHUNK_SIZE])
        for i in range(0, len(sentences), CHUNK_SIZE)
    ]


def _load_page(url: str) -> tuple[list[str], np.ndarray]:
    if url in _page_cache:
        return _page_cache[url]
    text   = _fetch_text(url)
    chunks = _chunk(text)
    if not chunks:
        return [], np.empty((0,))
    vecs = get_embeddings(chunks).astype("float32")
    _page_cache[url] = (chunks, vecs)
    return chunks, vecs


def search_from_url(url: str, query: str) -> str:
    try:
        chunks, vecs = _load_page(url)
    except Exception as e:
        return f"Could not fetch the URL: {e}"

    if not chunks:
        return "No usable content found at the provided URL."

    query_vec = np.array([get_embedding(query)]).astype("float32")
    sims      = (vecs @ query_vec.T).flatten()

    top_k       = min(TOP_K, len(chunks))
    top_indices = np.argsort(sims)[::-1][:top_k]
    candidates  = [chunks[i] for i in top_indices]

    scores   = rerank(query, candidates)
    best_idx = int(np.argmax(scores))

    if scores[best_idx] < THRESHOLD:
        return "No Answer Found at the provided URL."

    # Return only the single best chunk — prevents Claude from
    # producing an overly long answer covering multiple sections.
    ranked_pairs = sorted(zip(scores, candidates), reverse=True)
    top_chunks   = [text for _, text in ranked_pairs[:TOP_CONTEXT]]
    return "\n\n".join(top_chunks)
