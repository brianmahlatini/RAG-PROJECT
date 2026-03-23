# File: schemas.py
# Purpose: Pydantic request models.
# Overview:
# - Message payload for chat
# - Admin login payload
# File: schemas.py
# Purpose: Project module for Tesla ChatBot.

from pydantic import BaseModel


class MessageIn(BaseModel):
    message: str


class AdminLogin(BaseModel):
    password: str


class Pagination(BaseModel):
    page: int = 1
    page_size: int = 50




