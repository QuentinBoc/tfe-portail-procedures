from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core import db
from app.core.db import Base
from sqlalchemy.orm import Session
from sqlalchemy.orm import relationship
from app.models.role import Role

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role_details = relationship("Role")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def get_user_by_email(db, email: str):
    user = db.query(User).filter(User.email == email).first()
    return user


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()
