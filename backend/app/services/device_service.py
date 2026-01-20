from sqlalchemy.orm import Session
from uuid import UUID
import logging

from app.models import Device, User
from app.services.qr_service import create_device_with_qr
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    AuthorizationException,
)

logger = logging.getLogger(__name__)


class DeviceService:
    @staticmethod
    def create_device(
        db: Session, 
        user_id: UUID, 
        name: str, 
        device_type: str, 
        serial_number: str
    ) -> Device:
        """Create a new device with QR code"""
        logger.info(f"Creating device for user {user_id}: {name}")
        
        # Check if serial number already exists
        existing_device = db.query(Device).filter(
            Device.serial_number == serial_number
        ).first()
        
        if existing_device:
            logger.warning(f"Device creation failed: Serial number {serial_number} already exists")
            raise ConflictException(
                "Device with this serial number already exists"
            )

        try:
            # Create device with QR
            device = create_device_with_qr(db, user_id, name, device_type, serial_number)
            logger.info(f"Device created successfully: {device.id}")
            return device
        except Exception as e:
            logger.error(f"Failed to create device: {str(e)}")
            raise

    @staticmethod
    def get_device(db: Session, device_id: UUID) -> Device:
        """Get device by ID"""
        device = db.query(Device).filter(Device.id == device_id).first()
        
        if not device:
            logger.warning(f"Device not found: {device_id}")
            raise NotFoundException("Device")
        
        return device

    @staticmethod
    def get_device_by_qr_data(db: Session, qr_data: str) -> Device:
        """Get device by QR data"""
        device = db.query(Device).filter(Device.qr_data == qr_data).first()
        
        if not device:
            logger.warning(f"Device not found by QR data")
            raise NotFoundException("Device")
        
        return device

    @staticmethod
    def get_user_devices(db: Session, user_id: UUID):
        """Get all devices for a user"""
        logger.info(f"Fetching devices for user: {user_id}")
        devices = db.query(Device).filter(Device.user_id == user_id).all()
        logger.info(f"Found {len(devices)} devices for user {user_id}")
        return devices

    @staticmethod
    def update_device(
        db: Session, 
        device_id: UUID, 
        user_id: UUID, 
        name: str = None, 
        device_type: str = None, 
        serial_number: str = None
    ) -> Device:
        """Update device information"""
        logger.info(f"Updating device {device_id} for user {user_id}")
        
        device = DeviceService.get_device(db, device_id)

        # Verify ownership
        if device.user_id != user_id:
            logger.warning(f"Unauthorized device update attempt: {device_id} by user {user_id}")
            raise AuthorizationException(
                "Not authorized to update this device"
            )

        # Check serial number uniqueness if updating
        if serial_number and serial_number != device.serial_number:
            existing = db.query(Device).filter(
                Device.serial_number == serial_number
            ).first()
            
            if existing:
                logger.warning(f"Device update failed: Serial number {serial_number} already exists")
                raise ConflictException(
                    "Device with this serial number already exists"
                )
            device.serial_number = serial_number

        if name:
            device.name = name
        if device_type:
            device.device_type = device_type

        try:
            db.commit()
            db.refresh(device)
            logger.info(f"Device updated successfully: {device_id}")
            return device
        except Exception as e:
            logger.error(f"Failed to update device: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def delete_device(db: Session, device_id: UUID, user_id: UUID) -> bool:
        """Delete a device"""
        logger.info(f"Deleting device {device_id} for user {user_id}")
        
        device = DeviceService.get_device(db, device_id)

        # Verify ownership
        if device.user_id != user_id:
            logger.warning(f"Unauthorized device deletion attempt: {device_id} by user {user_id}")
            raise AuthorizationException(
                "Not authorized to delete this device"
            )

        try:
            db.delete(device)
            db.commit()
            logger.info(f"Device deleted successfully: {device_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete device: {str(e)}")
            db.rollback()
            raise
