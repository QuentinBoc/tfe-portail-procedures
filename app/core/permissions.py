from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User

def require_role (required_role: str):
    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role_details is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        if current_user.role_details.name != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return current_user
    return _dependency

def require_any_role(roles):
    allowed = set(roles)

    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role_details is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        if current_user.role_details.name not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return current_user
    return _dependency