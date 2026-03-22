from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User

def require_min_level (min_level: int):
    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role_details is None or current_user.role_details.level is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        if current_user.role_details.level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé",
            )
        return current_user
    return _dependency

