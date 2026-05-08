import numpy as np
from app.models.embedding_model import get_embedding, get_embeddings
from app.models.reranker_model import rerank
from app.db import questions_collection
from app.config import TOP_K, THRESHOLD


def _get_candidates(rfp_level_tag: str, module: str) -> list[dict]:
    """
    Fetch all Q&A docs from MongoDB for the given tag + module.
    Returns list of {"question": ..., "answer": ...}
    """
    cursor = questions_collection.find(
        {"rfp_level_tag": rfp_level_tag, "module": module},
        {"_id": 0, "question": 1, "answer": 1}
    )
    return list(cursor)


def search_answer_by_module(rfp_level_tag: str, module: str, query: str) -> str | None:
    """
    Search all Q&A pairs stored under rfp_level_tag + module.
    Uses embedding similarity to find top-K candidates, then reranks.
    Returns the best answer, or None if nothing passes the threshold.
    """
    candidates = _get_candidates(rfp_level_tag, module)

    if not candidates:
        return None

    query_vec = get_embedding(query)

    # Embed all candidate questions and find top-K by cosine similarity
    questions_text = [c["question"] for c in candidates]
    doc_embeddings = get_embeddings(questions_text).astype("float32")

    # Cosine similarity
    q_norm   = query_vec / (np.linalg.norm(query_vec) + 1e-9)
    d_norms  = doc_embeddings / (np.linalg.norm(doc_embeddings, axis=1, keepdims=True) + 1e-9)
    sims     = d_norms @ q_norm

    top_k_idx = np.argsort(sims)[::-1][:TOP_K]
    top_candidates = [candidates[i] for i in top_k_idx]

    # Rerank top-K
    scores    = rerank(query, [c["question"] for c in top_candidates])
    best_idx  = int(np.argmax(scores))
    best_score = scores[best_idx]

    if best_score < THRESHOLD:
        return None

    return top_candidates[best_idx]["answer"]


# ── Legacy single-RFP search (kept for backward compat with /ask endpoint) ──
def search_answer(rfp_id: str, query: str) -> str | None:
    """
    rfp_id format: "rfp_level_tag/module/rfp_folder_name"
    Searches only questions from that specific rfp_folder_name.
    """
    parts = rfp_id.split("/")
    if len(parts) < 3:
        return None

    rfp_level_tag   = parts[0]
    module          = parts[1]
    rfp_folder_name = "/".join(parts[2:])

    candidates = list(questions_collection.find(
        {
            "rfp_level_tag":   rfp_level_tag,
            "module":          module,
            "rfp_folder_name": rfp_folder_name,
        },
        {"_id": 0, "question": 1, "answer": 1}
    ))

    if not candidates:
        return None

    query_vec      = get_embedding(query)
    questions_text = [c["question"] for c in candidates]
    doc_embeddings = get_embeddings(questions_text).astype("float32")

    q_norm  = query_vec / (np.linalg.norm(query_vec) + 1e-9)
    d_norms = doc_embeddings / (np.linalg.norm(doc_embeddings, axis=1, keepdims=True) + 1e-9)
    sims    = d_norms @ q_norm

    top_k_idx      = np.argsort(sims)[::-1][:TOP_K]
    top_candidates = [candidates[i] for i in top_k_idx]

    scores     = rerank(query, [c["question"] for c in top_candidates])
    best_idx   = int(np.argmax(scores))
    best_score = scores[best_idx]

    if best_score < THRESHOLD:
        return None

    return top_candidates[best_idx]["answer"]
