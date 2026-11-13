#!/usr/bin/env python3
"""
Seed demo users for testing ECCI Control System
Creates one user of each role: admin, security (guard), and student
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.models.role import UserRole

# User credentials for testing
DEMO_USERS = [
    {
        "email": "admin@ecci.com",
        "password": "Admin123!",
        "full_name": "Admin Demo",
        "student_id": "ADMIN001",
        "role": UserRole.ADMIN,
    },
    {
        "email": "guard@ecci.com",
        "password": "Guard123!",
        "full_name": "Security Guard Demo",
        "student_id": "SEC001",
        "role": UserRole.SECURITY,
    },
    {
        "email": "student@ecci.com",
        "password": "Student123!",
        "full_name": "Student Demo",
        "student_id": "STU001",
        "role": UserRole.STUDENT,
    },
]


def seed_users():
    """Create demo users if they don't exist"""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding demo users...")

        for user_data in DEMO_USERS:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()

            if existing:
                print(f"  ⏭️  User {user_data['email']} already exists, skipping...")
                continue

            # Create new user
            new_user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                student_id=user_data["student_id"],
                role=user_data["role"],
                is_active=True,
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            print(f"  Created {user_data['role'].value}: {user_data['email']}")

        print("\nDemo Users Summary:")
        print("=" * 60)
        for user_data in DEMO_USERS:
            print(f"  Role: {user_data['role'].value.upper()}")
            print(f"  Email: {user_data['email']}")
            print(f"  Password: {user_data['password']}")
            print(f"  Name: {user_data['full_name']}")
            print("-" * 60)

        print("\nSeeding completed successfully!")

    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
