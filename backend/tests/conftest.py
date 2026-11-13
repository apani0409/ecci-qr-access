"""Pytest fixtures: in-memory SQLite database and helpers to create users per role."""
import os

# Configure the app for tests *before* importing it
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["AUTO_CREATE_TABLES"] = "false"
os.environ["REDIS_URL"] = ""  # cache is optional; tests run without Redis

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.database import Base, get_db  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.models.role import UserRole  # noqa: E402
from app.models.user import User  # noqa: E402

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

PASSWORD = "Test123!@#"


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": PASSWORD,
        "full_name": "Test User",
        "student_id": "2024001",
    }


@pytest.fixture
def test_device_data():
    return {
        "name": "Test Device",
        "device_type": "laptop",
        "serial_number": "TEST-SN-12345",
    }


@pytest.fixture
def make_user(db, client):
    """Create a user with the given role directly in the DB and return auth headers."""
    counter = {"n": 0}

    def _make(role: UserRole = UserRole.STUDENT, name: str = "User") -> dict:
        counter["n"] += 1
        email = f"{role.value}{counter['n']}@example.com"
        db.add(
            User(
                email=email,
                password_hash=hash_password(PASSWORD),
                full_name=f"{name} {counter['n']}",
                student_id=f"{role.value[:3].upper()}{counter['n']:04d}",
                role=role,
            )
        )
        db.commit()
        response = client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
        assert response.status_code == 200, response.text
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    return _make


@pytest.fixture
def authenticated_client(client, test_user_data):
    """Client authenticated as a freshly registered student."""
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201, response.text
    client.headers["Authorization"] = f"Bearer {response.json()['access_token']}"
    return client
