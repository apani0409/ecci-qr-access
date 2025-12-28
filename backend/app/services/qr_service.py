from sqlalchemy.orm import Session
from uuid import uuid4
import qrcode
import io
import base64

from app.models import Device


def generate_qr_code(qr_data: str) -> str:
    """Generate QR code image and return as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    # Encode to base64
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"


def create_device_with_qr(
    db: Session, user_id, name: str, device_type: str, serial_number: str
) -> Device:
    """Create a device and generate its QR code"""
    # Generate unique QR data (UUID)
    qr_data = str(uuid4())

    # Generate QR code image
    qr_code = generate_qr_code(qr_data)

    # Create device
    device = Device(
        user_id=user_id,
        name=name,
        device_type=device_type,
        serial_number=serial_number,
        qr_data=qr_data,
        qr_code=qr_code,
    )

    db.add(device)
    db.commit()
    db.refresh(device)

    return device
