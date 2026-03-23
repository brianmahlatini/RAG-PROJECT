# File: rate_limit.py
# Purpose: Simple IP-based rate limiting middleware for /chat.
# Overview:
# - Tracks requests per IP
# - Enforces request limits per time window
# - Returns 429 on limit exceed
# File: rate_limit.py
# Purpose: Project module for Tesla ChatBot.

from datetime import datetime
from typing import Dict

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_SECONDS


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.hits: Dict[str, list[datetime]] = {}

    async def dispatch(self, request: Request, call_next):
        # Only rate limit chat endpoint
        if request.url.path != "/chat":
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        now = datetime.utcnow()

        window_start = now.timestamp() - RATE_LIMIT_WINDOW_SECONDS
        history = self.hits.get(ip, [])
        history = [t for t in history if t.timestamp() >= window_start]

        if len(history) >= RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please slow down."},
            )

        history.append(now)
        self.hits[ip] = history

        return await call_next(request)




