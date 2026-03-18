from fastapi import APIRouter, Depends
from app.core.db import get_db
from sqlalchemy.orm import Session
from app.models.role import Role

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("")
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).order_by(Role.name).all()
    return [{"name": r.name, "label": r.label} for r in roles]