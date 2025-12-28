from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=3)
    student_id: str = Field(..., min_length=5)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@university.edu",
                "password": "SecurePassword123!",
                "full_name": "Juan García",
                "student_id": "2023001",
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


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    student_id: str
    is_active: bool
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
                "is_active": True,
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
