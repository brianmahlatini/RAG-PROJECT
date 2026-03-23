from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

PROJECT_NAME = "Tesla ChatBot API"

PDF_FOLDER = "pdfs"

ADMIN_PASSWORD = "KGA!@6247#0"

SUPPORTED_LANGUAGES = {
    "english": "English",
    "german": "German",
}

DEFAULT_LANGUAGE = "english"

CORS_ALLOW_ORIGINS = ["*"]
