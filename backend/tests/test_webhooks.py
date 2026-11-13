"""Webhook management is admin-only."""
from app.models.role import UserRole
from app.services.webhook_service import WebhookService

WEBHOOK = {"name": "Access log", "url": "https://example.com/hook", "events": ["access.recorded"]}


def test_admin_can_create_and_list_webhooks(client, make_user):
    admin = make_user(UserRole.ADMIN)

    created = client.post("/api/webhooks/", json=WEBHOOK, headers=admin)
    assert created.status_code == 201, created.text
    assert created.json()["url"] == "https://example.com/hook"

    listed = client.get("/api/webhooks/", headers=admin).json()
    assert [w["name"] for w in listed] == ["Access log"]


def test_non_admins_cannot_manage_webhooks(client, make_user):
    for role in (UserRole.STUDENT, UserRole.SECURITY):
        headers = make_user(role)
        assert client.post("/api/webhooks/", json=WEBHOOK, headers=headers).status_code == 403
        assert client.get("/api/webhooks/", headers=headers).status_code == 403


def test_signature_roundtrip():
    signature = WebhookService._create_signature("secret", '{"a": 1}')
    assert WebhookService.verify_signature("secret", '{"a": 1}', signature)
    assert not WebhookService.verify_signature("other", '{"a": 1}', signature)
