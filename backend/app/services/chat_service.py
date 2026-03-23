from datetime import datetime
from typing import Tuple

import openai

from app.core.config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from app.services.translator import translate_text


GREETING_TRIGGERS = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
]


def normalize_language(language: str) -> str:
    selected = (language or DEFAULT_LANGUAGE).lower()
    if selected not in SUPPORTED_LANGUAGES:
        return DEFAULT_LANGUAGE
    return selected


def generate_reply(prompt: str, pdf_text: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Tesla ChatBot, Tesla's official assistant. "
                    "Answer all questions clearly, confidently, and professionally as if you are speaking on behalf of Tesla. "
                    "Use the Tesla document text provided below to answer questions about Tesla products, services, policies, and support. "
                    "If a question is not covered in the documents, answer from general Tesla knowledge and be transparent if you are unsure. "
                    "Do not mention visiting websites or calling support; provide direct, clear answers."
                ),
            },
            {"role": "system", "content": pdf_text or ""},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    return response["choices"][0]["message"]["content"].strip()


def build_greeting() -> str:
    return (
        "Hello! Welcome to Tesla ChatBot. "
        "How can I help you today with Tesla vehicles, energy products, service, or support?"
    )


def handle_chat(
    prompt: str,
    language: str,
    pdf_text: str,
) -> Tuple[str, str]:
    selected_language = normalize_language(language)
    lower_prompt = prompt.lower()

    if any(trigger in lower_prompt for trigger in GREETING_TRIGGERS):
        base_reply = build_greeting()
        reply = (
            translate_text(base_reply, selected_language)
            if selected_language != "english"
            else base_reply
        )
        return reply, selected_language

    english_reply = generate_reply(prompt, pdf_text)
    if selected_language != "english":
        reply = translate_text(english_reply, selected_language)
    else:
        reply = english_reply

    return reply, selected_language


def log_message(
    cursor,
    conn,
    *,
    ip: str,
    role: str,
    content: str,
    language: str,
    timestamp: datetime,
) -> None:
    cursor.execute(
        "INSERT INTO messages (ip, role, content, timestamp, language) VALUES (?, ?, ?, ?, ?)",
        (ip, role, content, timestamp.isoformat(), language),
    )
    conn.commit()
