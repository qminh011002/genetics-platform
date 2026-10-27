"""Audit storage and the versioned change-capture function."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

from genetics.shared_kernel.infrastructure.audit_v1 import log_change

revision = "0002_audit"
down_revision = "0001_schemas"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger, sa.Identity(), primary_key=True),
        sa.Column("table_name", sa.Text, nullable=False),
        sa.Column("record_id", sa.UUID, nullable=False),
        sa.Column("action", sa.String(1), nullable=False),
        sa.Column("actor_id", sa.UUID),
        sa.Column("device", sa.Text),
        sa.Column("reason", sa.Text),
        sa.Column("request_id", sa.Text),
        sa.Column("old_data", JSONB),
        sa.Column("new_data", JSONB),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("action IN ('I', 'U', 'D')", name="ck_audit_log_action"),
        schema="audit",
    )
    op.create_index(
        "ix_audit_log_table_record", "audit_log", ["table_name", "record_id"], schema="audit"
    )
    op.create_entity(log_change)


def downgrade() -> None:
    op.drop_entity(log_change)
    op.drop_table("audit_log", schema="audit")
