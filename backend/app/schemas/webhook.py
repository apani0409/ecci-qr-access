"""
Webhook schemas for API
"""
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from uuid import UUID
from typing import List, Optional


class WebhookCreate(BaseModel):
    """Schema for creating a webhook"""
    name: str = Field(..., min_length=3, max_length=255)
    url: HttpUrl
    events: List[str] = Field(..., min_items=1)
    secret: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Access Notification",
                "url": "https://example.com/webhook",
                "events": ["access.recorded", "device.created"],
                "secret": "optional-custom-secret"
            }
        }


class WebhookUpdate(BaseModel):
    """Schema for updating a webhook"""
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    events: Optional[List[str]] = None
    is_active: Optional[bool] = None


class WebhookResponse(BaseModel):
    """Schema for webhook response"""
    id: UUID
    name: str
    url: str
    events: List[str]
    is_active: bool
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    last_triggered_at: Optional[datetime]
    failure_count: int
    
    class Config:
        from_attributes = True


class WebhookLogResponse(BaseModel):
    """Schema for webhook log response"""
    id: UUID
    webhook_id: UUID
    event: str
    success: bool
    response_status: Optional[int]
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
