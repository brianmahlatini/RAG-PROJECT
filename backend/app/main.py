# File: main.py
# Purpose: FastAPI app factory and startup hooks.
# Overview:
# - CORS + middleware
# - Startup: DB init + PDF load
# - Routers mounted
# File: main.py
# Purpose: Project module for Tesla ChatBot.

import openai
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ALLOW_ORIGINS, OPENAI_API_KEY, PDF_FOLDER, PROJECT_NAME
from app.core.database import init_db
from app.core.logging_config import configure_logging
from app.core.pdf_store import load_pdf_text
from app.core.rate_limit import RateLimitMiddleware
from app.routes import admin, chat
from app.services.retriever import build_retriever

openai.api_key = OPENAI_API_KEY  # OpenAI key used by chat + translation services

app = FastAPI(title=PROJECT_NAME)
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    # Configure logging + initialize resources
    configure_logging()
    # Initialize SQLite tables and cache PDF text once at startup
    init_db()
    app.state.pdf_text = load_pdf_text(PDF_FOLDER)
    chunks, vectorizer, matrix, index = build_retriever(app.state.pdf_text)
    app.state.retriever = {
        "chunks": chunks,
        "vectorizer": vectorizer,
        "matrix": matrix,
        "index": index,
    }


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    # Prevent unhandled exceptions from leaking stack traces to clients
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(chat.router)
app.include_router(admin.router)




