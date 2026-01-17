from app.models.role import Role
from sqlalchemy.orm import Session


def init_roles(db: Session):
    roles_to_create = [
        {"name": "REQUESTER", "label": "Demandeur"},
        {"name": "TECHNICIAN", "label": "Technicien"},
        {"name": "SUPERVISOR", "label": "Superviseur"},
        {"name": "VALIDATOR", "label": "Validateur"},
        {"name": "ADMIN", "label": "Administrateur"},
    ]

    for role_data in roles_to_create:
        existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()

        if not existing_role:
            new_role = Role(name=role_data["name"], label=role_data["label"])

            db.add(new_role)
            db.commit()
            db.refresh(new_role)
            pass