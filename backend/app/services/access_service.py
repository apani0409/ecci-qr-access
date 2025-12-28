from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime, timezone

from app.models import AccessRecord, AccessType
from app.services.device_service import DeviceService


class AccessService:
    @staticmethod
    def record_access(db: Session, qr_data: str, access_type: str, location: str = None) -> AccessRecord:
        """Record access when QR is scanned"""
        # Get device by QR data
        device = DeviceService.get_device_by_qr_data(db, qr_data)

        # Create access record
        access_record = AccessRecord(
            device_id=device.id,
            user_id=device.user_id,
            access_type=AccessType(access_type),
            timestamp=datetime.now(timezone.utc),
            location=location,
        )

        db.add(access_record)
        db.commit()
        db.refresh(access_record)

        return access_record

    @staticmethod
    def get_device_access_history(db: Session, device_id: UUID, user_id: UUID, limit: int = 100):
        """Get access history for a device"""
        device = DeviceService.get_device(db, device_id)

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this device's access history"
            )

        return db.query(AccessRecord).filter(
            AccessRecord.device_id == device_id
        ).order_by(AccessRecord.timestamp.desc()).limit(limit).all()

    @staticmethod
    def get_user_access_history(db: Session, user_id: UUID, limit: int = 100):
        """Get all access history for a user"""
        return db.query(AccessRecord).filter(
            AccessRecord.user_id == user_id
        ).order_by(AccessRecord.timestamp.desc()).limit(limit).all()
