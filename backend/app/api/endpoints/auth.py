from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, BiometricAuthRequest
from app.services.user_service import UserService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")  # Rate limit: 5 registrations per hour per IP
async def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Create user
    user = UserService.create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        student_id=user_data.student_id,
        role=user_data.role,
    )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Rate limit: 10 login attempts per minute
async def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user"""
    # Authenticate user
    user = UserService.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/biometric", response_model=TokenResponse)
@limiter.limit("10/minute")
async def biometric_login(
    request: Request,
    auth_data: BiometricAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with biometric data
    For mobile devices with fingerprint/face ID
    """
    user = UserService.authenticate_biometric(
        db=db,
        email=auth_data.email,
        biometric_signature=auth_data.biometric_signature,
        device_id=auth_data.device_id
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/biometric/enable")
async def enable_biometric(
    biometric_public_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable biometric authentication for user"""
    current_user.biometric_enabled = True
    current_user.biometric_public_key = biometric_public_key
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Biometric authentication enabled successfully"}


@router.post("/biometric/disable")
async def disable_biometric(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable biometric authentication for user"""
    current_user.biometric_enabled = False
    current_user.biometric_public_key = None
    
    db.commit()
    
    return {"message": "Biometric authentication disabled"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)
