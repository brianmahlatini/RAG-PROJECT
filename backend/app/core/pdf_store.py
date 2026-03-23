import os
from typing import List

import fitz  # PyMuPDF


def load_pdf_text(pdf_folder: str) -> str:
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
