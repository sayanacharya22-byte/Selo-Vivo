import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, CheckConstraint, DateTime, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class Issuer(Base):
    __tablename__ = "issuers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    commitment: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    credential_class: Mapped[str] = mapped_column(String(64), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ProofEvent(Base):
    __tablename__ = "proof_events"
    __table_args__ = (
        Index("ix_proof_events_created_at", "created_at"),
        Index("ix_proof_events_network", "network"),
        CheckConstraint("network IN ('preview', 'preprod')", name="ck_proof_events_network"),
        CheckConstraint("length(request_tag) = 64", name="ck_proof_events_request_tag"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    network: Mapped[str] = mapped_column(String(16), nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    contract_address: Mapped[str | None] = mapped_column(String(128))
    credential_class: Mapped[str] = mapped_column(String(64), nullable=False)
    request_tag: Mapped[str] = mapped_column(String(64), nullable=False)
    public_scope: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    valid: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ComposerRun(Base):
    __tablename__ = "composer_runs"
    __table_args__ = (
        Index("ix_composer_runs_created_at", "created_at"),
        CheckConstraint("provider IN ('gemini', 'local')", name="ck_composer_runs_provider"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    requirement_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    credential_labels: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    plan: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    model: Mapped[str | None] = mapped_column(String(80))
    safety_note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class PublicMetric(Base):
    __tablename__ = "public_metrics"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
