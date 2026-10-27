"""Async Alembic environment: Settings supplies only the migration role URL."""

import asyncio
from logging.config import fileConfig

from alembic import context
from alembic_utils.pg_function import PGFunction
from alembic_utils.pg_trigger import PGTrigger
from alembic_utils.pg_view import PGView
from alembic_utils.replaceable_entity import register_entities
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from genetics.bootstrap.settings import load_settings
from genetics.shared_kernel.infrastructure.audit_v1 import log_change
from genetics.shared_kernel.infrastructure.migrations import audit_trigger
from genetics.shared_kernel.infrastructure.schema import metadata

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

MANAGED_SCHEMAS = {"core", "auth", "audit", "analytics"}
# GRANTs are managed explicitly in revisions; RLS policies use ReplaceablePolicy.
register_entities(
    [log_change, audit_trigger("app_user")], entity_types=[PGFunction, PGTrigger, PGView]
)


def include_name(name, type_, parent_names):
    # Inspect all objects in our schemas, including unexpected objects (drift).
    # public/alembic_version and the library-owned procrastinate schema are excluded.
    if type_ == "schema":
        return name in MANAGED_SCHEMAS
    if "schema_name" in parent_names:
        return parent_names["schema_name"] in MANAGED_SCHEMAS
    return True


def run_migrations_offline() -> None:
    context.configure(
        url=load_settings().migration_database_url.get_secret_value(),
        target_metadata=metadata,
        include_schemas=True,
        include_name=include_name,
        compare_server_default=True,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=metadata,
        include_schemas=True,
        include_name=include_name,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    # Pass the URL directly: ConfigParser interpolation corrupts percent-encoded passwords.
    engine = create_async_engine(
        load_settings().migration_database_url.get_secret_value(), poolclass=pool.NullPool
    )
    try:
        async with engine.connect() as connection:
            await connection.run_sync(do_run_migrations)
    finally:
        await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
elif (connection := config.attributes.get("connection")) is not None:
    do_run_migrations(connection)
else:
    asyncio.run(run_async_migrations())
