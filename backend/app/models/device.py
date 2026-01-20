from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    device_type = Column(String(50), nullable=False)  # laptop, phone, tablet, etc.
    brand = Column(String(100), nullable=True)  # HP, Dell, Apple, Samsung, etc.
    model = Column(String(100), nullable=True)  # MacBook Pro, Galaxy S21, etc.
    serial_number = Column(String(255), unique=True, nullable=False, index=True)
    photo = Column(Text, nullable=True)  # Base64 image device photo
    qr_code = Column(String(1000), nullable=True)  # URL or base64 encoded QR
    qr_data = Column(String(500), nullable=False, unique=True, index=True)  # UUID-based unique identifier
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_devices_user_id", "user_id"),
        Index("ix_devices_serial_number", "serial_number"),
        Index("ix_devices_qr_data", "qr_data"),
    )

    def __repr__(self):
        return f"<Device(id={self.id}, user_id={self.user_id}, name={self.name})>"
