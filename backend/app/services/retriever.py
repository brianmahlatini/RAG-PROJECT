# File: retriever.py
# Purpose: Lightweight retrieval over Tesla docs.
# Overview:
# - Splits text into chunks
# - Uses TF-IDF (optional) for matching
# - Returns top relevant chunks
# File: retriever.py
# Purpose: Project module for Tesla ChatBot.

from typing import List, Tuple

# NOTE: Imports are intentionally lazy to avoid hard failures
# if optional deps (numpy / sklearn / faiss) are missing.
faiss = None
try:
    import faiss  # type: ignore
except Exception:
    faiss = None


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
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
        start = max(end - overlap, end)
    return chunks


def build_retriever(text: str) -> Tuple[List[str], object, object, object]:
    try:
        import numpy as np  # type: ignore
        from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
    except Exception:
        # Missing optional dependencies; return empty retriever
        return [], None, None, None
    chunks = chunk_text(text)
    vectorizer = TfidfVectorizer(stop_words="english")
    if not chunks:
        return [], vectorizer, np.zeros((0, 0)), None
    matrix = vectorizer.fit_transform(chunks).astype(np.float32)
    index = None
    if faiss is not None:
        dense = matrix.toarray()
        index = faiss.IndexFlatIP(dense.shape[1])
        faiss.normalize_L2(dense)
        index.add(dense)
    return chunks, vectorizer, matrix, index


def retrieve_chunks(
    query: str,
    chunks: List[str],
    vectorizer,
    matrix,
    index,
    top_k: int = 4,
) -> List[str]:
    if not query or not chunks:
        return []
    if not vectorizer or matrix is None:
        return []
    try:
        import numpy as np  # type: ignore
    except Exception:
        return []
    query_vec = vectorizer.transform([query]).astype(np.float32)
    if index is not None and faiss is not None:
        dense = query_vec.toarray()
        faiss.normalize_L2(dense)
        scores, indices = index.search(dense, top_k)
        return [chunks[i] for i in indices[0] if i != -1]
    scores = (matrix * query_vec.T).toarray().ravel()
    top_indices = scores.argsort()[-top_k:][::-1]
    return [chunks[i] for i in top_indices if scores[i] > 0]




