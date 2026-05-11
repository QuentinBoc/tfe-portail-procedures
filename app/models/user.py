from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.db import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", name="fk_user_role_id"), default=1, nullable=False)
    role_details = relationship("Role")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


