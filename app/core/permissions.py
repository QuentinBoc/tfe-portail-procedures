from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User
from typing import Callable, Iterable

def require_role (required_role: str):
    def _dependency(current_user: User = Depends(get_current_user)) -> Callable:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return current_user
    return _dependency

def require_any_role(roles):
    allowed = set(roles)

    def _dependency(current_user: User = Depends(get_current_user)) -> Callable:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return current_user
    return _dependency