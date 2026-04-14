from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from app.core.config import settings


class ReadOnlyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        """Controle avant chaque requete HTTP"""
        if settings.READ_ONLY_MODE:
            if request.method in ("POST", "PUT", "PATCH", "DELETE"):
                return JSONResponse(
                    status_code=403,
                    content={"detail":"Le portail est en mode lecture seule."}
                )
        return await call_next(request)
