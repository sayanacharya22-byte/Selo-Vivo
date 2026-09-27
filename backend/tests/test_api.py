import re


async def test_health_reports_service(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "selo-vivo-api"


async def test_readiness_checks_database_and_security_headers(client):
    response = await client.get("/ready", headers={"X-Request-ID": "test-request-123"})
    assert response.status_code == 200
    assert response.json()["database"] == "reachable"
    assert response.headers["x-request-id"] == "test-request-123"
    assert response.headers["x-content-type-options"] == "nosniff"


async def test_composer_falls_back_without_exposing_credential(client):
    response = await client.post(
        "/api/v1/compose",
        json={
            "requirement": "Credencial regenerativa válida até 2027",
            "credential_labels": ["regenerativa", "bioma amplo"],
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["provider"] == "local"
    assert "segredo do titular" in body["plan"]["private_inputs"]
    assert "never" not in body["plan"]["summary"].lower()


async def test_public_proof_is_recorded_and_counted(client):
    payload = {
        "network": "preview",
        "transaction_id": "tx_123456789",
        "contract_address": "0200_contract_demo",
        "credential_class": "regenerative",
        "request_tag": "a" * 64,
        "public_scope": {"class": "regenerative", "result": "valid"},
        "valid": True,
    }
    created = await client.post("/api/v1/proofs", json=payload)
    dashboard = await client.get("/api/v1/dashboard")
    assert created.status_code == 201
    assert re.fullmatch(r"[0-9a-f-]{36}", created.json()["id"])
    assert dashboard.json()["verified_proofs"] == 1


async def test_public_proof_recording_is_idempotent(client):
    payload = {
        "network": "preview",
        "transaction_id": "tx_idempotent_123",
        "contract_address": "0200_contract_demo",
        "credential_class": "regenerative",
        "request_tag": "c" * 64,
        "public_scope": {"class": "regenerative", "result": "valid"},
        "valid": True,
    }
    first = await client.post("/api/v1/proofs", json=payload)
    replay = await client.post("/api/v1/proofs", json=payload)
    dashboard = await client.get("/api/v1/dashboard")
    assert first.status_code == 201
    assert replay.status_code == 200
    assert replay.json()["id"] == first.json()["id"]
    assert dashboard.json()["verified_proofs"] == 1


async def test_private_field_is_rejected_from_public_receipt(client):
    response = await client.post(
        "/api/v1/proofs",
        json={
            "network": "preprod",
            "transaction_id": "tx_private_123",
            "credential_class": "regenerative",
            "request_tag": "b" * 64,
            "public_scope": {"holder_id": "must-not-pass"},
            "valid": True,
        },
    )
    assert response.status_code == 422


async def test_nested_private_field_is_rejected_from_public_receipt(client):
    response = await client.post(
        "/api/v1/proofs",
        json={
            "network": "preprod",
            "transaction_id": "tx_nested_private_123",
            "credential_class": "regenerative",
            "request_tag": "d" * 64,
            "public_scope": {"metadata": {"wallet_address": "must-not-pass"}},
            "valid": True,
        },
    )
    assert response.status_code == 422
