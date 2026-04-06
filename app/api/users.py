from fastapi import APIRouter, Depends, HTTPException
from app.api.schemas import UserCreate, UserOut
from app.core.db import get_db
from sqlalchemy.orm import Session

from app.core.permissions import require_min_level
from app.models.role import Role
from app.models.user import User
from app.services.user_service import create_user, get_assignable_users



router = APIRouter(prefix="/users", tags=["users"])

@router.post("")
def create_user_endpoint(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        user = create_user(
            db,
            payload.email,
            payload.full_name,
            payload.password,
            payload.role_name,
        )
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role_name": payload.role_name,
        }
    except ValueError as e:
        if str(e) == "email existe déjà":
            raise HTTPException(status_code=409, detail=str(e))
        if str(e) == "role inconnu":
            raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/assignableUsers", response_model=list[UserOut])
def get_assignable_users(
    current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)):
    
    users = (
        db.query(User).join(Role)
        .filter(
            Role.level == 2,
        )
        .all()
    )
    
    return users

@router.get("", response_model=list[UserOut])
def get_users(
    current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)
):
    return get_assignable_users(db, current_user.role_details.level)


