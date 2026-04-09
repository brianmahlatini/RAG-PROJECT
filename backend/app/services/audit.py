# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: audit.py
# Purpose: Write admin audit events to SQLite.
# Overview:
# - Records login success/failure
# - Used for compliance and review
from datetime import datetime

from app.core.database import get_db


def log_admin_action(ip: str, action: str) -> None:
    conn, cursor = get_db()
    cursor.execute(
        "INSERT INTO admin_audit (ip, action, timestamp) VALUES (?, ?, ?)",
        (ip, action, datetime.utcnow().isoformat()),
    )
    conn.commit()
