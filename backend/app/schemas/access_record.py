from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import Optional
from enum import Enum


class AccessTypeEnum(str, Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"


class AccessRecordCreate(BaseModel):
    qr_data: str = Field(..., min_length=1, max_length=500)
    access_type: AccessTypeEnum
    location: Optional[str] = Field(None, max_length=255)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "qr_data": "550e8400-e29b-41d4-a716-446655440002",
                "access_type": "entrada",
                "location": "Puerta Entrada",
            }
        },
    )


class AccessRecordResponse(BaseModel):
    id: UUID
    device_id: UUID
    user_id: UUID
    scanned_by_id: Optional[UUID] = None
    access_type: AccessTypeEnum
    timestamp: datetime
    location: Optional[str] = None
    device_name: Optional[str] = None
    device_serial_number: Optional[str] = None
    user_name: Optional[str] = None
    scanned_by_name: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "device_id": "550e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440002",
                "access_type": "entrada",
                "timestamp": "2024-01-15T10:30:00+00:00",
                "location": "Puerta Entrada",
            }
        },
    )
