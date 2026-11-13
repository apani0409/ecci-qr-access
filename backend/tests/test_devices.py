"""Device registration, QR generation and ownership rules."""
import uuid

from fastapi import status


class TestDeviceEndpoints:
    def test_create_device_success(self, authenticated_client, test_device_data):
        response = authenticated_client.post(
            "/api/devices/", json={**test_device_data, "brand": "Lenovo", "model": "ThinkPad"}
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        device = data["device"]
        assert device["name"] == test_device_data["name"]
        assert device["brand"] == "Lenovo"
        assert device["model"] == "ThinkPad"
        assert data["qr_image_base64"].startswith("data:image/png;base64,")
        uuid.UUID(device["qr_data"])  # QR payload is an opaque UUID, not the serial

    def test_create_device_duplicate_serial(self, authenticated_client, test_device_data):
        authenticated_client.post("/api/devices/", json=test_device_data)
        response = authenticated_client.post("/api/devices/", json=test_device_data)

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_get_user_devices(self, authenticated_client, test_device_data):
        authenticated_client.post("/api/devices/", json=test_device_data)
        response = authenticated_client.get("/api/devices/")

        assert response.status_code == status.HTTP_200_OK
        assert [d["name"] for d in response.json()] == [test_device_data["name"]]

    def test_get_device_by_id(self, authenticated_client, test_device_data):
        device_id = authenticated_client.post("/api/devices/", json=test_device_data).json()[
            "device"
        ]["id"]
        response = authenticated_client.get(f"/api/devices/{device_id}")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == device_id

    def test_get_device_invalid_id_is_422(self, authenticated_client):
        response = authenticated_client.get("/api/devices/not-a-uuid")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_device_missing_is_404(self, authenticated_client):
        response = authenticated_client.get(f"/api/devices/{uuid.uuid4()}")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_device_partial(self, authenticated_client, test_device_data):
        device_id = authenticated_client.post("/api/devices/", json=test_device_data).json()[
            "device"
        ]["id"]
        response = authenticated_client.put(
            f"/api/devices/{device_id}", json={"name": "Updated Device Name"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Device Name"
        assert data["serial_number"] == test_device_data["serial_number"]

    def test_update_device_serial_conflict(self, authenticated_client, test_device_data):
        authenticated_client.post("/api/devices/", json=test_device_data)
        other = authenticated_client.post(
            "/api/devices/", json={**test_device_data, "serial_number": "OTHER-SN-999"}
        ).json()["device"]["id"]

        response = authenticated_client.put(
            f"/api/devices/{other}", json={"serial_number": test_device_data["serial_number"]}
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_delete_device(self, authenticated_client, test_device_data):
        device_id = authenticated_client.post("/api/devices/", json=test_device_data).json()[
            "device"
        ]["id"]

        response = authenticated_client.delete(f"/api/devices/{device_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert (
            authenticated_client.get(f"/api/devices/{device_id}").status_code
            == status.HTTP_404_NOT_FOUND
        )

    def test_device_requires_auth(self, client):
        response = client.get("/api/devices/")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_other_student_cannot_view_update_or_delete(self, client, make_user, test_device_data):
        owner = make_user()
        intruder = make_user()
        device_id = client.post("/api/devices/", json=test_device_data, headers=owner).json()[
            "device"
        ]["id"]

        assert client.get(f"/api/devices/{device_id}", headers=intruder).status_code == 403
        assert client.get(f"/api/devices/{device_id}/qr", headers=intruder).status_code == 403
        assert (
            client.put(
                f"/api/devices/{device_id}", json={"name": "Hacked"}, headers=intruder
            ).status_code
            == 403
        )
        assert client.delete(f"/api/devices/{device_id}", headers=intruder).status_code == 403
        assert client.get("/api/devices/", headers=intruder).json() == []
