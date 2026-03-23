# File: config.py
# Purpose: Centralized environment configuration for Tesla ChatBot.
# Overview:
# - Loads environment variables
# - Defines app settings (model, languages, rate limits)
# - Exposes constants for other modules
# File: config.py
# Purpose: Project module for Tesla ChatBot.

from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

PROJECT_NAME = "Tesla ChatBot API"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

PDF_FOLDER = "pdfs"

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "KGA!@6247#0")
VIEWER_PASSWORD = os.getenv("VIEWER_PASSWORD", "")
ADMIN_TOKEN_TTL_MINUTES = int(os.getenv("ADMIN_TOKEN_TTL_MINUTES", "120"))

SUPPORTED_LANGUAGES = {
    "english": "English",
    "german": "German",
}

DEFAULT_LANGUAGE = "english"

CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))

RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "30"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))




