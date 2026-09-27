"""Add production invariants for public metadata."""

from collections.abc import Sequence

from alembic import op

revision: str = "20260924_0002"
down_revision: str | None = "20260922_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_proof_events_network", "proof_events", "network IN ('preview', 'preprod')"
    )
    op.create_check_constraint(
        "ck_proof_events_request_tag", "proof_events", "length(request_tag) = 64"
    )
    op.create_check_constraint(
        "ck_composer_runs_provider", "composer_runs", "provider IN ('gemini', 'local')"
    )


def downgrade() -> None:
    op.drop_constraint("ck_composer_runs_provider", "composer_runs", type_="check")
    op.drop_constraint("ck_proof_events_request_tag", "proof_events", type_="check")
    op.drop_constraint("ck_proof_events_network", "proof_events", type_="check")
