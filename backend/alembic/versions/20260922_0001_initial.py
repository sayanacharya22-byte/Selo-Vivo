"""Create the privacy-safe public metadata schema."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260922_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "issuers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("commitment", sa.String(length=64), nullable=False),
        sa.Column("credential_class", sa.String(length=64), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("commitment"),
    )
    op.create_table(
        "proof_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("network", sa.String(length=16), nullable=False),
        sa.Column("transaction_id", sa.String(length=128), nullable=False),
        sa.Column("contract_address", sa.String(length=128), nullable=True),
        sa.Column("credential_class", sa.String(length=64), nullable=False),
        sa.Column("request_tag", sa.String(length=64), nullable=False),
        sa.Column("public_scope", sa.JSON(), nullable=False),
        sa.Column("valid", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("transaction_id"),
    )
    op.create_index("ix_proof_events_created_at", "proof_events", ["created_at"])
    op.create_index("ix_proof_events_network", "proof_events", ["network"])
    op.create_table(
        "composer_runs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("requirement_hash", sa.String(length=64), nullable=False),
        sa.Column("credential_labels", sa.JSON(), nullable=False),
        sa.Column("plan", sa.JSON(), nullable=False),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("model", sa.String(length=80), nullable=True),
        sa.Column("safety_note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_composer_runs_created_at", "composer_runs", ["created_at"])
    op.create_table(
        "public_metrics",
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )

    issuer_id = "e8fcb3db-4a9d-46aa-9e6f-343e8d5ebd41"
    issuer_root = "7be6f4a97cb7a68458b455bb8a4d60980bbf2f21b15da50ca4f3658cb6bba3ce"
    op.execute(
        sa.text(
            "INSERT INTO issuers (id, name, commitment, credential_class, active, created_at) "
            "VALUES (:id, :name, :commitment, :credential_class, true, CURRENT_TIMESTAMP)"
        ).bindparams(
            id=issuer_id,
            name="Instituto Raiz",
            commitment=issuer_root,
            credential_class="regenerative",
        )
    )


def downgrade() -> None:
    op.drop_table("public_metrics")
    op.drop_index("ix_composer_runs_created_at", table_name="composer_runs")
    op.drop_table("composer_runs")
    op.drop_index("ix_proof_events_network", table_name="proof_events")
    op.drop_index("ix_proof_events_created_at", table_name="proof_events")
    op.drop_table("proof_events")
    op.drop_table("issuers")
