from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.api.schemas import InterventionCreate, InterventionOut, AssignRequest
from app.core.permissions import require_min_level
from app.core.security import get_current_user
from app.core.db import get_db
from app.models.user import User
from app.models.intervention import Intervention

router = APIRouter(tags=["interventions"])

@router.post("", status_code=201, response_model=InterventionOut)
def add_intervention(
    data: InterventionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    
    ):
    new_intervention = Intervention(
        title=data.title,
        description=data.description,
        location=data.location,
        type=data.type,
        created_by=current_user.id)
    
    db.add(new_intervention)
    db.commit()
    db.refresh(new_intervention)
    return new_intervention

@router.get("/mine", response_model=list[InterventionOut])
def get_my_interventions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    
    interventions = (
        db.query(Intervention)
        .filter(Intervention.created_by == current_user.id)
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return interventions

@router.get("/all", response_model=list[InterventionOut])
def get_all_interventions(
    current_user: User = Depends(require_min_level(5)),
    db: Session = Depends(get_db)):
    
    interventions = (
        db.query(Intervention)
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return interventions

@router.get("/pending", response_model=list[InterventionOut],)
def get_pending_interventions(
    _current_user: User = Depends(require_min_level(4)),
    db: Session = Depends(get_db)):
    
    
    interventions = (
        db.query(Intervention)
        .filter(Intervention.status == "PENDING")
        .order_by(Intervention.created_at.desc())
        .all()
     )
    return interventions


@router.get("/assigned", response_model=list[InterventionOut],)
def get_assigned_interventions(
    _current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)):
    
    
    interventions = (
        db.query(Intervention)
        .filter(
            Intervention.status == "ASSIGNED",
            Intervention.assigned_to == _current_user.id
        )
        .order_by(Intervention.created_at.desc())
        .all()
     )
    return interventions

@router.get("/validated", response_model=list[InterventionOut],)
def get_validated_interventions(
    _current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)):
    
    
    interventions = (
        db.query(Intervention)
        .filter(Intervention.status == "VALIDATED")
        .order_by(Intervention.created_at.desc())
        .all()
     )
    return interventions

@router.patch("/{id}/validate", response_model=InterventionOut)
def validate_intervention(
    id: int,
    current_user: User = Depends(require_min_level(4)),
    db: Session = Depends(get_db),
):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "PENDING":
        raise HTTPException(status_code=400, detail="Intervention non validable")
    intervention.status ="VALIDATED"
    intervention.validated_by = current_user.id

    db.commit()
    db.refresh(intervention)

    return intervention

@router.patch("/{id}/rejected", response_model=InterventionOut)
def rejected_intervention(
    id: int,
    current_user: User = Depends(require_min_level(4)),
    db: Session =Depends(get_db)
):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "PENDING":
        raise HTTPException(status_code=400, detail="Seules les interventions en attente peuvent être rejetées")
    intervention.status ="REJECTED"
    intervention.validated_by = current_user.id
    
    db.commit()
    db.refresh(intervention)
    
    return intervention

@router.patch("/{id}/assign", response_model=InterventionOut)
def assign_intervention(
    id: int,
    data: AssignRequest,
    current_user: User = Depends(require_min_level(3)),
    db: Session =Depends(get_db),
):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    elif intervention.status == "VALIDATED" and current_user.role_details.level >= 4:
        intervention.status ="ASSIGNED"
        intervention.assigned_to = data.assignee_id
    elif intervention.status == "ASSIGNED" and current_user.role_details.level >= 3:
        intervention.status ="PROCESSING"
        intervention.assigned_to = data.assignee_id
    else:
        raise HTTPException(status_code=403, detail="Vous n'avez pas les permissions requises")
            
    db.commit()
    db.refresh(intervention)
    
    return intervention

@router.patch("/{id}/closed", response_model=InterventionOut)
def closed_intervention(
    id: int,
    current_user: User = Depends(require_min_level(2)),
    db: Session =Depends(get_db)
):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "PROCESSING":
        raise HTTPException(status_code=400, detail="Seules les interventions en cours peuvent être fermées")
    intervention.status ="CLOSED"
    
    db.commit()
    db.refresh(intervention)
    
    return intervention

