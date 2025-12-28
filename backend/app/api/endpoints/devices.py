from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import DeviceCreate, DeviceResponse, DeviceWithQR, DeviceUpdate
from app.services.device_service import DeviceService
from app.services.qr_service import generate_qr_code
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/", response_model=DeviceWithQR, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_data: DeviceCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new device with QR code"""
    device = DeviceService.create_device(
        db=db,
        user_id=current_user.id,
        name=device_data.name,
        device_type=device_data.device_type,
        serial_number=device_data.serial_number,
    )

    return {
        "device": DeviceResponse.model_validate(device),
        "qr_image_base64": device.qr_code,
    }


@router.get("/", response_model=list[DeviceResponse])
async def get_devices(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all devices for current user"""
    devices = DeviceService.get_user_devices(db, current_user.id)
    return [DeviceResponse.model_validate(device) for device in devices]


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get device by ID"""
    device = DeviceService.get_device(db, device_id)

    # Verify ownership
    if device.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this device"
        )

    return DeviceResponse.model_validate(device)


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: str,
    device_data: DeviceUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update device information"""
    device = DeviceService.update_device(
        db=db,
        device_id=device_id,
        user_id=current_user.id,
        name=device_data.name,
        device_type=device_data.device_type,
        serial_number=device_data.serial_number,
    )

    return DeviceResponse.model_validate(device)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a device"""
    DeviceService.delete_device(db, device_id, current_user.id)
    return None


@router.get("/{device_id}/qr", response_model=dict)
async def get_device_qr(
    device_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get QR code for device"""
    device = DeviceService.get_device(db, device_id)

    # Verify ownership
    if device.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this device's QR"
        )

    return {
        "device_id": str(device.id),
        "qr_data": device.qr_data,
        "qr_image_base64": device.qr_code,
    }
