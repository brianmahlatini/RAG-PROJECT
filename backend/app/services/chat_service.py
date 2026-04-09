# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: chat_service.py
# Purpose: Core chat logic.
# Overview:
# - Builds system prompt
# - Calls OpenAI for response
# - Applies greeting rules and translation
# - Stores messages in DB
from datetime import datetime
from typing import Tuple

import openai

from app.core.config import DEFAULT_LANGUAGE, OPENAI_MODEL, SUPPORTED_LANGUAGES
from app.services.translator import translate_text


def normalize_language(language: str) -> str:
    # Normalize and validate language input
    selected = (language or DEFAULT_LANGUAGE).lower()
    if selected not in SUPPORTED_LANGUAGES:
        return DEFAULT_LANGUAGE
    return selected


def generate_reply(
    prompt: str, pdf_text: str, retrieved_chunks: list[str]
) -> str:
    # Primary LLM call: combine system prompt + PDF corpus + user prompt
    # Only include retrieved chunks to keep prompts small and focused
    context = "\n\n".join(retrieved_chunks) if retrieved_chunks else ""
    response = openai.ChatCompletion.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Tesla ChatBot, Tesla's official assistant. "
                    "Answer all questions clearly, confidently, and "
                    "professionally as if you are speaking on behalf of "
                    "Tesla. Use the Tesla document text provided below "
                    "to answer questions about Tesla products, services, "
                    "policies, and support. If a question is not covered "
                    "in the documents, answer from general Tesla knowledge "
                    "and be transparent if you are unsure. Do not mention "
                    "visiting websites or calling support; provide direct, "
                    "clear answers. Respond in plain text only. Do not use "
                    "markdown, asterisks, or bold formatting. Do not greet "
                    "or welcome the user; answer the question immediately."
                ),
            },
            {"role": "system", "content": context or ""},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    reply = response["choices"][0]["message"]["content"].strip()

    sentences = [
        s.strip()
        for s in reply.replace("!", ".").split(".")
        if s.strip()
    ]

    if not sentences:
        return reply

    if len(sentences) > 5:
        truncated = " ".join(sentences[:5]) + "."
        return truncated

    return reply


def apply_greeting(prompt: str, reply: str) -> str:
    keywords_greeting = ["hello", "hi", "hey", "greetings", "good morning"]
    if any(kw in prompt.lower() for kw in keywords_greeting):
        greeting = "Hello! I'm Tesla ChatBot. "
        if reply.lower().startswith(greeting.lower()):
            return reply
        return greeting + reply
    return reply


def handle_chat(
    prompt: str, language: str, pdf_text: str, retrieved_chunks: list[str]
) -> Tuple[str, str]:
    # Route a chat request: greeting shortcut + LLM response +
    # optional translation
    reply = generate_reply(prompt, pdf_text, retrieved_chunks)
    reply = apply_greeting(prompt, reply)
    selected_language = normalize_language(language)

    if selected_language != "english":
        reply = translate_text(reply, selected_language)

    return reply, selected_language


def log_message(
    cursor,
    conn,
    ip: str,
    role: str,
    content: str,
    language: str,
    timestamp: datetime,
) -> None:
    cursor.execute(
        "INSERT INTO messages "
        "(ip, role, content, timestamp, language) "
        "VALUES (?, ?, ?, ?, ?)",
        (ip, role, content, timestamp.isoformat(), language),
    )
    conn.commit()
