"""Authentication and user profile endpoints."""
from fastapi import status

from app.core.security import create_access_token


class TestAuthentication:
    def test_register_user_success(self, client, test_user_data):
        response = client.post("/api/auth/register", json=test_user_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["token_type"] == "bearer"
        assert data["access_token"]
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["role"] == "student"
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]

    def test_register_cannot_self_assign_admin_role(self, client, test_user_data):
        """Public sign-up must ignore any attempt to pick a privileged role."""
        response = client.post("/api/auth/register", json={**test_user_data, "role": "admin"})

        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["user"]["role"] == "student"

    def test_register_duplicate_email(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/register", json={**test_user_data, "student_id": "2024999"}
        )

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_register_duplicate_student_id(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/register", json={**test_user_data, "email": "other@example.com"}
        )

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_register_rejects_short_password(self, client, test_user_data):
        response = client.post("/api/auth/register", json={**test_user_data, "password": "short"})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_success(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/login",
            json={"email": test_user_data["email"], "password": test_user_data["password"]},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/login", json={"email": test_user_data["email"], "password": "wrongpassword"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/auth/login", json={"email": "nonexistent@example.com", "password": "password123"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserEndpoints:
    def test_get_profile_authenticated(self, authenticated_client, test_user_data):
        response = authenticated_client.get("/api/users/me")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == test_user_data["email"]

    def test_get_profile_unauthenticated(self, client):
        response = client.get("/api/users/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_token_rejected(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_with_malformed_subject_rejected(self, client):
        token = create_access_token({"sub": "not-a-uuid"})
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_change_password(self, authenticated_client, test_user_data):
        response = authenticated_client.post(
            "/api/users/me/password",
            json={"current_password": test_user_data["password"], "new_password": "NewPass123!"},
        )
        assert response.status_code == status.HTTP_200_OK

        login = authenticated_client.post(
            "/api/auth/login", json={"email": test_user_data["email"], "password": "NewPass123!"}
        )
        assert login.status_code == status.HTTP_200_OK


class TestHealth:
    def test_health_reports_database_ok(self, client):
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["status"] == "healthy"
        assert body["checks"]["database"] == "ok"
        assert body["checks"]["cache"] == "unavailable"
