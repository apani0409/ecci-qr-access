"""
Unit tests for device endpoints
"""
import pytest
from fastapi import status


class TestDeviceEndpoints:
    """Test device management endpoints"""
    
    def test_create_device_success(self, authenticated_client, test_device_data):
        """Test successful device creation"""
        response = authenticated_client.post("/api/devices/", json=test_device_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "device" in data
        assert "qr_image_base64" in data
        assert data["device"]["name"] == test_device_data["name"]
        assert data["device"]["device_type"] == test_device_data["device_type"]
    
    def test_create_device_duplicate_serial(self, authenticated_client, test_device_data):
        """Test creating device with duplicate serial number fails"""
        # Create first device
        authenticated_client.post("/api/devices/", json=test_device_data)
        
        # Try to create duplicate
        response = authenticated_client.post("/api/devices/", json=test_device_data)
        
        assert response.status_code == status.HTTP_409_CONFLICT
    
    def test_get_user_devices(self, authenticated_client, test_device_data):
        """Test getting all user devices"""
        # Create a device
        authenticated_client.post("/api/devices/", json=test_device_data)
        
        # Get devices
        response = authenticated_client.get("/api/devices/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == test_device_data["name"]
    
    def test_get_device_by_id(self, authenticated_client, test_device_data):
        """Test getting specific device by ID"""
        # Create device
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        device_id = create_response.json()["device"]["id"]
        
        # Get device
        response = authenticated_client.get(f"/api/devices/{device_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == device_id
        assert data["name"] == test_device_data["name"]
    
    def test_update_device(self, authenticated_client, test_device_data):
        """Test updating device information"""
        # Create device
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        device_id = create_response.json()["device"]["id"]
        
        # Update device
        update_data = {"name": "Updated Device Name"}
        response = authenticated_client.put(f"/api/devices/{device_id}", json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Device Name"
    
    def test_delete_device(self, authenticated_client, test_device_data):
        """Test deleting a device"""
        # Create device
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        device_id = create_response.json()["device"]["id"]
        
        # Delete device
        response = authenticated_client.delete(f"/api/devices/{device_id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        get_response = authenticated_client.get(f"/api/devices/{device_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_device_unauthorized(self, client, authenticated_client, test_device_data):
        """Test that users cannot access other users' devices"""
        # Create device with authenticated client
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        device_id = create_response.json()["device"]["id"]
        
        # Try to access without authentication
        response = client.get(f"/api/devices/{device_id}")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
