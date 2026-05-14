
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User


def create_notification(db: Session, user_id: int, message: str, intervention_id: int):
    """créer une notification et l'inscrire en base"""
    new_notification = Notification(
        user_id=user_id,
        message=message,
        intervention_id=intervention_id,
    )
    db.add(new_notification)
    try:
        db.commit()
        db.refresh(new_notification)
    except IntegrityError:
        db.rollback()
        raise ValueError("Integrity error")
    return new_notification

def notification_all_users(db: Session, role_id: int, message: str, intervention_id: int):
    """Récupération des users avec role_id requis"""  
    users_notifications = db.query(User).filter(User.role_id == role_id).all()
    for user in users_notifications:
        create_notification(db= db, user_id= user.id, message= message, intervention_id= intervention_id)
        
def check_notification(db: Session, intervention_id: int, user_id: int):
    notifications = db.query(Notification).filter(Notification.intervention_id == intervention_id, Notification.user_id == user_id, Notification.is_read == False)
    for notification in notifications:
        notification.is_read = True