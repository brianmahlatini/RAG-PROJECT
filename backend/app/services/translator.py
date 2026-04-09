# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: translator.py
# Purpose: Translate English responses to German.
# Overview:
# - Uses OpenAI ChatCompletion for translation
# - Falls back to original text on error
import openai

from app.core.config import OPENAI_MODEL, SUPPORTED_LANGUAGES


def translate_text(text: str, target_language: str) -> str:
    # Only translate when needed
    if target_language.lower() == "english":
        return text
    target_lang = SUPPORTED_LANGUAGES[target_language.lower()]
    prompt = (
        f"Translate the following text to {target_lang} "
        "in a professional, clear, and native-sounding manner, "
        "preserving all details:\n\n"
        f"{text}"
    )

    try:
        response = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional translator.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"Translation error: {exc}")
        return text
