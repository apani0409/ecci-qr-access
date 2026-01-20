from pydantic import BaseModel, Field
from typing import Optional


class PasswordChange(BaseModel):
    """Request to change password"""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "OldPassword123!",
                "new_password": "NewPassword123!"
            }
        }


class PasswordResetRequest(BaseModel):
    """Request to reset password via email"""
    email: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class PasswordReset(BaseModel):
    """Complete password reset with token"""
    token: str
    new_password: str = Field(..., min_length=8)
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "reset-token-here",
                "new_password": "NewPassword123!"
            }
        }


class ProfileUpdate(BaseModel):
    """Update user profile"""
    full_name: Optional[str] = Field(None, min_length=3)
    profile_photo: Optional[str] = None  # base64 or URL
    dark_mode: Optional[bool] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe Updated",
                "profile_photo": "data:image/png;base64,...",
                "dark_mode": True
            }
        }
