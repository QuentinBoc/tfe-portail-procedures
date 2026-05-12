from datetime import datetime, timezone
from app.core.db import Base
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_notifications_user_id"), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.id", name="fk_notifications_interventions_id"), nullable=False)
    