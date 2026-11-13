from datetime import timedelta

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import create_access_token
from app.models.role import UserRole
from app.models.user import User
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.user_service import UserService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


def _token_response(user: User) -> dict:
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new student account.

    Public sign-up always creates a STUDENT. Security and admin accounts are
    created by an administrator (see ``seed_users.py``), never self-assigned.
    """
    user = UserService.create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        student_id=user_data.student_id,
        role=UserRole.STUDENT,
    )
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """Log in with email and password."""
    user = UserService.authenticate_user(
        db=db, email=credentials.email, password=credentials.password
    )
    return _token_response(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)
