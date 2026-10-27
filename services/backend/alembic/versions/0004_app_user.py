"""Identity foundation and the stable system actor; role FK belongs to T0201."""

import sqlalchemy as sa
from alembic import op

from genetics.shared_kernel.infrastructure.migrations import attach_audit, detach_audit

revision = "0004_app_user"
down_revision = "0003_idempotency"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_user",
        sa.Column("id", sa.UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("entra_oid", sa.UUID, unique=True),
        sa.Column("email", sa.Text, nullable=False, unique=True),
        sa.Column("display_name", sa.Text, nullable=False),
        sa.Column("role_id", sa.UUID),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        schema="core",
    )
    op.create_foreign_key(
        "fk_idempotency_key_user",
        "idempotency_key",
        "app_user",
        ["user_id"],
        ["id"],
        source_schema="core",
        referent_schema="core",
        ondelete="RESTRICT",
    )
    attach_audit("app_user")
    # Keep the seed id stable for Actor.system() and restore settings so later
    # revisions in the same transaction do not inherit the seed's audit context.
    op.execute("""
        DO $$
        DECLARE
            previous_actor text := current_setting('app.user_id', true);
            previous_device text := current_setting('app.device', true);
        BEGIN
            PERFORM set_config('app.user_id', '00000000-0000-0000-0000-000000000001', true);
            PERFORM set_config('app.device', 'system', true);
            INSERT INTO core.app_user (id, email, display_name)
            VALUES ('00000000-0000-0000-0000-000000000001', 'system@genetics.invalid', 'System')
            ON CONFLICT DO NOTHING;
            PERFORM set_config('app.user_id', COALESCE(previous_actor, ''), true);
            PERFORM set_config('app.device', COALESCE(previous_device, ''), true);
        END $$
    """)


def downgrade() -> None:
    detach_audit("app_user")
    op.drop_constraint(
        "fk_idempotency_key_user", "idempotency_key", schema="core", type_="foreignkey"
    )
    op.drop_table("app_user", schema="core")
