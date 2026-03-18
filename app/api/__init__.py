from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.interventions_router import router as interventions_router
from app.api.roles import router as roles_router
from app.api.users import router as users_router


api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(interventions_router, prefix="/interventions")
api_router.include_router(roles_router)
api_router.include_router(users_router)