from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.hashing import hash_password
from app.models.role import Role
from app.models.user import User

def get_user_by_email(db, email: str):
    user = db.query(User).filter(User.email == email).first()
    return user


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, email: str, full_name: str, password: str, role_name: str):
    email = email.strip().lower()
    existing = get_user_by_email(db, email)
    if existing:
        raise ValueError("email existe déjà")
    
    role = db.query(Role).filter(Role.label == role_name).first()
    if not role:
        raise ValueError("role inconnu")
    
    new_user = User(
        email=email,
        full_name=full_name.strip(),
        password_hash= hash_password(password),
        role_id=role.id,
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise ValueError("Integrity error")
    return new_user

def get_assignable_users(db: Session, current_level: int) -> list[User]:
        
    return db.query(User).join(Role).filter(Role.level < current_level).all()

