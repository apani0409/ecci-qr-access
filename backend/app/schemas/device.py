from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class DeviceCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    device_type: str = Field(..., min_length=3)  # laptop, phone, tablet, etc.
    serial_number: str = Field(..., min_length=5)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "MacBook Pro",
                "device_type": "laptop",
                "serial_number": "C02AB123DE45",
            }
        }


class DeviceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    device_type: Optional[str] = None
    serial_number: Optional[str] = Field(None, min_length=5)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "MacBook Pro Updated",
                "device_type": "laptop",
            }
        }


class DeviceResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    device_type: str
    serial_number: str
    qr_data: str
    qr_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440001",
                "name": "MacBook Pro",
                "device_type": "laptop",
                "serial_number": "C02AB123DE45",
                "qr_data": "550e8400-e29b-41d4-a716-446655440002",
                "qr_code": "data:image/png;base64,...",
                "created_at": "2024-01-15T10:30:00+00:00",
                "updated_at": "2024-01-15T10:30:00+00:00",
            }
        }


class DeviceWithQR(BaseModel):
    device: DeviceResponse
    qr_image_base64: str

    class Config:
        json_schema_extra = {
            "example": {
                "device": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "user_id": "550e8400-e29b-41d4-a716-446655440001",
                    "name": "MacBook Pro",
                    "device_type": "laptop",
                    "serial_number": "C02AB123DE45",
                    "qr_data": "550e8400-e29b-41d4-a716-446655440002",
                    "qr_code": "data:image/png;base64,...",
                    "created_at": "2024-01-15T10:30:00+00:00",
                    "updated_at": "2024-01-15T10:30:00+00:00",
                },
                "qr_image_base64": "data:image/png;base64,...",
            }
        }
