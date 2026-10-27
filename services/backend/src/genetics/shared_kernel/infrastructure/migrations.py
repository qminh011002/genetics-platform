"""Helpers for revision authors; no runtime application transactions here."""

from dataclasses import dataclass

from alembic import op
from alembic_utils.pg_trigger import PGTrigger
from alembic_utils.reversible_op import CreateOp, DropOp


def quote_identifier(value: str) -> str:
    """Identifiers come from migration source, and are always quoted."""
    return '"' + value.replace('"', '""') + '"'


def audit_trigger(table: str, schema: str = "core") -> PGTrigger:
    """Describe the trigger for both a migration and autogenerate registration."""
    entity = f"{quote_identifier(schema)}.{quote_identifier(table)}"
    return PGTrigger(
        schema=schema,
        signature=f"{table}_audit",
        on_entity=entity,
        definition=(
            f"AFTER INSERT OR UPDATE OR DELETE ON {entity} "
            "FOR EACH ROW EXECUTE FUNCTION audit.log_change()"
        ),
    )


def attach_audit(table: str, schema: str = "core") -> None:
    """Attach an audit trigger to a table with a UUID `id` column."""
    op.invoke(CreateOp(audit_trigger(table, schema)))


def detach_audit(table: str, schema: str = "core") -> None:
    op.invoke(DropOp(audit_trigger(table, schema)))


@dataclass(frozen=True)
class ReplaceablePolicy:
    """Version policy definitions in revisions; replace with the old one on downgrade.

    `definition` is trusted SQL written by a migration author, e.g.
    `FOR SELECT TO app_rw USING (created_by = ...)`. This helper deliberately
    does not enable RLS or invent access rules; that belongs to T0204.
    """

    schema: str
    table: str
    name: str
    definition: str

    @property
    def qualified_table(self) -> str:
        return f"{quote_identifier(self.schema)}.{quote_identifier(self.table)}"

    def create(self) -> None:
        op.execute(
            f"CREATE POLICY {quote_identifier(self.name)} ON "
            f"{self.qualified_table} {self.definition}"
        )

    def drop(self) -> None:
        op.execute(f"DROP POLICY {quote_identifier(self.name)} ON {self.qualified_table}")

    def replace(self) -> None:
        """Drop/create atomically inside the current migration transaction."""
        self.drop()
        self.create()
