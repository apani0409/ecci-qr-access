import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationException, ConflictException, NotFoundException
from app.models import Device
from app.services.qr_service import create_device_with_qr

logger = logging.getLogger(__name__)

# Fields a device owner is allowed to change via PUT /devices/{id}
EDITABLE_FIELDS = ("name", "device_type", "brand", "model", "photo", "serial_number")


class DeviceService:
    @staticmethod
    def create_device(db: Session, user_id: UUID, **fields) -> Device:
        """Create a new device and generate its unique QR code."""
        if DeviceService._serial_taken(db, fields["serial_number"]):
            raise ConflictException("Device with this serial number already exists")

        device = create_device_with_qr(db, user_id, **fields)
        logger.info("Device created: %s (owner=%s)", device.id, user_id)
        return device

    @staticmethod
    def get_device(db: Session, device_id: UUID) -> Device:
        device = db.get(Device, device_id)
        if not device:
            raise NotFoundException("Device")
        return device

    @staticmethod
    def get_owned_device(db: Session, device_id: UUID, user_id: UUID) -> Device:
        """Return the device only if ``user_id`` owns it."""
        device = DeviceService.get_device(db, device_id)
        if device.user_id != user_id:
            logger.warning("Ownership check failed: device=%s user=%s", device_id, user_id)
            raise AuthorizationException("Not authorized to access this device")
        return device

    @staticmethod
    def get_device_by_qr_data(db: Session, qr_data: str) -> Device:
        device = db.query(Device).filter(Device.qr_data == qr_data).first()
        if not device:
            raise NotFoundException("Device")
        return device

    @staticmethod
    def get_user_devices(db: Session, user_id: UUID) -> list[Device]:
        return (
            db.query(Device)
            .filter(Device.user_id == user_id)
            .order_by(Device.created_at.desc())
            .all()
        )

    @staticmethod
    def update_device(db: Session, device_id: UUID, user_id: UUID, changes: dict) -> Device:
        """Apply the non-null ``changes`` to a device owned by ``user_id``."""
        device = DeviceService.get_owned_device(db, device_id, user_id)

        new_serial: Optional[str] = changes.get("serial_number")
        if (
            new_serial
            and new_serial != device.serial_number
            and DeviceService._serial_taken(db, new_serial)
        ):
            raise ConflictException("Device with this serial number already exists")

        for field in EDITABLE_FIELDS:
            value = changes.get(field)
            if value is not None:
                setattr(device, field, value)

        db.commit()
        db.refresh(device)
        return device

    @staticmethod
    def delete_device(db: Session, device_id: UUID, user_id: UUID) -> None:
        device = DeviceService.get_owned_device(db, device_id, user_id)
        db.delete(device)
        db.commit()
        logger.info("Device deleted: %s", device_id)

    @staticmethod
    def _serial_taken(db: Session, serial_number: str) -> bool:
        return db.query(Device.id).filter(Device.serial_number == serial_number).first() is not None
