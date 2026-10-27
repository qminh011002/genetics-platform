"""Metadata nền cho Alembic; bảng identity sẽ được mở rộng ở T0201.

Migration giữ định nghĩa bảng riêng để lịch sử không đổi khi metadata thay đổi.
UUID default theo backend.md §7.6 và overview.md §6.3; không cần pgcrypto ở PG18.
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

metadata = sa.MetaData()

audit_log = sa.Table(
    "audit_log",
    metadata,
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
    sa.Index("ix_audit_log_table_record", "table_name", "record_id"),
    schema="audit",
)

app_user = sa.Table(
    "app_user",
    metadata,
    sa.Column("id", sa.UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
    # The system actor has no Entra identity; real users have a unique oid.
    sa.Column("entra_oid", sa.UUID, unique=True),
    sa.Column("email", sa.Text, nullable=False, unique=True),
    sa.Column("display_name", sa.Text, nullable=False),
    sa.Column("role_id", sa.UUID),  # FK to auth.role arrives with T0201.
    sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
    sa.Column(
        "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    ),
    schema="core",
)

idempotency_key = sa.Table(
    "idempotency_key",
    metadata,
    sa.Column("key", sa.UUID, primary_key=True),
    sa.Column(
        "user_id",
        sa.UUID,
        sa.ForeignKey("core.app_user.id", name="fk_idempotency_key_user", ondelete="RESTRICT"),
        primary_key=True,
    ),
    sa.Column("request_hash", sa.Text, nullable=False),
    sa.Column("response", JSONB, nullable=False),
    sa.Column(
        "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    ),
    sa.Index("ix_idempotency_key_created_at", "created_at"),
    sa.Index("ix_idempotency_key_user_id", "user_id"),
    schema="core",
)
