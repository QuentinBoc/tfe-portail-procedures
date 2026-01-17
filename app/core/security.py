import hmac
import hashlib
import time

from app.core.config import settings
from passlib.hash import pbkdf2_sha256
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import get_user_by_id

auth_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pbkdf2_sha256.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pbkdf2_sha256.verify(plain_password, hashed_password)

def create_token(user_id: int) -> str:
    timestamp = str(int(time.time()))
    secret_key = settings.secret_key.encode()
    message = f"{user_id}.{timestamp}".encode()
    signature = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
    token = f"{user_id}.{timestamp}.{signature}"
    return token

def verify_token(token: str) -> int | None:
    
    try:
        # Découper le token "user_id.timestamp.signature"
        user_id_str, timestamp_str, signature_str = token.split(".")
    except ValueError:
        # Mauvais format
        return None

    # Recalculer la signature attendue
    message = f"{user_id_str}.{timestamp_str}".encode()
    secret_key = settings.secret_key.encode()
    expected_signature = hmac.new(secret_key, message, hashlib.sha256).hexdigest()

    # Comparer les signatures
    if not hmac.compare_digest(expected_signature, signature_str):
        return None

    # Tenter de convertir user_id en entier
    try:
        return int(user_id_str)
    except ValueError:
        return None

def get_current_user (
        credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)
):
    token = credentials.credentials

    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token invalide ou expire")
   
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    
    return user

