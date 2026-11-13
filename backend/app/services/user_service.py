from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException
from app.core.security import hash_password, verify_password
from app.models import User
from app.models.role import UserRole


class UserService:
    @staticmethod
    def create_user(
        db: Session,
        email: str,
        password: str,
        full_name: str,
        student_id: str,
        role: Optional[UserRole] = None,
    ) -> User:
        """Create a new user (email and student ID must be unique)."""
        existing_user = (
            db.query(User).filter((User.email == email) | (User.student_id == student_id)).first()
        )
        if existing_user:
            raise ConflictException("Email or student ID already registered")

        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            student_id=student_id,
            role=role or UserRole.STUDENT,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user by email and password."""
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
                detail="User account is inactive",
            )

        return user
