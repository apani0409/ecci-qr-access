from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.role import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=3)
    student_id: str = Field(..., min_length=5)
    role: Optional[UserRole] = UserRole.STUDENT  # Default to student

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@university.edu",
                "password": "SecurePassword123!",
                "full_name": "Juan García",
                "student_id": "2023001",
                "role": "student"
            }
        }


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@university.edu",
                "password": "SecurePassword123!",
            }
        }


class BiometricAuthRequest(BaseModel):
    """Request for biometric authentication"""
    email: EmailStr
    biometric_signature: str  # Signed challenge from device
    device_id: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@university.edu",
                "biometric_signature": "base64_encoded_signature",
                "device_id": "device-uuid"
            }
        }


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    student_id: str
    role: UserRole
    is_active: bool
    biometric_enabled: bool
    profile_photo: Optional[str] = None
    dark_mode: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "student@university.edu",
                "full_name": "Juan García",
                "student_id": "2023001",
                "role": "student",
                "is_active": True,
                "biometric_enabled": False,
                "created_at": "2024-01-15T10:30:00+00:00",
                "updated_at": "2024-01-15T10:30:00+00:00",
            }
        }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "student@university.edu",
                    "full_name": "Juan García",
                    "student_id": "2023001",
                    "is_active": True,
                    "created_at": "2024-01-15T10:30:00+00:00",
                    "updated_at": "2024-01-15T10:30:00+00:00",
                },
            }
        }
