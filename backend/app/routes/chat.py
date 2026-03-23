from datetime import datetime

from fastapi import APIRouter, Query, Request

from app.core.config import DEFAULT_LANGUAGE
from app.core.database import get_db
from app.schemas import MessageIn
from app.services.chat_service import handle_chat, log_message, normalize_language

router = APIRouter()


@router.post("/chat")
async def chat(request: Request, msg: MessageIn, language: str = Query(DEFAULT_LANGUAGE)):
    client_ip = request.client.host
    now = datetime.now()

    prompt = msg.message.strip()
    conn, cursor = get_db()
    selected_language = normalize_language(language)

    # Store user message
    try:
        log_message(
            cursor,
            conn,
            ip=client_ip,
            role="user",
            content=prompt,
            language=selected_language,
            timestamp=now,
        )
    except Exception as exc:
        print(f"Error storing user message: {exc}")

    try:
        pdf_text = request.app.state.pdf_text
        reply, selected_language = handle_chat(prompt, selected_language, pdf_text)

        log_message(
            cursor,
            conn,
            ip=client_ip,
            role="assistant",
            content=reply,
            language=selected_language,
            timestamp=now,
        )
    except Exception as exc:
        print(f"Error in chat processing: {exc}")
        reply = "Sorry, something went wrong. Please try again."
        try:
            log_message(
                cursor,
                conn,
                ip=client_ip,
                role="assistant",
                content=reply,
                language=selected_language,
                timestamp=now,
            )
        except Exception:
            pass

    return {"reply": reply, "language": selected_language}
