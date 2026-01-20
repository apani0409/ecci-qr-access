from pydantic_settings import BaseSettings
from typing import Optional, List
import secrets


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ecci_control"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API
    API_TITLE: str = "ECCI Control System API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Sistema de Control de Acceso y Registro de Dispositivos"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8081,http://localhost:8082"

    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@ecci-control.com"
    SMTP_FROM_NAME: str = "ECCI Control System"
    
    # Password Reset
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:8081"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra environment variables

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        """Return DATABASE_URL for SQLAlchemy compatibility"""
        return self.DATABASE_URL

    def validate_secret_key(self) -> None:
        """Validate that SECRET_KEY is properly set in production"""
        if self.ENVIRONMENT == "production" and (
            not self.SECRET_KEY or 
            self.SECRET_KEY == "your-secret-key-change-me-in-production"
        ):
            raise ValueError(
                "SECRET_KEY must be set to a secure value in production. "
                "Generate one with: openssl rand -hex 32"
            )


settings = Settings()

# Validate configuration in production
if settings.ENVIRONMENT == "production":
    settings.validate_secret_key()
