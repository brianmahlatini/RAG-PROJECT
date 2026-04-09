# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: pdf_store.py
# Purpose: Load and extract text from Tesla PDF documents.
# Overview:
# - Reads PDF files from backend/pdfs
# - Extracts text per page
# - Returns combined corpus
import os
from typing import List

import fitz  # PyMuPDF


def load_pdf_text(pdf_folder: str) -> str:
    # Return empty if folder is missing to keep service running
    if not os.path.isdir(pdf_folder):
        return ""

    chunks: List[str] = []
    for filename in os.listdir(pdf_folder):
        if not filename.lower().endswith(".pdf"):
            continue
        path = os.path.join(pdf_folder, filename)
        try:
            with fitz.open(path) as doc:
                for page in doc:
                    chunks.append(page.get_text())
        except Exception:
            # Skip unreadable PDF but keep the service running
            continue

    return "\n".join(chunks)
