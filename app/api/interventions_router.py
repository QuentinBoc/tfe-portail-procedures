from sqlalchemy import desc
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.api.shemas import InterventionCreate, SendToChefRequest, SendToWorkerRequest, InterventionOut
from app.core.permissions import require_role
from app.core.security import get_current_user
from app.core.db import get_db
from app.models import intervention
from app.models.user import User
from app.models.intervention import Intervention

router = APIRouter(tags=["interventions"])

@router.get("/mine")
def get_my_interventions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    
    interventions = (
        db.query(Intervention)
        .filter(Intervention.created_by_id == current_user.id)
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return{
        "interventions": [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "location": i.location,
                "status": i.status,
                "created_by_id": i.created_by_id,
                "validated_by_id": i.validated_by_id,
                "assigned_to_id": i.assigned_to_id,
                "sent_to_chef_by_id": i.sent_to_chef_by_id,
                "sent_to_worker_by_id": i.sent_to_worker_by_id,
                "created_at": i.created_at.isoformat() if i.created_at else None,
                "updated_at": i.updated_at.isoformat() if i.updated_at else None,
            }
            for i in interventions
        ]
    }

@router.post("")
async def add_intervention(
    data: InterventionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    
    ):
    new_intervention = Intervention(
        title=data.title,
        description=data.description,
        location=data.location,
        created_by_id=current_user.id)
    
    db.add(new_intervention)
    db.commit()
    db.refresh(new_intervention)
    return new_intervention


@router.patch("/{intervention_id}/validate", response_model=InterventionOut)
def validate_intervention(
    intervention_id: int,
    current_user: User = Depends(require_role("PREFET")),
    db: Session = Depends(get_db),
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "PENDING":
        raise HTTPException(status_code=400, detail="Intervention non validable")
    intervention.status ="APPROVED"
    intervention.validated_by_id = current_user.id

    db.commit()
    db.refresh(intervention)

    return intervention



@router.patch("/{intervention_id}/send-to-chef", response_model=InterventionOut)
def send_to_chef(
    intervention_id: int,
    data: SendToChefRequest,
    current_user: User = Depends(require_role("PREFET")),
    db: Session = Depends(get_db),
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Vous devez valider l'intervention avant de l'assigner")
    intervention.status ="SENT_TO_CHEF"
    intervention.sent_to_chef_by_id = current_user.id
    intervention.assigned_to_id = data.chef_id

    db.commit()
    db.refresh(intervention)

    return intervention

@router.patch("/{intervention_id}/send-to-worker", response_model=InterventionOut)
def send_to_worker(
    intervention_id: int,
    data: SendToWorkerRequest,
    current_user: User = Depends(require_role("CHEF_OUVRIER")),
    db: Session = Depends(get_db),
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    if intervention.status != "SENT_TO_CHEF":
        raise HTTPException(status_code=400, detail="Le chef des ouvriers doit préalablement avoir reçu et validé l'intervention ")
    intervention.status ="ASSIGNED"
    intervention.sent_to_worker_by_id = current_user.id
    intervention.assigned_to_id = data.worker_id

    db.commit()
    db.refresh(intervention)

    return intervention

@router.get("/pending-validation", response_model=list[InterventionOut])
async def pending_validation(
    current_user: User = Depends(require_role("PREFET")),
    db: Session = Depends(get_db),
):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.status == "PENDING")
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return intervention

@router.get("/to-assign", response_model=list[InterventionOut])
async def to_assign_validation(
    current_user: User = Depends(require_role("CHEF_OUVRIER")),
    db: Session = Depends(get_db),
):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.status == "SENT_TO_CHEF")
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return intervention

@router.get("/assign-to-me", response_model=list[InterventionOut])
async def assign_to_me_validation(
    current_user: User = Depends(require_role("OUVRIER")),
    db: Session = Depends(get_db),
):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.status == "ASSIGNED",Intervention.assigned_to_id == current_user.id)
        .order_by(Intervention.created_at.desc())
        .all()
    )
    return intervention