from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas import AccessRecordCreate, AccessRecordResponse
from app.services.access_service import AccessService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/access", tags=["access"])


@router.post("/scan", response_model=AccessRecordResponse, status_code=status.HTTP_201_CREATED)
async def scan_qr(
    access_data: AccessRecordCreate,
    db: Session = Depends(get_db)
):
    """Scan QR code and record access"""
    access_record = AccessService.record_access(
        db=db,
        qr_data=access_data.qr_data,
        access_type=access_data.access_type,
        location=access_data.location,
    )

    return AccessRecordResponse.model_validate(access_record)


@router.get("/history", response_model=list[AccessRecordResponse])
async def get_access_history(
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get access history for current user"""
    records = AccessService.get_user_access_history(db, current_user.id, limit)
    return [AccessRecordResponse.model_validate(record) for record in records]


@router.get("/device/{device_id}/history", response_model=list[AccessRecordResponse])
async def get_device_access_history(
    device_id: str,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get access history for specific device"""
    records = AccessService.get_device_access_history(db, device_id, current_user.id, limit)
    return [AccessRecordResponse.model_validate(record) for record in records]
