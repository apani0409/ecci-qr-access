from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import Base


class AccessType(str, enum.Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"


class AccessRecord(Base):
    __tablename__ = "access_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    access_type = Column(Enum(AccessType), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    location = Column(String(255), nullable=True)  # Optional: location where access occurred

    __table_args__ = (
        Index("ix_access_records_device_id", "device_id"),
        Index("ix_access_records_user_id", "user_id"),
        Index("ix_access_records_timestamp", "timestamp"),
    )

    def __repr__(self):
        return f"<AccessRecord(id={self.id}, device_id={self.device_id}, type={self.access_type})>"
