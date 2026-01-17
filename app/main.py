from fastapi import FastAPI
from app.core.middleware import ReadOnlyMiddleware
from app.api import api_router
from fastapi.middleware.cors import CORSMiddleware


def create_app():
    app = FastAPI(title="TFE Portail Procédures")

    # Middleware
    app.add_middleware(ReadOnlyMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:50455"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API
    app.include_router(api_router, prefix="/api/v1")

    # Page HTML
    @app.get("/")
    async def index():
        return {"message": "Portail administratif – OK"}

    return app


app = create_app()
