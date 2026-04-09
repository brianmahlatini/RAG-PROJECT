# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: main.py
# Purpose: Uvicorn entrypoint for backend.
# Overview:
# - Imports app from app.main
from app.main import app

__all__ = ["app"]
