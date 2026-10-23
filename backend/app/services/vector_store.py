# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: vector_store.py
# Purpose: Persistent local vector database for RAG retrieval.
import hashlib
import os
import pickle
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class SearchResult:
    chunk_id: str
    text: str
    score: float
    rank: int


class LocalVectorStore:
    def __init__(self, path: str) -> None:
        self.path = path
        self.chunks: List[str] = []
        self.chunk_ids: List[str] = []
        self.vectorizer = None
        self.matrix = None
        self.fingerprint = ""

    def build(self, chunks: List[str], fingerprint: str) -> None:
        import numpy as np  # type: ignore
        from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
        from sklearn.preprocessing import normalize  # type: ignore

        self.chunks = chunks
        self.chunk_ids = [
            self._chunk_id(chunk, idx) for idx, chunk in enumerate(chunks)
        ]
        self.fingerprint = fingerprint
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))

        if not chunks:
            self.matrix = np.zeros((0, 0), dtype=np.float32)
            return

        matrix = self.vectorizer.fit_transform(chunks).astype(np.float32)
        self.matrix = normalize(matrix, norm="l2", copy=False)

    def save(self) -> None:
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        payload = {
            "chunks": self.chunks,
            "chunk_ids": self.chunk_ids,
            "vectorizer": self.vectorizer,
            "matrix": self.matrix,
            "fingerprint": self.fingerprint,
        }
        with open(self.path, "wb") as handle:
            pickle.dump(payload, handle)

    def load(self, fingerprint: str) -> bool:
        if not os.path.isfile(self.path):
            return False
        try:
            with open(self.path, "rb") as handle:
                payload = pickle.load(handle)
        except Exception:
            return False

        if payload.get("fingerprint") != fingerprint:
            return False

        self.chunks = payload.get("chunks", [])
        self.chunk_ids = payload.get("chunk_ids", [])
        self.vectorizer = payload.get("vectorizer")
        self.matrix = payload.get("matrix")
        self.fingerprint = fingerprint
        return bool(self.vectorizer and self.matrix is not None)

    def search(self, query: str, top_k: int = 4) -> List[SearchResult]:
        if not query or not self.chunks or not self.vectorizer:
            return []
        if self.matrix is None:
            return []

        from sklearn.preprocessing import normalize  # type: ignore

        query_vec = self.vectorizer.transform([query]).astype("float32")
        query_vec = normalize(query_vec, norm="l2", copy=False)
        scores = (self.matrix * query_vec.T).toarray().ravel()
        top_indices = scores.argsort()[-top_k:][::-1]

        results: List[SearchResult] = []
        for rank, idx in enumerate(top_indices, start=1):
            score = float(scores[idx])
            if score <= 0:
                continue
            results.append(
                SearchResult(
                    chunk_id=self.chunk_ids[idx],
                    text=self.chunks[idx],
                    score=score,
                    rank=rank,
                )
            )
        return results

    @staticmethod
    def _chunk_id(chunk: str, index: int) -> str:
        digest = hashlib.sha256(chunk.encode("utf-8")).hexdigest()[:16]
        return f"chunk-{index + 1:05d}-{digest}"


def corpus_fingerprint(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_or_build_vector_store(
    text: str,
    chunks: List[str],
    vector_db_path: str,
    fingerprint: Optional[str] = None,
) -> LocalVectorStore:
    fingerprint = fingerprint or corpus_fingerprint(text)
    store = LocalVectorStore(vector_db_path)
    if store.load(fingerprint):
        return store
    store.build(chunks, fingerprint)
    store.save()
    return store
