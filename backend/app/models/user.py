from sqlalchemy import Column, String, DateTime, Boolean, Index, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.core.database import Base
from app.models.role import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    student_id = Column(String(20), unique=True, nullable=False, index=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    biometric_enabled = Column(Boolean, default=False, nullable=False)
    biometric_public_key = Column(String(500), nullable=True)  # For biometric auth
    profile_photo = Column(Text, nullable=True)  # Base64 image
    dark_mode = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_student_id", "student_id"),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, student_id={self.student_id})>"
