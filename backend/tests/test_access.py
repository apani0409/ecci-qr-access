"""
Unit tests for access record endpoints
"""
import pytest
from fastapi import status


class TestAccessEndpoints:
    """Test access recording and history endpoints"""
    
    def test_record_access_success(self, authenticated_client, test_device_data):
        """Test successful access recording"""
        # Create device first
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        qr_data = create_response.json()["device"]["qr_data"]
        
        # Record access
        access_data = {
            "qr_data": qr_data,
            "access_type": "entrada",
            "location": "Main Building"
        }
        response = authenticated_client.post("/api/access/record", json=access_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["access_type"] == "entrada"
        assert data["location"] == "Main Building"
    
    def test_record_access_invalid_type(self, authenticated_client, test_device_data):
        """Test recording access with invalid type fails"""
        # Create device first
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        qr_data = create_response.json()["device"]["qr_data"]
        
        # Record access with invalid type
        access_data = {
            "qr_data": qr_data,
            "access_type": "invalid_type"
        }
        response = authenticated_client.post("/api/access/record", json=access_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_get_user_access_history(self, authenticated_client, test_device_data):
        """Test getting user access history"""
        # Create device and record access
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        qr_data = create_response.json()["device"]["qr_data"]
        
        access_data = {
            "qr_data": qr_data,
            "access_type": "entrada"
        }
        authenticated_client.post("/api/access/record", json=access_data)
        
        # Get history
        response = authenticated_client.get("/api/access/history")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0
        assert data[0]["access_type"] == "entrada"
    
    def test_get_device_access_history(self, authenticated_client, test_device_data):
        """Test getting device-specific access history"""
        # Create device and record access
        create_response = authenticated_client.post("/api/devices/", json=test_device_data)
        device_id = create_response.json()["device"]["id"]
        qr_data = create_response.json()["device"]["qr_data"]
        
        access_data = {
            "qr_data": qr_data,
            "access_type": "salida"
        }
        authenticated_client.post("/api/access/record", json=access_data)
        
        # Get device history
        response = authenticated_client.get(f"/api/access/device/{device_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0
        assert data[0]["access_type"] == "salida"
