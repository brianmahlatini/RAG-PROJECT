import sqlite3
from typing import Tuple

from app.core.config import DEFAULT_LANGUAGE

DB_PATH = "chat_data.db"

_conn = None
_cursor = None


def init_db() -> Tuple[sqlite3.Connection, sqlite3.Cursor]:
    global _conn, _cursor
    if _conn and _cursor:
        return _conn, _cursor

    _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    _cursor = _conn.cursor()

    _cursor.execute(
        """CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT,
            role TEXT,
            content TEXT,
            timestamp TEXT,
            language TEXT
        )"""
    )

    _cursor.execute(
        """CREATE TABLE IF NOT EXISTS users (
            ip TEXT PRIMARY KEY,
            policy TEXT
        )"""
    )
    _conn.commit()

    # Ensure language column exists (safe no-op on new DB)
    try:
        _cursor.execute("ALTER TABLE messages ADD COLUMN language TEXT")
        _conn.commit()
    except Exception:
        pass

    # Normalize NULL languages
    _cursor.execute(
        "UPDATE messages SET language = ? WHERE language IS NULL",
        (DEFAULT_LANGUAGE,),
    )
    _conn.commit()

    return _conn, _cursor


def get_db() -> Tuple[sqlite3.Connection, sqlite3.Cursor]:
    if not _conn or not _cursor:
        return init_db()
    return _conn, _cursor
