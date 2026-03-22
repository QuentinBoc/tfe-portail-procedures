from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.services.user_service import get_user_by_id
from sqlalchemy.orm import Session
from app.core.config import settings
import jwt
from app.core.db import get_db


auth_scheme = HTTPBearer()

def create_token(user_id):    
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc)+timedelta(days=1),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")

def verify_token(token: str) -> int | None:
    
    try:
       token_decoded = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
       return int(token_decoded['sub'])
    
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None



def get_current_user (
        credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)
):
    token = credentials.credentials

    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")
   
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    
    return user

