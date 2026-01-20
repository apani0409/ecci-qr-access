"""
Webhook management endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.authorization import require_admin
from app.models.webhook import Webhook, WebhookLog
from app.models.user import User
from app.schemas.webhook import (
    WebhookCreate,
    WebhookResponse,
    WebhookUpdate,
    WebhookLogResponse
)
from app.services.webhook_service import WebhookService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    webhook_data: WebhookCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new webhook (Admin only)"""
    webhook = WebhookService.create_webhook(
        db=db,
        name=webhook_data.name,
        url=webhook_data.url,
        events=webhook_data.events,
        created_by=str(current_user.id),
        secret=webhook_data.secret
    )
    
    return WebhookResponse.model_validate(webhook)


@router.get("/", response_model=List[WebhookResponse])
async def list_webhooks(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all webhooks (Admin only)"""
    webhooks = db.query(Webhook).all()
    return [WebhookResponse.model_validate(w) for w in webhooks]


@router.get("/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(
    webhook_id: UUID,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get webhook details (Admin only)"""
    from app.core.exceptions import NotFoundException
    
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise NotFoundException("Webhook")
    
    return WebhookResponse.model_validate(webhook)


@router.put("/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(
    webhook_id: UUID,
    webhook_data: WebhookUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update webhook (Admin only)"""
    from app.core.exceptions import NotFoundException
    
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise NotFoundException("Webhook")
    
    if webhook_data.name is not None:
        webhook.name = webhook_data.name
    if webhook_data.url is not None:
        webhook.url = webhook_data.url
    if webhook_data.events is not None:
        webhook.events = webhook_data.events
    if webhook_data.is_active is not None:
        webhook.is_active = webhook_data.is_active
    
    db.commit()
    db.refresh(webhook)
    
    return WebhookResponse.model_validate(webhook)


@router.delete("/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    webhook_id: UUID,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete webhook (Admin only)"""
    from app.core.exceptions import NotFoundException
    
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise NotFoundException("Webhook")
    
    db.delete(webhook)
    db.commit()
    
    return None


@router.get("/{webhook_id}/logs", response_model=List[WebhookLogResponse])
async def get_webhook_logs(
    webhook_id: UUID,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get webhook execution logs (Admin only)"""
    logs = db.query(WebhookLog).filter(
        WebhookLog.webhook_id == webhook_id
    ).order_by(WebhookLog.created_at.desc()).limit(limit).all()
    
    return [WebhookLogResponse.model_validate(log) for log in logs]
