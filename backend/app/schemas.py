from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class IssuerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    commitment: str
    credential_class: str
    active: bool


class ProofEventCreate(BaseModel):
    network: Literal["preview", "preprod"]
    transaction_id: str = Field(min_length=8, max_length=128)
    contract_address: str | None = Field(default=None, max_length=128)
    credential_class: str = Field(min_length=2, max_length=64)
    request_tag: str = Field(pattern=r"^[0-9a-fA-F]{64}$")
    public_scope: dict[str, Any] = Field(default_factory=dict)
    valid: bool

    @field_validator("public_scope")
    @classmethod
    def public_scope_has_no_private_fields(cls, value: dict[str, Any]) -> dict[str, Any]:
        forbidden = {"secret", "holder_id", "document", "exact_location", "wallet_address"}
        keys: set[str] = set()

        def collect(item: Any) -> None:
            if isinstance(item, dict):
                for key, nested in item.items():
                    keys.add(str(key).lower())
                    collect(nested)
            elif isinstance(item, list):
                for nested in item:
                    collect(nested)

        collect(value)
        overlap = forbidden.intersection(keys)
        if overlap:
            raise ValueError(f"private fields are forbidden in public_scope: {sorted(overlap)}")
        if len(str(value)) > 2000:
            raise ValueError("public_scope is too large")
        return value


class ProofEventRead(ProofEventCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class DashboardRead(BaseModel):
    verified_proofs: int
    active_issuers: int
    composer_runs: int
    disclosure_reduction_percent: int = 64
    recent_proofs: list[ProofEventRead]
    issuers: list[IssuerRead]
