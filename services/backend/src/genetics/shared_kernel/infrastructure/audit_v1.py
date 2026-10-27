"""Frozen audit function used by revision 0002; add a new version for future edits."""

from alembic_utils.pg_function import PGFunction

log_change = PGFunction(
    schema="audit",
    signature="log_change()",
    definition="""
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, pg_temp
    AS $function$
    DECLARE
        old_row jsonb;
        new_row jsonb;
    BEGIN
        IF TG_OP IN ('UPDATE', 'DELETE') THEN
            old_row := to_jsonb(OLD);
        END IF;
        IF TG_OP IN ('INSERT', 'UPDATE') THEN
            new_row := to_jsonb(NEW);
        END IF;
        INSERT INTO audit.audit_log (
            table_name, record_id, action, actor_id, device, reason,
            request_id, old_data, new_data
        ) VALUES (
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            COALESCE(new_row ->> 'id', old_row ->> 'id')::uuid,
            substring(TG_OP, 1, 1),
            NULLIF(current_setting('app.user_id', true), '')::uuid,
            NULLIF(current_setting('app.device', true), ''),
            NULLIF(current_setting('app.reason', true), ''),
            NULLIF(current_setting('app.request_id', true), ''),
            old_row, new_row
        );
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END;
    $function$
    """,
)
