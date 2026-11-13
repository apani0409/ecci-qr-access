"""QR scanning (entrada/salida) and access history, including role rules."""
from fastapi import status

from app.models.role import UserRole


def _create_device(client, headers, data):
    response = client.post("/api/devices/", json=data, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()["device"]


def _scan(client, headers, qr_data, access_type="entrada", location=None):
    return client.post(
        "/api/access/scan",
        json={"qr_data": qr_data, "access_type": access_type, "location": location},
        headers=headers,
    )


class TestScan:
    def test_student_scans_own_device(self, authenticated_client, test_device_data):
        device = _create_device(authenticated_client, {}, test_device_data)

        response = _scan(authenticated_client, {}, device["qr_data"], "entrada", "Main Building")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["access_type"] == "entrada"
        assert data["location"] == "Main Building"
        assert data["device_id"] == device["id"]
        assert data["device_name"] == test_device_data["name"]
        assert data["timestamp"]

    def test_invalid_access_type_is_422(self, authenticated_client, test_device_data):
        device = _create_device(authenticated_client, {}, test_device_data)

        response = _scan(authenticated_client, {}, device["qr_data"], "invalid_type")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_unknown_qr_is_404(self, authenticated_client):
        response = _scan(authenticated_client, {}, "00000000-0000-0000-0000-000000000000")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_scan_requires_auth(self, client):
        response = _scan(client, {}, "anything")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_student_cannot_scan_someone_elses_device(self, client, make_user, test_device_data):
        owner, other = make_user(), make_user()
        device = _create_device(client, owner, test_device_data)

        response = _scan(client, other, device["qr_data"], "salida")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_guard_scans_student_device_and_is_recorded_as_scanner(
        self, client, make_user, test_device_data
    ):
        student = make_user(UserRole.STUDENT, "Student")
        guard = make_user(UserRole.SECURITY, "Guard")
        device = _create_device(client, student, test_device_data)

        response = _scan(client, guard, device["qr_data"], "salida", "Salida ECCI")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["user_name"].startswith("Student")  # owner of the laptop
        assert data["scanned_by_name"].startswith("Guard")  # who checked it at the door


class TestHistory:
    def test_user_history_newest_first(self, authenticated_client, test_device_data):
        device = _create_device(authenticated_client, {}, test_device_data)
        _scan(authenticated_client, {}, device["qr_data"], "entrada")
        _scan(authenticated_client, {}, device["qr_data"], "salida")

        response = authenticated_client.get("/api/access/history")

        assert response.status_code == status.HTTP_200_OK
        assert [r["access_type"] for r in response.json()] == ["salida", "entrada"]

    def test_device_history(self, authenticated_client, test_device_data):
        device = _create_device(authenticated_client, {}, test_device_data)
        _scan(authenticated_client, {}, device["qr_data"], "salida")

        response = authenticated_client.get(f"/api/access/device/{device['id']}/history")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["access_type"] == "salida"
        assert data[0]["device_serial_number"] == test_device_data["serial_number"]

    def test_history_limit_is_validated(self, authenticated_client):
        assert authenticated_client.get("/api/access/history?limit=0").status_code == 422
        assert authenticated_client.get("/api/access/history?limit=10000").status_code == 422

    def test_students_only_see_their_own_records(self, client, make_user, test_device_data):
        alice, bob = make_user(), make_user()
        a_dev = _create_device(client, alice, test_device_data)
        b_dev = _create_device(client, bob, {**test_device_data, "serial_number": "BOB-SN-0001"})
        _scan(client, alice, a_dev["qr_data"])
        _scan(client, bob, b_dev["qr_data"])

        alice_history = client.get("/api/access/history", headers=alice).json()
        assert {r["device_id"] for r in alice_history} == {a_dev["id"]}

        assert (
            client.get(f"/api/access/device/{b_dev['id']}/history", headers=alice).status_code
            == 403
        )

    def test_security_and_admin_see_all_records(self, client, make_user, test_device_data):
        alice, bob = make_user(), make_user()
        a_dev = _create_device(client, alice, test_device_data)
        b_dev = _create_device(client, bob, {**test_device_data, "serial_number": "BOB-SN-0001"})
        _scan(client, alice, a_dev["qr_data"])
        _scan(client, bob, b_dev["qr_data"])

        for role in (UserRole.SECURITY, UserRole.ADMIN):
            staff = make_user(role)
            assert len(client.get("/api/access/history", headers=staff).json()) == 2
            assert (
                client.get(f"/api/access/device/{b_dev['id']}/history", headers=staff).status_code
                == 200
            )
