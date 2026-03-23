import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ALLOW_ORIGINS, OPENAI_API_KEY, PDF_FOLDER, PROJECT_NAME
from app.core.database import init_db
from app.core.pdf_store import load_pdf_text
from app.routes import admin, chat

openai.api_key = OPENAI_API_KEY

app = FastAPI(title=PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    app.state.pdf_text = load_pdf_text(PDF_FOLDER)


app.include_router(chat.router)
app.include_router(admin.router)
