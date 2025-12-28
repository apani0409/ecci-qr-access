from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import UserResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user = Depends(get_current_user)
):
    """Get user profile (alternative endpoint)"""
    return UserResponse.model_validate(current_user)
