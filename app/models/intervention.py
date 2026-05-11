from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.db import Base


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    created_by = Column(Integer, ForeignKey("users.id", name="fk_interventions_created_by"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    assigned_to = Column(Integer, ForeignKey("users.id", name="fk_interventions_assigned_to"), nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    validated_by = Column(Integer, ForeignKey("users.id", name="fk_interventions_validated_by"), nullable=True)
    validated_at = Column(DateTime, nullable=True)
    processing_by = Column(Integer, ForeignKey("users.id", name="fk_interventions_processing_by"), nullable=True)
    processing_at = Column(DateTime, nullable=True)
    closed_by = Column(Integer, ForeignKey("users.id", name="fk_interventions_closed_by"), nullable=True)
    closed_at = Column(DateTime, nullable=True)
    rejected_by = Column(Integer, ForeignKey("users.id", name="fk_interventions_rejected_by"), nullable=True)
    rejected_at = Column(DateTime, nullable=True)