import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session, aliased

from app.core.authorization import can_view_all_access
from app.core.exceptions import AuthorizationException
from app.models import AccessRecord, AccessType, Device, User
from app.services.device_service import DeviceService

logger = logging.getLogger(__name__)


class AccessService:
    @staticmethod
    def record_access(
        db: Session,
        qr_data: str,
        access_type: str,
        location: Optional[str],
        current_user: User,
    ) -> dict:
        """Record an entry/exit when a device QR is scanned.

        Security and admin users may scan any device (the guard at the door).
        Students may only register their own devices.
        """
        device = DeviceService.get_device_by_qr_data(db, qr_data)

        if not can_view_all_access(current_user) and device.user_id != current_user.id:
            logger.warning("Student %s tried to scan device %s", current_user.id, device.id)
            raise AuthorizationException("No autorizado para registrar este dispositivo")

        record = AccessRecord(
            device_id=device.id,
            user_id=device.user_id,
            scanned_by_id=current_user.id,
            access_type=AccessType(access_type),
            timestamp=datetime.now(timezone.utc),
            location=location,
        )
        db.add(record)
        db.commit()

        logger.info(
            "Access recorded: device=%s type=%s scanned_by=%s",
            device.id,
            record.access_type.value,
            current_user.id,
        )
        return AccessService._history_query(db).filter(AccessRecord.id == record.id).one()._asdict()

    @staticmethod
    def get_device_access_history(
        db: Session, device_id: UUID, current_user: User, limit: int = 100
    ):
        """History for one device: owner, security and admin only."""
        device = DeviceService.get_device(db, device_id)
        if not can_view_all_access(current_user) and device.user_id != current_user.id:
            raise AuthorizationException("Not authorized to view this device's access history")

        rows = (
            AccessService._history_query(db)
            .filter(AccessRecord.device_id == device_id)
            .order_by(AccessRecord.timestamp.desc())
            .limit(limit)
            .all()
        )
        return [row._asdict() for row in rows]

    @staticmethod
    def get_user_access_history(db: Session, current_user: User, limit: int = 100):
        """Students see their own records; security/admin see every record."""
        query = AccessService._history_query(db)
        if not can_view_all_access(current_user):
            query = query.filter(AccessRecord.user_id == current_user.id)
        rows = query.order_by(AccessRecord.timestamp.desc()).limit(limit).all()
        return [row._asdict() for row in rows]

    @staticmethod
    def _history_query(db: Session):
        """Access records joined with device, owner and scanner names (one query, no N+1)."""
        owner = aliased(User)
        scanner = aliased(User)
        return (
            db.query(
                AccessRecord.id,
                AccessRecord.device_id,
                AccessRecord.user_id,
                AccessRecord.scanned_by_id,
                AccessRecord.access_type,
                AccessRecord.timestamp,
                AccessRecord.location,
                Device.name.label("device_name"),
                Device.serial_number.label("device_serial_number"),
                owner.full_name.label("user_name"),
                scanner.full_name.label("scanned_by_name"),
            )
            .outerjoin(Device, Device.id == AccessRecord.device_id)
            .outerjoin(owner, owner.id == AccessRecord.user_id)
            .outerjoin(scanner, scanner.id == AccessRecord.scanned_by_id)
        )
