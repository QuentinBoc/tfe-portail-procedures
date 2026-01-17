from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.interventions_router import router as interventions_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(interventions_router, prefix="/interventions")
