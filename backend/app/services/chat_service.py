# File: chat_service.py
# Purpose: Core chat logic.
# Overview:
# - Builds system prompt
# - Calls OpenAI for response
# - Applies greeting rules and translation
# - Stores messages in DB
# File: chat_service.py
# Purpose: Project module for Tesla ChatBot.

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


def generate_reply(prompt: str, pdf_text: str, retrieved_chunks: list[str]) -> str:
    # Primary LLM call: combine system prompt + PDF corpus + user prompt
    context = pdf_text
    if retrieved_chunks:
        context = "\n\n".join(retrieved_chunks)
    response = openai.ChatCompletion.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Tesla ChatBot, Tesla's official assistant. "
                    "Answer all questions clearly, confidently, and professionally as if you are speaking on behalf of Tesla. "
                    "Use the Tesla document text provided below to answer questions about Tesla products, services, policies, and support. "
                    "If a question is not covered in the documents, answer from general Tesla knowledge and be transparent if you are unsure. "
                    "Do not mention visiting websites or calling support; provide direct, clear answers. "
                    "Do not greet or welcome the user; answer the question immediately."
                ),
            },
            {"role": "system", "content": context or ""},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    return response["choices"][0]["message"]["content"].strip()


def strip_greeting(reply: str) -> str:
    lowered = reply.strip().lower()
    greeting_phrases = [
        "hello! welcome to tesla chatbot",
        "hello! welcome to tesla chat bot",
        "hello! welcome",
        "hello",
        "hi",
        "good morning",
        "good afternoon",
        "good evening",
        "welcome to tesla chatbot",
    ]
    # Remove any sentence that contains greeting phrases
    sentences = [s.strip() for s in reply.replace("!", ".").split(".") if s.strip()]
    filtered = []
    for sentence in sentences:
        s_lower = sentence.lower()
        if any(phrase in s_lower for phrase in greeting_phrases):
            continue
        filtered.append(sentence)
    if not filtered:
        return reply
    return ". ".join(filtered).strip()


def is_simple_greeting(text: str) -> bool:
    cleaned = text.strip().lower()
    if not cleaned:
        return False
    greeting_set = {
        "hi",
        "hie",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
    }
    if cleaned in greeting_set:
        return True
    # Allow greeting with punctuation only
    if cleaned.rstrip("!.") in greeting_set:
        return True
    # If it is just a greeting with 1-2 words, treat it as greeting
    if len(cleaned.split()) <= 2 and any(g in cleaned for g in greeting_set):
        return True
    return False


def handle_chat(
    prompt: str,
    language: str,
    pdf_text: str,
    retrieved_chunks: list[str],
) -> Tuple[str, str]:
    # Route a chat request: greeting shortcut + LLM response + optional translation
    selected_language = normalize_language(language)

    if is_simple_greeting(prompt):
        base_reply = "Hello! How can I help you with Tesla today?"
        reply = (
            translate_text(base_reply, selected_language)
            if selected_language != "english"
            else base_reply
        )
        return reply, selected_language

    english_reply = generate_reply(prompt, pdf_text, retrieved_chunks)
    english_reply = strip_greeting(english_reply)
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
    # Persist a single message into SQLite
    cursor.execute(
        "INSERT INTO messages (ip, role, content, timestamp, language) VALUES (?, ?, ?, ?, ?)",
        (ip, role, content, timestamp.isoformat(), language),
    )
    conn.commit()




