from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "Selo Vivo API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite+aiosqlite:///./selo-vivo.db"
    database_url_unpooled: str | None = None
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.8-flash"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )
    allowed_hosts: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["localhost", "127.0.0.1", "test"]
    )
    render_external_hostname: str | None = None

    model_config = SettingsConfigDict(
        env_file=(ROOT_DIR / ".env", Path.cwd() / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("allowed_hosts", mode="before")
    @classmethod
    def parse_hosts(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        if self.is_production:
            if self.database_url.startswith("sqlite+"):
                raise ValueError("Production requires a PostgreSQL DATABASE_URL.")
            if "*" in self.cors_origins:
                raise ValueError("Wildcard CORS is not allowed in production.")
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def effective_allowed_hosts(self) -> list[str]:
        hosts = list(self.allowed_hosts)
        if self.render_external_hostname and self.render_external_hostname not in hosts:
            hosts.append(self.render_external_hostname)
        return hosts


@lru_cache
def get_settings() -> Settings:
    return Settings()
