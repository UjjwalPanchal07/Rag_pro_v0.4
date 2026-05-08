from sentence_transformers import SentenceTransformer
from app.config import EMBEDDING_MODEL

# Load embedding model once at startup
model = SentenceTransformer(EMBEDDING_MODEL)

# BGE models require this prefix on queries (not on documents) for best retrieval accuracy
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


def get_embedding(text: str):
    """
    Generate embedding for a single search query.
    Applies BGE query prefix for better retrieval accuracy.
    """
    prefixed = BGE_QUERY_PREFIX + text
    embedding = model.encode([prefixed], convert_to_numpy=True)
    return embedding[0]


def get_embeddings(texts: list):
    """
    Generate embeddings for multiple document texts during ingestion.
    No prefix needed for documents — only queries get the prefix.
    """
    return model.encode(
        texts,
        batch_size=64,
        convert_to_numpy=True,
        show_progress_bar=False,
    )
