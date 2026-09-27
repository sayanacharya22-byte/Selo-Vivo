from app.services.privacy import minimize_public_text, safe_labels


def test_minimizer_redacts_identity_and_secret_patterns():
    minimized = minimize_public_text(
        "Contato ana@example.com CPF 123.456.789-01 secret=abcd localização -3.1190,-60.0217"
    )
    assert "ana@example.com" not in minimized.text
    assert "123.456.789-01" not in minimized.text
    assert "abcd" not in minimized.text
    assert {"email", "document", "secret", "coordinates"}.issubset(minimized.redactions)


def test_unsafe_labels_are_dropped_and_duplicates_removed():
    labels = safe_labels(["regenerativa", "regenerativa", "email@farm.example"])
    assert labels == ["regenerativa"]
