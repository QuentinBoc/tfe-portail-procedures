from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from app.core.config import settings


class ReadOnlyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if settings.READ_ONLY_MODE is True:
            # Bloquer toutes les écritures
            if request.method in ("POST", "PUT", "PATCH", "DELETE"):
                raise HTTPException(status_code=403, detail="Le portail est en mode lecture seule.")
        return await call_next(request)
