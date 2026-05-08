from sentence_transformers import CrossEncoder
from app.config import RERANK_MODEL

reranker = CrossEncoder(RERANK_MODEL)

def rerank(query, docs):

    pairs = [(query, doc) for doc in docs]

    scores = reranker.predict(pairs)

    return scores