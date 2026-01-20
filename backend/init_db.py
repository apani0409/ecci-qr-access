#!/usr/bin/env python
"""Initialize database with sample data."""

import sys
import os
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models import User, Device, AccessRecord
from app.core.security import hash_password
from app.services.qr_service import create_device_with_qr
from app.models.access_record import AccessType
import uuid


def init_db():
    """Initialize database and create sample data."""
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")

    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).first():
            print("✗ Database already initialized with data. Skipping...")
            return

        print("\nCreating sample users...")
        
        # Create demo users with different roles
        from app.models.role import UserRole
        
        user1 = User(
            id=uuid.uuid4(),
            email="admin@ecci.com",
            password_hash=hash_password("Admin123!"),
            full_name="Admin Usuario",
            student_id="ADMIN001",
            role=UserRole.ADMIN,
            is_active=True,
        )

        user2 = User(
            id=uuid.uuid4(),
            email="guard@ecci.com",
            password_hash=hash_password("Guard123!"),
            full_name="Guardia Seguridad",
            student_id="GUARD001",
            role=UserRole.SECURITY,
            is_active=True,
        )
        
        user3 = User(
            id=uuid.uuid4(),
            email="student@ecci.com",
            password_hash=hash_password("Student123!"),
            full_name="Estudiante Demo",
            student_id="STU001",
            role=UserRole.STUDENT,
            is_active=True,
        )

        db.add(user1)
        db.add(user2)
        db.add(user3)
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        db.refresh(user3)

        print(f"✓ Created users:")
        print(f"  - {user1.full_name} ({user1.email}) - {user1.role.value}")
        print(f"  - {user2.full_name} ({user2.email}) - {user2.role.value}")
        print(f"  - {user3.full_name} ({user3.email}) - {user3.role.value}")

        print("\nCreating sample devices...")

        # Create sample devices with QR codes
        device1 = create_device_with_qr(
            db,
            user1.id,
            "MacBook Pro",
            "laptop",
            "C02AB123DE45"
        )

        device2 = create_device_with_qr(
            db,
            user1.id,
            "iPhone 14",
            "phone",
            "DNXXXX5L2P5G"
        )

        device3 = create_device_with_qr(
            db,
            user2.id,
            "Dell XPS",
            "laptop",
            "CN0XXXXX5XXXXX"
        )

        print(f"✓ Created devices:")
        print(f"  - {device1.name} (QR: {device1.qr_data[:8]}...)")
        print(f"  - {device2.name} (QR: {device2.qr_data[:8]}...)")
        print(f"  - {device3.name} (QR: {device3.qr_data[:8]}...)")

        print("\nCreating sample access records...")

        # Create sample access records
        access1 = AccessRecord(
            id=uuid.uuid4(),
            device_id=device1.id,
            user_id=user1.id,
            access_type=AccessType.ENTRADA.value,
            timestamp=datetime.now(timezone.utc),
            location="Puerta Entrada Principal",
        )

        access2 = AccessRecord(
            id=uuid.uuid4(),
            device_id=device1.id,
            user_id=user1.id,
            access_type=AccessType.SALIDA.value,
            timestamp=datetime.now(timezone.utc),
            location="Puerta Entrada Principal",
        )

        db.add(access1)
        db.add(access2)
        db.commit()

        print(f"✓ Created access records: {access1.access_type.value}, {access2.access_type.value}")

        print("\n✓ Database initialized successfully!")
        print("\n🔐 Demo User Credentials:")
        print("  Admin:    admin@ecci.com / Admin123!")
        print("  Guard:    guard@ecci.com / Guard123!")
        print("  Student:  student@ecci.com / Student123!")

    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
