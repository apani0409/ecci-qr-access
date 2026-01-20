"""
Unit tests for authentication endpoints
"""
import pytest
from fastapi import status


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user_success(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert "id" in data
        assert "password" not in data
    
    def test_register_duplicate_email(self, client, test_user_data):
        """Test registering with duplicate email fails"""
        # First registration
        client.post("/api/auth/register", json=test_user_data)
        
        # Duplicate registration
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == status.HTTP_409_CONFLICT
    
    def test_login_success(self, client, test_user_data):
        """Test successful login"""
        # Register first
        client.post("/api/auth/register", json=test_user_data)
        
        # Login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password fails"""
        # Register first
        client.post("/api/auth/register", json=test_user_data)
        
        # Login with wrong password
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserEndpoints:
    """Test user-related endpoints"""
    
    def test_get_profile_authenticated(self, authenticated_client, test_user_data):
        """Test getting user profile when authenticated"""
        response = authenticated_client.get("/api/users/me")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
    
    def test_get_profile_unauthenticated(self, client):
        """Test getting profile without authentication fails"""
        response = client.get("/api/users/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
