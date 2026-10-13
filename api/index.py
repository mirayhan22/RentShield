# Vercel serverless entry point for the RentShield FastAPI backend.
#
# Project layout (Vercel-ready monorepo):
#   api/index.py    — this thin entry point (Vercel runs functions from /api at the project root)
#   backend/        — the FastAPI application code (models, Supabase client, routes)
#   frontend/       — the Vite + React loan application (built to frontend/dist)
#
# Vercel may invoke this function with several request path shapes, e.g.
#   /api/auth/login, /api/index/auth/login, /api/index.py/auth/login
# The ASGI adapter below normalises the path so the routes defined in
# backend/main.py (e.g. /auth/login, /health) always resolve.

import os
import sys

# Ensure the project root is on the Python path so `backend` imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app as backend_app  # noqa: E402

# Prefixes Vercel may put in front of the real route path.
_PREFIXES = ("/api/index.py", "/api/index", "/api")


def _normalise_path(path: str) -> str:
    """Strip the Vercel function prefix so backend routes match."""
    for prefix in _PREFIXES:
        if path == prefix or path.startswith(prefix + "/"):
            path = path[len(prefix):]
            break
    return path or "/"


class _PathNormaliser:
    """Minimal ASGI adapter that strips the function-path prefix."""

    def __init__(self, app):
        self._app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            scope = dict(scope)
            scope["path"] = _normalise_path(scope.get("path", ""))
        await self._app(scope, receive, send)


# Vercel expects the ASGI app to be exposed as `app`
app = _PathNormaliser(backend_app)

__all__ = ["app"]