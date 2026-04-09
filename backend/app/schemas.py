# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: schemas.py
# Purpose: Pydantic request models.
# Overview:
# - Message payload for chat
# - Admin login payload
from pydantic import BaseModel


class MessageIn(BaseModel):
    message: str


class AdminLogin(BaseModel):
    password: str


class Pagination(BaseModel):
    page: int = 1
    page_size: int = 50
