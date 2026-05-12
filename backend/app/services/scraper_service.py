import io
import re
import requests
import numpy as np
from bs4 import BeautifulSoup
from urllib.parse import urlparse

from app.models.embedding_model import get_embedding, get_embeddings
from app.models.reranker_model   import rerank

PAGE_TIMEOUT_SEC        = 20
CHUNK_SIZE              = 5
TOP_K                   = 10
TOP_CONTEXT             = 1
THRESHOLD               = 0.10
_MAX_WORDS_PER_SENTENCE = 40
_SUB_SPLIT_WORDS        = 30

_page_cache: dict = {}


# ── Content-type detection ─────────────────────────────────────────────────

def _detect_type(url: str, content_type: str) -> str:
    """
    Returns one of: 'html', 'pdf', 'docx', 'excel', 'unknown'
    Checks both URL extension and HTTP Content-Type header.
    """
    url_lower = url.lower().split("?")[0]   # strip query params for extension check

    if url_lower.endswith(".pdf")  or "pdf"  in content_type: return "pdf"
    if url_lower.endswith(".docx") or "wordprocessingml" in content_type: return "docx"
    if url_lower.endswith(".doc")  or "msword" in content_type: return "docx"
    if url_lower.endswith(".xlsx") or "spreadsheetml" in content_type: return "excel"
    if url_lower.endswith(".xls")  or "ms-excel" in content_type: return "excel"
    if "html" in content_type or "text" in content_type: return "html"
    return "html"   # default — attempt HTML parse


# ── Extractors ─────────────────────────────────────────────────────────────

def _extract_html(raw: bytes) -> str:
    soup = BeautifulSoup(raw, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "noscript", "iframe", "form"]):
        tag.decompose()
    body = soup.find("body") or soup
    return body.get_text(separator=" ", strip=True)


def _extract_pdf(raw: bytes) -> str:
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        return " ".join(text_parts)
    except ImportError:
        # Fallback to pypdf if pdfplumber not installed
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(raw))
            return " ".join(
                page.extract_text() or "" for page in reader.pages
            )
        except ImportError:
            return "PDF extraction unavailable — install pdfplumber: pip install pdfplumber"
    except Exception as e:
        return f"PDF extraction error: {e}"


def _extract_docx(raw: bytes) -> str:
    try:
        from docx import Document
        doc   = Document(io.BytesIO(raw))
        lines = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also extract table cells
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        lines.append(cell.text.strip())
        return " ".join(lines)
    except ImportError:
        return "DOCX extraction unavailable — install python-docx: pip install python-docx"
    except Exception as e:
        return f"DOCX extraction error: {e}"


def _extract_excel(raw: bytes) -> str:
    try:
        import openpyxl
        wb    = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        lines = []
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                row_text = " | ".join(str(c) for c in row if c is not None and str(c).strip())
                if row_text:
                    lines.append(row_text)
        return " ".join(lines)
    except Exception as e:
        return f"Excel extraction error: {e}"


# ── Fetch ──────────────────────────────────────────────────────────────────

def _fetch_text(url: str) -> str:
    """
    Download the URL and extract plain text.
    Supports: HTML pages, PDF, DOCX, Excel (.xlsx/.xls)
    Works with SharePoint shared links that serve files directly.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        # SharePoint / OneDrive shared links need these
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    r = requests.get(url, headers=headers, timeout=PAGE_TIMEOUT_SEC, allow_redirects=True)
    r.raise_for_status()

    content_type = r.headers.get("Content-Type", "").lower()
    doc_type     = _detect_type(url, content_type)

    if doc_type == "pdf":
        return _extract_pdf(r.content)
    if doc_type == "docx":
        return _extract_docx(r.content)
    if doc_type == "excel":
        return _extract_excel(r.content)

    # Default: HTML
    return _extract_html(r.content)


# ── Chunking ───────────────────────────────────────────────────────────────

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


# ── Main search function ───────────────────────────────────────────────────

def search_from_url(url: str, query: str) -> str:
    try:
        chunks, vecs = _load_page(url)
    except requests.exceptions.ConnectionError:
        return "Could not fetch the URL — connection failed. Check the URL and try again."
    except requests.exceptions.Timeout:
        return "Could not fetch the URL — request timed out. The page may be too slow or requires authentication."
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code if e.response else "unknown"
        if status == 403:
            return "Access denied (403) — this URL requires authentication or is not publicly accessible."
        if status == 404:
            return "Page not found (404) — please check the URL is correct."
        return f"Could not fetch the URL: HTTP {status}"
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

    ranked_pairs = sorted(zip(scores, candidates), reverse=True)
    top_chunks   = [text for _, text in ranked_pairs[:TOP_CONTEXT]]
    return "\n\n".join(top_chunks)
