from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
import logging

from app.models import AccessRecord, AccessType, Device, User
from app.services.device_service import DeviceService
from app.core.exceptions import ValidationException, AuthorizationException

logger = logging.getLogger(__name__)


class AccessService:
    @staticmethod
    def record_access(
        db: Session,
        qr_data: str,
        access_type: str,
        location: str,
        current_user,
    ) -> AccessRecord:
        """Record access when QR is scanned"""
        logger.info(
            "Recording access: type=%s, location=%s, scanned_by=%s",
            access_type,
            location,
            getattr(current_user, "id", None),
        )

        # Get device by QR data
        device = DeviceService.get_device_by_qr_data(db, qr_data)

        # If scanner is a student, only allow their own devices
        if getattr(current_user, "role", None) == "student" and device.user_id != current_user.id:
            logger.warning(
                "Unauthorized scan attempt by student: device=%s user=%s",
                device.id,
                current_user.id,
            )
            raise AuthorizationException("No autorizado para registrar este dispositivo")

        # Normalize access type to match enum values
        raw_type = getattr(access_type, "value", access_type)
        normalized_type = str(raw_type or "").strip().lower()

        # Validate and convert to AccessType enum
        try:
            access_type_enum = AccessType(normalized_type)
        except ValueError:
            logger.warning(f"Invalid access type received: {access_type}")
            raise ValidationException(
                f"Invalid access type '{access_type}'; expected 'entrada' or 'salida'"
            )

        try:
            access_record = AccessRecord(
                device_id=device.id,
                user_id=device.user_id,
                scanned_by_id=current_user.id if current_user else None,
                access_type=access_type_enum,
                timestamp=datetime.now(timezone.utc),
                location=location,
            )

            db.add(access_record)
            db.commit()
            db.refresh(access_record)

            logger.info(
                "Access recorded successfully: device=%s, type=%s, owner=%s, scanned_by=%s",
                device.id,
                access_type_enum.value,
                device.user_id,
                getattr(current_user, "id", None),
            )

            return access_record
        except Exception as e:
            logger.error(f"Failed to record access: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def get_device_access_history(
        db: Session,
        device_id: UUID,
        current_user,
        limit: int = 100,
    ):
        """Get access history for a device"""
        logger.info(f"Fetching access history for device {device_id}")

        device = DeviceService.get_device(db, device_id)

        # Verify ownership unless security/admin
        role = getattr(current_user, "role", None)
        if role not in ("security", "admin") and device.user_id != current_user.id:
            logger.warning(
                "Unauthorized access history request: device=%s, user=%s",
                device_id,
                current_user.id,
            )
            raise AuthorizationException(
                "Not authorized to view this device's access history"
            )

        records = (
            db.query(AccessRecord)
            .filter(AccessRecord.device_id == device_id)
            .order_by(AccessRecord.timestamp.desc())
            .limit(limit)
            .all()
        )

        logger.info(f"Found {len(records)} access records for device {device_id}")
        return [AccessService._serialize_access_record(db, r) for r in records]

    @staticmethod
    def get_user_access_history(db: Session, current_user, limit: int = 100):
        """Get access history for a user or all if security/admin"""
        logger.info(f"Fetching access history for user {current_user.id}")

        role = getattr(current_user, "role", None)
        query = db.query(AccessRecord)

        if role in ("security", "admin"):
            # Security/admin see all records
            records = query.order_by(AccessRecord.timestamp.desc()).limit(limit).all()
        else:
            records = (
                query.filter(AccessRecord.user_id == current_user.id)
                .order_by(AccessRecord.timestamp.desc())
                .limit(limit)
                .all()
            )

        logger.info(f"Found {len(records)} access records for user {current_user.id} (role={role})")
        return [AccessService._serialize_access_record(db, r) for r in records]

    @staticmethod
    def _serialize_access_record(db: Session, record: AccessRecord):
        device = db.query(Device).get(record.device_id) if record.device_id else None
        owner = db.query(User).get(record.user_id) if record.user_id else None
        scanner = db.query(User).get(record.scanned_by_id) if record.scanned_by_id else None

        return {
            "id": record.id,
            "device_id": record.device_id,
            "user_id": record.user_id,
            "scanned_by_id": record.scanned_by_id,
            "access_type": getattr(record.access_type, "value", record.access_type),
            "timestamp": record.timestamp,
            "location": record.location,
            "device_name": getattr(device, "name", None),
            "device_serial_number": getattr(device, "serial_number", None),
            "user_name": getattr(owner, "full_name", None),
            "scanned_by_name": getattr(scanner, "full_name", None),
        }
