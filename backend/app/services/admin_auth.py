# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: admin_auth.py
# Purpose: In-memory admin token issuance and validation.
# Overview:
# - Issues role-scoped tokens
# - Validates token expiry
# - Retrieves role for access control
import secrets
from datetime import datetime, timedelta
from typing import Dict, Tuple

from app.core.config import ADMIN_TOKEN_TTL_MINUTES

_tokens: Dict[str, Tuple[datetime, str]] = {}


def issue_token(role: str) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(
        minutes=ADMIN_TOKEN_TTL_MINUTES
    )
    _tokens[token] = (expires_at, role)
    return token


def is_token_valid(token: str) -> bool:
    if not token:
        return False
    record = _tokens.get(token)
    if not record:
        return False
    expires_at, _role = record
    if datetime.utcnow() > expires_at:
        _tokens.pop(token, None)
        return False
    return True


def revoke_token(token: str) -> None:
    _tokens.pop(token, None)


def get_role(token: str) -> str:
    record = _tokens.get(token)
    if not record:
        return ""
    _expires_at, role = record
    return role
