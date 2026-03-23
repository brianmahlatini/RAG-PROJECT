import csv

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core.config import ADMIN_PASSWORD, DEFAULT_LANGUAGE
from app.core.database import get_db
from app.schemas import AdminLogin

router = APIRouter(prefix="/admin")


@router.post("/login")
def admin_login(payload: AdminLogin):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"status": "success"}


@router.get("/messages")
def get_all_messages():
    _, cursor = get_db()
    cursor.execute("SELECT id, ip, role, content, timestamp, language FROM messages ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    return [
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


@router.get("/users")
def get_all_users():
    _, cursor = get_db()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    return [{"ip": r[0], "policy": r[1]} for r in rows]


@router.get("/export/messages")
def export_messages_csv():
    filename = "messages_export.csv"
    _, cursor = get_db()
    cursor.execute("SELECT id, ip, role, content, timestamp, language FROM messages")
    rows = cursor.fetchall()
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "IP", "Role", "Content", "Timestamp", "Language"])
        writer.writerows(rows)
    return FileResponse(path=filename, media_type="text/csv", filename=filename)


@router.get("/export/users")
def export_users_csv():
    filename = "users_export.csv"
    _, cursor = get_db()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["IP", "Policy Number"])
        writer.writerows(rows)
    return FileResponse(path=filename, media_type="text/csv", filename=filename)


@router.get("/debug/last-messages")
def debug_last_messages(limit: int = 10):
    _, cursor = get_db()
    cursor.execute(
        "SELECT id, language, role, content, timestamp FROM messages ORDER BY id DESC LIMIT ?",
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
                "content": content[:100] + "..." if content and len(content) > 100 else content,
                "timestamp": row[4],
            }
        )
    return result


@router.post("/fix-database")
def fix_database():
    fixes = []
    conn, cursor = get_db()

    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN language TEXT")
        conn.commit()
        fixes.append("Added language column")
    except Exception:
        fixes.append("Language column already exists")

    cursor.execute("UPDATE messages SET language = ? WHERE language IS NULL", (DEFAULT_LANGUAGE,))
    fixes.append(f"Fixed NULL languages: {cursor.rowcount} rows")

    cursor.execute("UPDATE messages SET language = 'english' WHERE language LIKE '%English%'")
    fixes.append(f"Fixed English variants: {cursor.rowcount} rows")

    cursor.execute("UPDATE messages SET language = 'german' WHERE language LIKE '%German%'")
    fixes.append(f"Fixed German variants: {cursor.rowcount} rows")

    conn.commit()

    cursor.execute("SELECT language, COUNT(*) FROM messages GROUP BY language")
    stats = cursor.fetchall()

    return {"fixes": fixes, "current_stats": dict(stats)}
