from pathlib import Path
import sys

# Permet d'exécuter le script depuis /scripts en gardant les imports "app.*"
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from sqlalchemy.exc import IntegrityError
from passlib.hash import pbkdf2_sha256
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models.user import User, get_user_by_email
from app.models.role import Role


ROLES_TO_CREATE = [
    {"name": "REQUESTER", "label": "Demandeur"},
    {"name": "TECHNICIAN", "label": "Technicien"},
    {"name": "SUPERVISOR", "label": "Superviseur"},
    {"name": "VALIDATOR", "label": "Validateur"},
    {"name": "ADMIN", "label": "Administrateur"},
]

ROLE_LABEL_BY_NAME = {r["name"]: r["label"] for r in ROLES_TO_CREATE}


def init_roles(db: Session) -> None:
    """Crée les rôles génériques si absents (idempotent)."""
    for role_data in ROLES_TO_CREATE:
        existing = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not existing:
            db.add(Role(name=role_data["name"], label=role_data["label"]))
    db.commit()


def get_or_create_role_id(db: Session, role_name: str) -> int:
    """Retourne l'id du rôle; le crée si absent."""
    role = db.query(Role).filter(Role.name == role_name).first()
    if role:
        return role.id

    label = ROLE_LABEL_BY_NAME.get(role_name, role_name)
    role = Role(name=role_name, label=label)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role.id


def create_admin(db: Session) -> None:
    """Crée l'admin si absent (idempotent)."""
    existing = get_user_by_email(db, "admin@admin.com")
    if existing:
        print("Admin existe déjà, aucun changement.")
        return

    admin = User(
        email="admin@admin.com",
        full_name="Administrateur",
        password_hash=pbkdf2_sha256.hash("admin"),
        role_id=get_or_create_role_id(db, "ADMIN"),
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