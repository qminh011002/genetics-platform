"""Persist replay responses scoped by key and user (api-standards §9)."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0003_idempotency"
down_revision = "0002_audit"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "idempotency_key",
        sa.Column("key", sa.UUID, primary_key=True),
        sa.Column("user_id", sa.UUID, primary_key=True),
        sa.Column("request_hash", sa.Text, nullable=False),
        sa.Column("response", JSONB, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        schema="core",
    )
    op.create_index(
        "ix_idempotency_key_created_at", "idempotency_key", ["created_at"], schema="core"
    )
    op.create_index("ix_idempotency_key_user_id", "idempotency_key", ["user_id"], schema="core")


def downgrade() -> None:
    op.drop_table("idempotency_key", schema="core")
