from datetime import datetime, timezone
from app.core.db import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from app.models.enums import ReportType

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ReportType), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_reports_user_id"), nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime,default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.id", name="fk_reports_interventions_id"), nullable=False)