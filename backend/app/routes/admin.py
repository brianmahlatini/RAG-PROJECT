# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: admin.py
# Purpose: Admin API routes.
# Overview:
# - Login and token issuance
# - Messages/users pagination
# - CSV/JSON exports
# - Audit exports

import csv  # noqa: F401

from fastapi import APIRouter, HTTPException, Request  # type: ignore
# noqa: F401
from fastapi.responses import FileResponse  # type: ignore # noqa: F401

from app.core.config import (
    ADMIN_PASSWORD,
    DEFAULT_LANGUAGE,
    VIEWER_PASSWORD,
)  # type: ignore # noqa: F401
from app.core.database import get_db  # type: ignore # noqa: F401
from app.schemas import AdminLogin  # type: ignore # noqa: F401
from app.services.admin_auth import (
    issue_token,
    is_token_valid,
    get_role,
)  # type: ignore # noqa: F401
from app.services.audit import log_admin_action  # type: ignore
# noqa: F401

router = APIRouter(prefix="/admin")


def require_admin(request: Request) -> None:
    token = request.headers.get("x-admin-token") or (
        request.query_params.get("token")
    )
    if not is_token_valid(token):
        raise HTTPException(
            status_code=401, detail="Admin token missing or expired"
        )
    role = get_role(token)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")


def require_viewer(request: Request) -> None:
    token = request.headers.get("x-admin-token") or (
        request.query_params.get("token")
    )
    if not is_token_valid(token):
        raise HTTPException(
            status_code=401, detail="Admin token missing or expired"
        )
    _ = get_role(token)


@router.post("/login")
def admin_login(request: Request, payload: AdminLogin):
    # Simple shared-password auth
    role = ""
    if payload.password == ADMIN_PASSWORD:
        role = "admin"
    elif VIEWER_PASSWORD and payload.password == VIEWER_PASSWORD:
        role = "viewer"
    else:
        log_admin_action(
            request.client.host if request.client else "unknown",
            "admin_login_failed",
        )
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = issue_token(role)
    log_admin_action(
        request.client.host if request.client else "unknown",
        f"admin_login_success:{role}",
    )
    return {"status": "success", "token": token, "role": role}


@router.get("/messages")
def get_all_messages(request: Request, page: int = 1, page_size: int = 50):
    require_viewer(request)
    # Return all stored messages for admin dashboard
    _, cursor = get_db()
    offset = (page - 1) * page_size
    cursor.execute("SELECT COUNT(*) FROM messages")
    total = cursor.fetchone()[0]
    cursor.execute(
        "SELECT id, ip, role, content, timestamp, language FROM messages "
        "ORDER BY timestamp DESC LIMIT ? OFFSET ?",
        (page_size, offset),
    )
    rows = cursor.fetchall()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": [
            {
                "id": r[0],
                "ip": r[1],
                "role": r[2],
                "content": r[3],
                "timestamp": r[4],
                "language": r[5] or DEFAULT_LANGUAGE,
            }
            for r in rows
        ],
    }


@router.get("/users")
def get_all_users(request: Request, page: int = 1, page_size: int = 50):
    require_viewer(request)
    # Return all registered users (IP + policy)
    _, cursor = get_db()
    offset = (page - 1) * page_size
    cursor.execute("SELECT COUNT(*) FROM users")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT * FROM users LIMIT ? OFFSET ?", (page_size, offset))
    rows = cursor.fetchall()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": [{"ip": r[0], "policy": r[1]} for r in rows],
    }


@router.get("/export/messages")
def export_messages_csv(request: Request):
    require_viewer(request)
    # Export messages as CSV file
    filename = "messages_export.csv"
    _, cursor = get_db()
    cursor.execute(
        "SELECT id, ip, role, content, timestamp, language FROM messages"
    )
    rows = cursor.fetchall()
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["ID", "IP", "Role", "Content", "Timestamp", "Language"]
        )
        writer.writerows(rows)
    return FileResponse(
        path=filename, media_type="text/csv", filename=filename
    )


