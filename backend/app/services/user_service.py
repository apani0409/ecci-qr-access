from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional

from app.models import User, Device
from app.models.role import UserRole
from app.core.security import hash_password, verify_password


class UserService:
    @staticmethod
    def create_user(
        db: Session, 
        email: str, 
        password: str, 
        full_name: str, 
        student_id: str,
        role: Optional[UserRole] = None
    ) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.student_id == student_id)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or student ID already registered"
            )

        # Hash password and create user
        hashed_password = hash_password(password)
        user = User(
            email=email,
            password_hash=hashed_password,
            full_name=full_name,
            student_id=student_id,
            role=role or UserRole.STUDENT
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id) -> User:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user by email and password"""
        user = UserService.get_user_by_email(db, email)

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        return user

    @staticmethod
    def enable_biometric_auth(db: Session, user_id: int, public_key: str) -> User:
        """Enable biometric authentication for user"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.biometric_enabled = True
        user.biometric_public_key = public_key
        
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def disable_biometric_auth(db: Session, user_id: int) -> User:
        """Disable biometric authentication for user"""
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.biometric_enabled = False
        user.biometric_public_key = None
        
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def authenticate_biometric(db: Session, email: str, signature: str) -> User:
        """Authenticate user using biometric signature"""
        user = UserService.get_user_by_email(db, email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.biometric_enabled or not user.biometric_public_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Biometric authentication not enabled for this user"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # In a real implementation, verify the signature using the public key
        # For now, we'll just check if signature is provided
        # You would use cryptography library to verify the signature
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid biometric signature",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
