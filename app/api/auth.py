from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from app.models.user import User, get_user_by_email
from app.core.security import verify_password
from app.core.db import get_db
from app.api.shemas import LoginRequest
from sqlalchemy.orm import Session 
from app.core.security import create_token, verify_password, get_current_user


router = APIRouter()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    role = current_user.role_details
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": role.name if role else None,
        "role_label": role.label if role else None,
        "role_id": current_user.role_id,
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

    email = data.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()

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
