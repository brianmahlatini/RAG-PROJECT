# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: schemas.py
# Purpose: Pydantic request models.
# Overview:
# - Message payload for chat
# - Admin login payload
from pydantic import BaseModel, Field


class MessageIn(BaseModel):
    message: str


class AdminLogin(BaseModel):
    password: str


class Pagination(BaseModel):
    page: int = 1
    page_size: int = 50


class RAGEvaluationRequest(BaseModel):
    question: str
    answer: str = ""
    expected_answer: str = ""
    relevant_chunk_ids: list[str] = Field(default_factory=list)
    k: int = 5
