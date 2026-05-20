
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.schemas import ReportCreate, ReportResponse
from app.core.db import get_db
from app.core.permissions import require_min_level
from app.core.security import get_current_user
from app.models.enums import ReportType
from app.models.intervention import Intervention
from app.models.reports import Report
from app.models.user import User


router = APIRouter(tags=["reports"])


@router.post("/add_report", status_code=201, response_model=ReportResponse)
def add_report(
    data: ReportCreate,
    current_user: User = Depends(require_min_level(2)),
    db: Session =Depends(get_db),
    ):
    """Création d'un rapport d'intervention + modification du statut"""
    if data.type == ReportType.REFUSAL and current_user.role_id < 3:
        raise HTTPException(status_code=403, detail="Vous n'avez pas les permissions requises")
    
    new_report = Report(
            type=data.type,
            description=data.description,
            intervention_id=data.intervention_id,
            user_id=current_user.id
        )
    db.add(new_report)
    if data.type == ReportType.CLOSURE or data.type == ReportType.REFUSAL:
        intervention = db.query(Intervention).filter(Intervention.id == data.intervention_id).first()
        if intervention is None:
            raise HTTPException(status_code=404, detail="Intervention introuvable")
        if data.type == ReportType.CLOSURE:
            intervention.status = "CLOSED"
        else:
            intervention.status = "REJECTED"
    
    db.commit()
    db.refresh(new_report)
        
    return new_report    

@router.get("/intervention/{intervention_id}/reports", status_code=200, response_model=list[ReportResponse])
def get_report(
    intervention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session =Depends(get_db),
    ):
    """Récupération d'un rapport selon role"""
    query = db.query(Report).filter(Report.intervention_id == intervention_id)
    if current_user.role_id == 1:
        query = query.filter(Report.type.in_([ReportType.CLOSURE, ReportType.REFUSAL]))
    reports = query.all()
    if not reports:
            raise HTTPException(status_code=404, detail="Rapport introuvable")
    
    return reports
    











