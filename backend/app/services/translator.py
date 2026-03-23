import openai

from app.core.config import SUPPORTED_LANGUAGES


def translate_text(text: str, target_language: str) -> str:
    if target_language.lower() == "english":
        return text

    prompt = (
        f"Translate the following text to {SUPPORTED_LANGUAGES[target_language.lower()]} "
        "in a professional, clear, and native-sounding manner, preserving all details:\n\n"
        f"{text}"
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional translator."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"Translation error: {exc}")
        return text
