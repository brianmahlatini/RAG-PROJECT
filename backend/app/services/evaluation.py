# File: evaluation.py
# Purpose: Retrieval and generation evaluation metrics for RAG quality.
import math
import re
from typing import Dict, Iterable, List, Optional, Sequence

from app.services.vector_store import SearchResult

_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")


def _tokens(text: str) -> List[str]:
    return [token.lower() for token in _TOKEN_RE.findall(text or "")]


def _unique_tokens(text: str) -> set[str]:
    return set(_tokens(text))


def retrieval_metrics(
    retrieved_ids: Sequence[str],
    relevant_ids: Sequence[str],
    k: int = 5,
) -> Dict[str, float]:
    if k <= 0:
        raise ValueError("k must be greater than zero")

    top_ids = list(retrieved_ids[:k])
    relevant = set(relevant_ids)
    hits = [1 if chunk_id in relevant else 0 for chunk_id in top_ids]
    hit_count = sum(hits)

    precision = hit_count / k
    recall = hit_count / len(relevant) if relevant else 0.0
    reciprocal_rank = 0.0
    for idx, hit in enumerate(hits, start=1):
        if hit:
            reciprocal_rank = 1.0 / idx
            break

    dcg = sum(hit / math.log2(idx + 1) for idx, hit in enumerate(hits, start=1))
    ideal_hits = [1] * min(len(relevant), k)
    idcg = sum(
        hit / math.log2(idx + 1) for idx, hit in enumerate(ideal_hits, start=1)
    )
    ndcg = dcg / idcg if idcg else 0.0

    return {
        f"precision@{k}": round(precision, 4),
        f"recall@{k}": round(recall, 4),
        "mrr": round(reciprocal_rank, 4),
        f"ndcg@{k}": round(ndcg, 4),
    }


def generation_evaluation(
    answer: str,
    contexts: Iterable[str],
    expected_answer: Optional[str] = None,
) -> Dict[str, float | str]:
    context_text = " ".join(contexts)
    answer_terms = _unique_tokens(answer)
    context_terms = _unique_tokens(context_text)

    if not answer_terms:
        faithfulness = 0.0
    else:
        supported_terms = answer_terms.intersection(context_terms)
        faithfulness = len(supported_terms) / len(answer_terms)

    context_coverage = 0.0
    if context_terms:
        context_coverage = len(answer_terms.intersection(context_terms)) / len(
            context_terms
        )

    correctness = None
    if expected_answer is not None:
        correctness = _token_f1(answer, expected_answer)

    hallucination_risk = 1.0 - faithfulness
    label = "low"
    if hallucination_risk >= 0.6:
        label = "high"
    elif hallucination_risk >= 0.35:
        label = "medium"

    result: Dict[str, float | str] = {
        "faithfulness": round(faithfulness, 4),
        "hallucination_risk": round(hallucination_risk, 4),
        "hallucination_risk_label": label,
        "context_coverage": round(context_coverage, 4),
    }
    if correctness is not None:
        result["correctness"] = round(correctness, 4)
    return result


def evaluate_rag_response(
    answer: str,
    retrieved_results: Sequence[SearchResult],
    relevant_ids: Optional[Sequence[str]] = None,
    expected_answer: Optional[str] = None,
    k: int = 5,
) -> Dict[str, object]:
    retrieved_ids = [result.chunk_id for result in retrieved_results]
    contexts = [result.text for result in retrieved_results]
    payload: Dict[str, object] = {
        "generation": generation_evaluation(answer, contexts, expected_answer),
        "retrieved_chunks": [
            {
                "chunk_id": result.chunk_id,
                "score": round(result.score, 4),
                "rank": result.rank,
            }
            for result in retrieved_results[:k]
        ],
    }
    if relevant_ids is not None:
        payload["retrieval"] = retrieval_metrics(retrieved_ids, relevant_ids, k)
    return payload


def _token_f1(answer: str, expected_answer: str) -> float:
    answer_tokens = _tokens(answer)
    expected_tokens = _tokens(expected_answer)
    if not answer_tokens or not expected_tokens:
        return 0.0

    answer_counts = _counts(answer_tokens)
    expected_counts = _counts(expected_tokens)
    overlap = 0
    for token, count in answer_counts.items():
        overlap += min(count, expected_counts.get(token, 0))

    if overlap == 0:
        return 0.0
    precision = overlap / len(answer_tokens)
    recall = overlap / len(expected_tokens)
    return 2 * precision * recall / (precision + recall)


def _counts(tokens: Sequence[str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    return counts
