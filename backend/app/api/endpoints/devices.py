from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas import DeviceCreate, DeviceResponse, DeviceUpdate, DeviceWithQR
from app.services.device_service import DeviceService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/", response_model=DeviceWithQR, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_data: DeviceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register a device for the current user and generate its QR code."""
    device = DeviceService.create_device(db, current_user.id, **device_data.model_dump())
    return {
        "device": DeviceResponse.model_validate(device),
        "qr_image_base64": device.qr_code,
    }


@router.get("/", response_model=list[DeviceResponse])
async def get_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's devices."""
    devices = DeviceService.get_user_devices(db, current_user.id)
    return [DeviceResponse.model_validate(device) for device in devices]


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get one of the current user's devices."""
    device = DeviceService.get_owned_device(db, device_id, current_user.id)
    return DeviceResponse.model_validate(device)


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: UUID,
    device_data: DeviceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a device (only the fields sent are changed)."""
    device = DeviceService.update_device(
        db, device_id, current_user.id, device_data.model_dump(exclude_unset=True)
    )
    return DeviceResponse.model_validate(device)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a device (its access history is removed with it)."""
    DeviceService.delete_device(db, device_id, current_user.id)


@router.get("/{device_id}/qr")
async def get_device_qr(
    device_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the QR payload and PNG (base64) for a device."""
    device = DeviceService.get_owned_device(db, device_id, current_user.id)
    return {
        "device_id": str(device.id),
        "qr_data": device.qr_data,
        "qr_image_base64": device.qr_code,
    }
