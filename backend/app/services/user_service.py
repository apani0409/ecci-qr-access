from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import User, Device
from app.core.security import hash_password, verify_password


class UserService:
    @staticmethod
    def create_user(db: Session, email: str, password: str, full_name: str, student_id: str) -> User:
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
