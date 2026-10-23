# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: retriever.py
# Purpose: Lightweight retrieval over Tesla docs.
# Overview:
# - Splits text into chunks
# - Stores normalized TF-IDF vectors in a local vector database
# - Uses cosine similarity for matching
# - Returns top relevant chunks
from typing import List, Tuple

from app.services.vector_store import (
    SearchResult,
    corpus_fingerprint,
    load_or_build_vector_store,
)


def chunk_text(
    text: str, chunk_size: int = 1200, overlap: int = 200
) -> List[str]:
    if not text:
        return []
    cleaned = " ".join(text.split())
    chunks = []
    start = 0
    while start < len(cleaned):
        end = min(start + chunk_size, len(cleaned))
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(cleaned):
            break
        start = max(end - overlap, start + 1)
    return chunks


def build_retriever(
    text: str, vector_db_path: str = "vector_db/rag_vectors.pkl"
) -> Tuple[List[str], object, object, object]:
    try:
        import numpy as np  # type: ignore # noqa: F401
    except Exception:
        # Missing optional dependencies; return empty retriever
        return [], None, None, None
    chunks = chunk_text(text)
    if not chunks:
        return [], None, None, None
    fingerprint = corpus_fingerprint(text)
    vector_store = load_or_build_vector_store(
        text, chunks, vector_db_path, fingerprint
    )
    return chunks, vector_store.vectorizer, vector_store.matrix, vector_store


def retrieve_results(
    query: str,
    chunks: List[str],
    vectorizer,
    matrix,
    vector_store,
    top_k: int = 4,
) -> List[SearchResult]:
    if not query or not chunks:
        return []
    if vector_store is not None and hasattr(vector_store, "search"):
        return vector_store.search(query, top_k=top_k)

    if not vectorizer or matrix is None:
        return []

    from sklearn.preprocessing import normalize  # type: ignore

    query_vec = vectorizer.transform([query]).astype("float32")
    query_vec = normalize(query_vec, norm="l2", copy=False)
    scores = (matrix * query_vec.T).toarray().ravel()
    top_indices = scores.argsort()[-top_k:][::-1]

    results: List[SearchResult] = []
    for rank, idx in enumerate(top_indices, start=1):
        score = float(scores[idx])
        if score <= 0:
            continue
        results.append(
            SearchResult(
                chunk_id=f"chunk-{idx + 1:05d}",
                text=chunks[idx],
                score=score,
                rank=rank,
            )
        )
    return results


def retrieve_chunks(
    query: str,
    chunks: List[str],
    vectorizer,
    matrix,
    vector_store,
    top_k: int = 4,
) -> List[str]:
    return [
        result.text
        for result in retrieve_results(
            query, chunks, vectorizer, matrix, vector_store, top_k
        )
    ]
