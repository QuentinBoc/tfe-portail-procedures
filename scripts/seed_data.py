from sqlite3 import IntegrityError
import sys
from pathlib import Path

# Ajouter la racine du projet au PYTHONPATH
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from app.core.db import SessionLocal
from app.models.user import User, get_user_by_email
from passlib.hash import pbkdf2_sha256


def create_admin():
    db = SessionLocal()

    existing = get_user_by_email(db, "admin@admin.com")
    if existing:
        print("Admin existe déjà, aucun changement.")
        db.close()
        return
    
    admin = User(
        email="admin@admin.com",
        full_name="Administrateur",
        password_hash=pbkdf2_sha256.hash("admin"),  # mot de passe: admin
        role="ADMIN",
    )

    db.add(admin)
    try:
        db.commit()
        print("Admin créé : admin@admin.com / mot de passe : admin")
    except IntegrityError:
        db.rollback()
        print("Conflit d'unicité : admin existe déjà.")
    finally:
        db.close()




def create_prefet():
    db = SessionLocal()

    existing = get_user_by_email(db, "prefet@prefet.com")
    if existing:
        print("Prefet existe déjà, aucun changement.")
        db.close()
        return
    
    prefet = User(
        email="prefet@prefet.com",
        full_name="Prefet",
        password_hash=pbkdf2_sha256.hash("prefet"), 
        role="PREFET",
    )

    db.add(prefet)
    try:
        db.commit()
        print("Prefet créé : prefet@prefet.com / mot de passe : prefet")
    except IntegrityError:
        db.rollback()
        print("Conflit d'unicité : prefet existe déjà.")
    finally:
        db.close()




def create_chef_ouvrier():
    db = SessionLocal()

    existing = get_user_by_email(db, "chef_ouvrier@chef_ouvrier.com")
    if existing:
        print("Chef_ouvrier existe déjà, aucun changement.")
        db.close()
        return
    
    chef_ouvrier = User(
        email="chef_ouvrier@chef_ouvrier.com",
        full_name="Chef_ouvrier",
        password_hash=pbkdf2_sha256.hash("chef_ouvrier"), 
        role="CHEF_OUVRIER",
    )

    db.add(chef_ouvrier)
    try:
        db.commit()
        print("Chef_ouvrier créé : chef_ouvrier@chef_ouvrier.com / mot de passe : chef_ouvrier")
    except IntegrityError:
        db.rollback()
        print("Conflit d'unicité : chef_ouvrier existe déjà.")
    finally:
        db.close()
    
def create_ouvrier():
    db = SessionLocal()

    existing = get_user_by_email(db, "ouvrier@ouvrier.com")
    if existing:
        print("Ouvrier existe déjà, aucun changement.")
        db.close()
        return
    
    ouvrier = User(
        email="ouvrier@ouvrier.com",
        full_name="Ouvrier",
        password_hash=pbkdf2_sha256.hash("ouvrier"),
        role="OUVRIER",
    )

    db.add(ouvrier)
    try:
        db.commit()
        print("Ouvrier créé : ouvrier@ouvrier.com / mot de passe : ouvrier")
    except IntegrityError:
        db.rollback()
        print("Conflit d'unicité : ouvrier existe déjà.")
    finally:
        db.close()




if __name__ == "__main__":
    create_admin()
    create_chef_ouvrier()
    create_prefet()
    create_ouvrier()