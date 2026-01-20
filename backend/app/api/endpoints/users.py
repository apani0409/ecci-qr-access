from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.core.config import settings
from app.schemas import UserResponse, PasswordChange, PasswordResetRequest, PasswordReset, ProfileUpdate
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.services.email_service import EmailService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile (photo, name, dark mode)"""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    if profile_data.profile_photo is not None:
        current_user.profile_photo = profile_data.profile_photo
    
    if profile_data.dark_mode is not None:
        current_user.dark_mode = profile_data.dark_mode
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.post("/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )
    
    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/password/reset-request")
async def request_password_reset(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset email"""
    user = db.query(User).filter(User.email == reset_data.email).first()
    
    # Always return success to prevent email enumeration
    if user:
        # Invalidate any existing tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False
        ).update({"used": True})
        
        # Generate new reset token
        token = PasswordResetToken.generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
        )
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        
        db.add(reset_token)
        db.commit()
        
        # Send reset email
        EmailService.send_password_reset_email(
            to_email=user.email,
            reset_token=token,
            full_name=user.full_name
        )
    
    return {
        "message": "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
    }


@router.post("/password/reset")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Complete password reset with token"""
    # Find valid token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == reset_data.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )
    
    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Update password
    user.password_hash = hash_password(reset_data.new_password)
    
    # Mark token as used
    reset_token.used = True
    
    db.commit()
    
    return {"message": "Contraseña restablecida exitosamente"}


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user = Depends(get_current_user)
):
    """Get user profile (alternative endpoint)"""
    return UserResponse.model_validate(current_user)
