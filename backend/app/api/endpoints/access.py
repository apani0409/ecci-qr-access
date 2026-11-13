from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas import AccessRecordCreate, AccessRecordResponse
from app.services.access_service import AccessService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/access", tags=["access"])

HistoryLimit = Query(100, ge=1, le=500)


@router.post("/scan", response_model=AccessRecordResponse, status_code=status.HTTP_201_CREATED)
async def scan_qr(
    access_data: AccessRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Scan a device QR and record an entry (`entrada`) or exit (`salida`)."""
    return AccessService.record_access(
        db=db,
        qr_data=access_data.qr_data,
        access_type=access_data.access_type.value,
        location=access_data.location,
        current_user=current_user,
    )


@router.get("/history", response_model=list[AccessRecordResponse])
async def get_access_history(
    limit: int = HistoryLimit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Access history: own records for students, all records for security/admin."""
    return AccessService.get_user_access_history(db, current_user, limit)


@router.get("/device/{device_id}/history", response_model=list[AccessRecordResponse])
async def get_device_access_history(
    device_id: UUID,
    limit: int = HistoryLimit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Access history for a single device."""
    return AccessService.get_device_access_history(db, device_id, current_user, limit)
