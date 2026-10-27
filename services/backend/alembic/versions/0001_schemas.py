"""Create application schemas and scoped privileges.

Roles/passwords are provisioned by infra/postgres/init, not by migrations.
PostgreSQL 18 supplies gen_random_uuid() without the pgcrypto extension.
"""

from alembic import op

revision = "0001_schemas"
down_revision = None
branch_labels = None
depends_on = None

SCHEMAS = ("core", "auth", "audit", "analytics")


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            IF current_user <> 'app_migrator' THEN
                RAISE EXCEPTION 'Migrations must run as app_migrator';
            END IF;
        END $$
    """)
    for schema in SCHEMAS:
        op.execute(f'CREATE SCHEMA "{schema}" AUTHORIZATION app_migrator')
        op.execute(f'REVOKE ALL ON SCHEMA "{schema}" FROM PUBLIC')

    # Infra bootstraps broad global defaults. Per-schema REVOKE cannot override
    # those, so remove global application grants before installing scoped ones.
    for role in ("app_rw", "app_analytics_ro"):
        for kind in ("TABLES", "SEQUENCES", "FUNCTIONS"):
            op.execute(
                f"ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator REVOKE ALL ON {kind} FROM {role}"
            )
    op.execute(
        "ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC"
    )
    # The version table is created before this revision and may inherit infra grants.
    op.execute("REVOKE ALL ON public.alembic_version FROM app_rw, app_analytics_ro")
    for schema in ("core", "auth"):
        op.execute(f'GRANT USAGE ON SCHEMA "{schema}" TO app_rw')
        op.execute(
            f'ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA "{schema}" '
            "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw"
        )
        op.execute(
            f'ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA "{schema}" '
            "GRANT USAGE, SELECT ON SEQUENCES TO app_rw"
        )
    op.execute("GRANT USAGE ON SCHEMA analytics TO app_analytics_ro")
    op.execute(
        "ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA analytics "
        "GRANT SELECT ON TABLES TO app_analytics_ro"
    )
    # The audit API reads logs; only the SECURITY DEFINER trigger writes them.
    op.execute("GRANT USAGE ON SCHEMA audit TO app_rw")
    op.execute(
        "ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA audit "
        "GRANT SELECT ON TABLES TO app_rw"
    )


def downgrade() -> None:
    # No CASCADE: unexpected dependent objects should stop a destructive downgrade.
    # Cluster-wide roles/passwords and hardened global defaults belong to infra
    # and survive downgrade. Schema-scoped defaults disappear with their schemas.
    for schema in reversed(SCHEMAS):
        op.execute(f'DROP SCHEMA "{schema}"')
