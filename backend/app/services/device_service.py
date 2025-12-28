from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models import Device, User
from app.services.qr_service import create_device_with_qr


class DeviceService:
    @staticmethod
    def create_device(db: Session, user_id: UUID, name: str, device_type: str, serial_number: str) -> Device:
        """Create a new device with QR code"""
        # Check if serial number already exists
        existing_device = db.query(Device).filter(Device.serial_number == serial_number).first()
        if existing_device:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device with this serial number already exists"
            )

        # Create device with QR
        device = create_device_with_qr(db, user_id, name, device_type, serial_number)
        return device

    @staticmethod
    def get_device(db: Session, device_id: UUID) -> Device:
        """Get device by ID"""
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        return device

    @staticmethod
    def get_device_by_qr_data(db: Session, qr_data: str) -> Device:
        """Get device by QR data"""
        device = db.query(Device).filter(Device.qr_data == qr_data).first()
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        return device

    @staticmethod
    def get_user_devices(db: Session, user_id: UUID):
        """Get all devices for a user"""
        return db.query(Device).filter(Device.user_id == user_id).all()

    @staticmethod
    def update_device(db: Session, device_id: UUID, user_id: UUID, name: str = None, device_type: str = None, serial_number: str = None) -> Device:
        """Update device information"""
        device = DeviceService.get_device(db, device_id)

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this device"
            )

        # Check serial number uniqueness if updating
        if serial_number and serial_number != device.serial_number:
            existing = db.query(Device).filter(Device.serial_number == serial_number).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Device with this serial number already exists"
                )
            device.serial_number = serial_number

        if name:
            device.name = name
        if device_type:
            device.device_type = device_type

        db.commit()
        db.refresh(device)
        return device

    @staticmethod
    def delete_device(db: Session, device_id: UUID, user_id: UUID) -> bool:
        """Delete a device"""
        device = DeviceService.get_device(db, device_id)

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this device"
            )

        db.delete(device)
        db.commit()
        return True
