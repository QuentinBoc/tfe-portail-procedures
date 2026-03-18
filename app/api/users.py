from fastapi import APIRouter, Depends, HTTPException
from app.api.schemas import UserCreate
from app.core.db import get_db
from sqlalchemy.orm import Session

from app.services.user_service import create_user


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
