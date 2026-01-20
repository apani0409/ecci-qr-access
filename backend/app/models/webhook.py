"""
Webhook model for external integrations
"""
from sqlalchemy import Column, String, DateTime, Boolean, Index, Enum, Integer, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import Base


class WebhookEvent(str, enum.Enum):
    """Webhook event types"""
    USER_REGISTERED = "user.registered"
    DEVICE_CREATED = "device.created"
    DEVICE_UPDATED = "device.updated"
    DEVICE_DELETED = "device.deleted"
    ACCESS_RECORDED = "access.recorded"
    ACCESS_ENTRY = "access.entry"
    ACCESS_EXIT = "access.exit"


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    secret = Column(String(255), nullable=False)  # For HMAC signing
    events = Column(JSON, nullable=False)  # List of subscribed events
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)  # User who created it
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)
    failure_count = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        Index("ix_webhooks_is_active", "is_active"),
    )

    def __repr__(self):
        return f"<Webhook(id={self.id}, name={self.name}, url={self.url})>"


class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    event = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    response_status = Column(Integer, nullable=True)
    response_body = Column(String(1000), nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_webhook_logs_webhook_id", "webhook_id"),
        Index("ix_webhook_logs_created_at", "created_at"),
    )

    def __repr__(self):
        return f"<WebhookLog(id={self.id}, webhook_id={self.webhook_id}, event={self.event}, success={self.success})>"
