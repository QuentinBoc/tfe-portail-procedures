from fastapi import APIRouter, Depends, HTTPException
from app.api.schemas import UpdateRoleRequest, UserCreate, UserCreateAdmin, UserOut
from app.core.db import get_db
from sqlalchemy.orm import Session
from app.core.permissions import require_min_level
from app.models.role import Role
from app.models.user import User
from app.services.user_service import create_user, get_assignable_users, get_user_by_id



router = APIRouter(prefix="/users", tags=["users"])

@router.get("/all", response_model=list[UserOut])
def get_all_users(
    current_user: User = Depends(require_min_level(5)),
    db: Session = Depends(get_db)):
    
    all_user = (
        db.query(User).all()
    )

    return all_user

@router.post("/register", status_code=201, response_model=UserOut)
def create_user_endpoint(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        user = create_user(
            db,
            payload.email,
            payload.full_name,
            payload.password,
        )
        return user
    
    except ValueError as e:
        if str(e) == "email existe déjà":
            raise HTTPException(status_code=409, detail=str(e))

@router.get("/assignableUsers", response_model=list[UserOut])
def get_assignable_users(
    current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)):
    
    users = (
        db.query(User).join(Role)
        .filter(
            Role.level == 2,
        )
        .all()
    )
    
    return users

@router.get("", response_model=list[UserOut])
def get_users(
    current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db)
):
    return get_assignable_users(db, current_user.role_details.level)




@router.post("/admin/create", status_code=201, response_model=UserOut)
def admin_create_user_endpoint(
    payload: UserCreateAdmin,
    db: Session = Depends(get_db)
):
    try:
        user = create_user(
            db,
            payload.email,
            payload.full_name,
            payload.password,
            payload.role_id,
        )
        return user
    
    except ValueError as e:
        if str(e) == "email existe déjà":
            raise HTTPException(status_code=409, detail=str(e))

@router.patch("/{id}/role", response_model=UserOut)
def update_user_role(
    id: int,
    payload: UpdateRoleRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_min_level(5)),
    ):
    user = get_user_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user.role_id = payload.role_id
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{id}/deactivate", response_model=UserOut)
def deactivate_user(
    id: int,
    current_user: User = Depends(require_min_level(5)),
    db: Session = Depends(get_db)):
    user = get_user_by_id(db, id)
    
    if user is None:
        raise HTTPException(
            status_code=404, 
            detail="Utilisateur non trouvé"
        )
    user.is_active = False
    
    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Erreur lors de la désactivation de l'utilisateur"
        )
