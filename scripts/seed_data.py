
from pathlib import Path
import sys


# Permet d'exécuter le script depuis /scripts en gardant les imports "app.*"

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))


from app.services.user_service import get_user_by_email



from sqlalchemy.exc import IntegrityError
from app.core.hashing import hash_password
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models.user import User
from app.models.role import Role


ROLES_TO_CREATE = [
    {"label": "Utilisateur", "level": 1},
    {"label": "Technicien", "level": 2},
    {"label": "Chef", "level": 3},
    {"label": "Direction", "level": 4},
    {"label": "Admin", "level": 5},
    
]

ROLE_LABEL_BY_NAME = {r["label"]: r["level"] for r in ROLES_TO_CREATE}


def init_roles(db: Session) -> None:
    """Crée les rôles génériques si absents (idempotent)."""
    for role_data in ROLES_TO_CREATE:
        existing = db.query(Role).filter(Role.label == role_data["label"]).first()
        if not existing:
            db.add(Role(label=role_data["label"], level=role_data["level"]))
    db.commit()


def get_or_create_role_id(db: Session, role_label: str) -> int:
    role = db.query(Role).filter(Role.label == role_label).first()
    if role:
        return role.id
    level = ROLE_LABEL_BY_NAME.get(role_label)
    new_role = Role(label=role_label, level=level)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role.id


def create_admin(db: Session) -> None:
    """Crée l'admin si absent (idempotent)."""
    existing = get_user_by_email(db, "admin@admin.com")
    if existing:
        print("Admin existe déjà, aucun changement.")
        return

    admin = User(
        email="admin@admin.com",
        full_name="Administrateur",
        password_hash=hash_password("admin"),
        role_id=get_or_create_role_id(db, "Admin"),
    )

    db.add(admin)
    try:
        db.commit()
        print("Admin créé : admin@admin.com / mot de passe : admin")
    except IntegrityError:
        db.rollback()
        print("Conflit d'unicité : admin existe déjà.")


def main():
    db = SessionLocal()
    try:
        init_roles(db)
        create_admin(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()