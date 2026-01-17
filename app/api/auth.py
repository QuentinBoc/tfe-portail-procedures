from fastapi import APIRouter, Depends, HTTPException
from app.models.user import get_user_by_email
from app.core.security import verify_password
from app.core.db import get_db
from app.api.shemas import LoginRequest
from sqlalchemy.orm import Session 
from app.core.security import create_token, verify_password, get_current_user


router = APIRouter()

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.get("/debug/user-by-email")
async def debug_user(email: str, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    if user:
        return {"id": user.id, "email": user.email, "full_name": user.full_name}
    else:
        return {"message": "aucun utilisateur trouve !"}


@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = get_user_by_email(db, data.email)

    if user is None:
        raise HTTPException(status_code=400, detail="Aucun utilisateur trouvé")

    is_valid = verify_password(data.password, user.password_hash)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Probleme identification")
    
    token = create_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
        }