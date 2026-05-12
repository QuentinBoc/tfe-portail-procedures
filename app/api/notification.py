from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.schemas import NotificationOut
from app.core.security import get_current_user
from app.core import db
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(tags=["notifications"])

@router.get("/notifications", response_model=list[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(db.get_db)):
    
    """Récupère les notifications"""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .all()
     )
    return notifications


@router.patch("/{id}/notifications_readed", response_model=NotificationOut)
def read_notification(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(db.get_db)):
    """Marque la notification comme vu"""
    
    notification = db.query(Notification).filter(Notification.id == id).first()
    
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="La notification ne vous est pas attribué")
    if not notification.is_read:
        notification.is_read = True
    
    db.commit()
    db.refresh(notification)

    return notification

@router.patch("/check_all_notifications")
def check_notifications(
    current_user: User =  Depends(get_current_user),
    db: Session = Depends(db.get_db)):
    """Marque tout les notifications en lu"""
    
    notification = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).all()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    for notif in notification:
        notif.is_read = True
    
    db.commit()   
    
    return notification