@router.get("/export/messages-json")
def export_messages_json(request: Request):
    require_viewer(request)
    _, cursor = get_db()
    cursor.execute(
        "SELECT id, ip, role, content, timestamp, language FROM messages"
    )
    rows = cursor.fetchall()
    data = [
        {
            "id": r[0],
            "ip": r[1],
            "role": r[2],
            "content": r[3],
            "timestamp": r[4],
            "language": r[5] or DEFAULT_LANGUAGE,
        }
        for r in rows
    ]
    return {"count": len(data), "messages": data}


@router.get("/export/users")
def export_users_csv(request: Request):
    require_viewer(request)
    # Export users as CSV file
    filename = "users_export.csv"
    _, cursor = get_db()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["IP", "Policy Number"])
        writer.writerows(rows)
    return FileResponse(
        path=filename, media_type="text/csv", filename=filename
    )


@router.get("/debug/last-messages")
def debug_last_messages(request: Request, limit: int = 10):
    require_admin(request)
    # Small debug endpoint for recent messages
    _, cursor = get_db()
    cursor.execute(
        "SELECT id, language, role, content, timestamp FROM messages "
        "ORDER BY id DESC LIMIT ?",
        (limit,),
    )
    rows = cursor.fetchall()
    result = []
    for row in rows:
        content = row[3]
        result.append(
            {
                "id": row[0],
                "language": row[1] or DEFAULT_LANGUAGE,
                "role": row[2],
                "content": (
                    content[:100] + "..."
                    if content and len(content) > 100
                    else content
                ),
                "timestamp": row[4],
            }
        )
    return result


@router.post("/fix-database")
def fix_database(request: Request):
    require_admin(request)
    # One-time cleanup for legacy language values
    fixes = []
    conn, cursor = get_db()

    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN language TEXT")
        conn.commit()
        fixes.append("Added language column")
    except Exception:
        fixes.append("Language column already exists")

    cursor.execute(
        "UPDATE messages SET language = ? WHERE language IS NULL",
        (DEFAULT_LANGUAGE,),
    )
    fixes.append(f"Fixed NULL languages: {cursor.rowcount} rows")

    cursor.execute(
        "UPDATE messages SET language = 'english' "
        "WHERE language LIKE '%English%'"
    )
    fixes.append(f"Fixed English variants: {cursor.rowcount} rows")

    cursor.execute(
        "UPDATE messages SET language = 'german' "
        "WHERE language LIKE '%German%'"
    )
    fixes.append(f"Fixed German variants: {cursor.rowcount} rows")

    conn.commit()

    cursor.execute("SELECT language, COUNT(*) FROM messages GROUP BY language")
    stats = cursor.fetchall()

    return {"fixes": fixes, "current_stats": dict(stats)}


@router.get("/audit")
def get_audit_logs(request: Request, page: int = 1, page_size: int = 50):
    require_admin(request)
    _, cursor = get_db()
    offset = (page - 1) * page_size
    cursor.execute("SELECT COUNT(*) FROM admin_audit")
    total = cursor.fetchone()[0]
    cursor.execute(
        "SELECT id, ip, action, timestamp FROM admin_audit "
        "ORDER BY timestamp DESC LIMIT ? OFFSET ?",
        (page_size, offset),
    )
    rows = cursor.fetchall()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": [
            {
                "id": r[0],
                "ip": r[1],
                "action": r[2],
                "timestamp": r[3],
            }
            for r in rows
        ],
    }


@router.get("/export/audit")
def export_audit_csv(request: Request):
    require_admin(request)
    filename = "audit_export.csv"
    _, cursor = get_db()
    cursor.execute("SELECT id, ip, action, timestamp FROM admin_audit")
    rows = cursor.fetchall()
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "IP", "Action", "Timestamp"])
        writer.writerows(rows)
    return FileResponse(
        path=filename, media_type="text/csv", filename=filename
    )
