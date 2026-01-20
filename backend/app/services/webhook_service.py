"""
Webhook service for triggering external integrations
"""
import httpx
import hmac
import hashlib
import json
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.webhook import Webhook, WebhookLog, WebhookEvent

logger = logging.getLogger(__name__)


class WebhookService:
    """Service for managing and triggering webhooks"""
    
    @staticmethod
    async def trigger_event(
        db: Session,
        event: WebhookEvent,
        payload: Dict[str, Any]
    ) -> None:
        """
        Trigger all webhooks subscribed to an event
        
        Args:
            db: Database session
            event: Event type
            payload: Event data
        """
        # Get all active webhooks subscribed to this event
        webhooks = db.query(Webhook).filter(
            Webhook.is_active == True,
            Webhook.events.contains([event.value])
        ).all()
        
        logger.info(f"Triggering {len(webhooks)} webhooks for event: {event.value}")
        
        for webhook in webhooks:
            await WebhookService._send_webhook(db, webhook, event.value, payload)
    
    @staticmethod
    async def _send_webhook(
        db: Session,
        webhook: Webhook,
        event: str,
        payload: Dict[str, Any]
    ) -> None:
        """
        Send webhook HTTP request
        
        Args:
            db: Database session
            webhook: Webhook configuration
            event: Event name
            payload: Event data
        """
        # Prepare payload
        webhook_payload = {
            "event": event,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": payload
        }
        
        # Create HMAC signature
        signature = WebhookService._create_signature(
            webhook.secret,
            json.dumps(webhook_payload)
        )
        
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
        }
        
        success = False
        response_status = None
        response_body = None
        error_message = None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    webhook.url,
                    json=webhook_payload,
                    headers=headers
                )
                
                response_status = response.status_code
                response_body = response.text[:1000]  # Limit to 1000 chars
                
                if 200 <= response.status_code < 300:
                    success = True
                    webhook.failure_count = 0
                    logger.info(f"Webhook {webhook.id} triggered successfully")
                else:
                    webhook.failure_count += 1
                    error_message = f"HTTP {response.status_code}"
                    logger.warning(f"Webhook {webhook.id} failed with status {response.status_code}")
        
        except Exception as e:
            webhook.failure_count += 1
            error_message = str(e)[:500]
            logger.error(f"Webhook {webhook.id} error: {str(e)}")
        
        # Update webhook
        webhook.last_triggered_at = datetime.now(timezone.utc)
        
        # Disable webhook if too many failures
        if webhook.failure_count >= 10:
            webhook.is_active = False
            logger.warning(f"Webhook {webhook.id} disabled due to {webhook.failure_count} failures")
        
        # Log webhook execution
        log = WebhookLog(
            webhook_id=webhook.id,
            event=event,
            payload=webhook_payload,
            response_status=response_status,
            response_body=response_body,
            success=success,
            error_message=error_message
        )
        
        db.add(log)
        db.commit()
    
    @staticmethod
    def _create_signature(secret: str, payload: str) -> str:
        """
        Create HMAC signature for webhook
        
        Args:
            secret: Webhook secret
            payload: JSON payload string
            
        Returns:
            HMAC signature
        """
        return hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
    
    @staticmethod
    def verify_signature(secret: str, payload: str, signature: str) -> bool:
        """
        Verify webhook signature
        
        Args:
            secret: Webhook secret
            payload: JSON payload string
            signature: Provided signature
            
        Returns:
            True if signature is valid
        """
        expected_signature = WebhookService._create_signature(secret, payload)
        return hmac.compare_digest(expected_signature, signature)
    
    @staticmethod
    def create_webhook(
        db: Session,
        name: str,
        url: str,
        events: List[str],
        created_by: str,
        secret: str = None
    ) -> Webhook:
        """
        Create a new webhook
        
        Args:
            db: Database session
            name: Webhook name
            url: Webhook URL
            events: List of event types
            created_by: User ID who created it
            secret: Optional secret (will be generated if not provided)
            
        Returns:
            Created webhook
        """
        import secrets
        
        if not secret:
            secret = secrets.token_urlsafe(32)
        
        webhook = Webhook(
            name=name,
            url=url,
            secret=secret,
            events=events,
            created_by=created_by
        )
        
        db.add(webhook)
        db.commit()
        db.refresh(webhook)
        
        logger.info(f"Webhook created: {webhook.id} - {name}")
        
        return webhook
