import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_render_hostname_is_automatically_trusted():
    settings = Settings(render_external_hostname="selo-vivo-api.onrender.com")

    assert "selo-vivo-api.onrender.com" in settings.effective_allowed_hosts


def test_render_style_comma_separated_environment(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@example.test/app")
    monkeypatch.setenv(
        "CORS_ORIGINS",
        "https://selo-vivo.netlify.app,https://www.example.com",
    )
    monkeypatch.setenv("ALLOWED_HOSTS", "api.example.com")
    monkeypatch.setenv("RENDER_EXTERNAL_HOSTNAME", "selo-vivo-api.onrender.com")

    settings = Settings(_env_file=None)

    assert settings.cors_origins == [
        "https://selo-vivo.netlify.app",
        "https://www.example.com",
    ]
    assert settings.effective_allowed_hosts == [
        "api.example.com",
        "selo-vivo-api.onrender.com",
    ]


def test_production_rejects_sqlite_database():
    with pytest.raises(ValidationError, match="Production requires a PostgreSQL"):
        Settings(app_env="production", database_url="sqlite+aiosqlite:///./unsafe.db")


def test_production_rejects_wildcard_cors():
    with pytest.raises(ValidationError, match="Wildcard CORS"):
        Settings(
            app_env="production",
            database_url="postgresql://user:password@example.test/app",
            cors_origins=["*"],
        )
