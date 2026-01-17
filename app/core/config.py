from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "TFE Portail Procédures"
    READ_ONLY_MODE: bool = False

    # lit la variable SECRET_KEY du .env
    secret_key: str = Field(..., alias="SECRET_KEY")

    DATABASE_URL: str = Field("sqlite:///./app.db", alias="DATABASE_URL")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="forbid" 
    )

settings = Settings()