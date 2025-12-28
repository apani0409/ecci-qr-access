from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ecci_control"
    SQLALCHEMY_DATABASE_URL: Optional[str] = None

    # JWT
    SECRET_KEY: str = "your-secret-key-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API
    API_TITLE: str = "ECCI Control System API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Sistema de Control de Acceso y Registro de Dispositivos"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Override DATABASE_URL if SQLALCHEMY_DATABASE_URL is not provided
if not settings.SQLALCHEMY_DATABASE_URL:
    settings.SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
