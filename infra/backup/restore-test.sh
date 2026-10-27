#!/usr/bin/env bash
# restore-test.sh [file.dump]
# Restore drill hằng tháng (infrastructure.md §7, deploy-vm.md §6): restore vào DB tạm, đếm bảng, xoá DB tạm,
# in một dòng markdown để dán vào docs/ops/restore-log.md. Không đụng DB `genetics`.
# Mặc định dùng bản mới nhất theo $BACKUP_DIR/LATEST.
#   docker compose run --rm --no-deps --entrypoint /opt/backup/restore-test.sh backup [/backups/<file>.dump]
# Cần quyền CREATEDB cho PGUSER (app_migrator không có) → dùng superuser khi gọi:
#   PGUSER=postgres PGPASSWORD=$POSTGRES_PASSWORD ... hoặc đặt RESTORE_TEST_USER/RESTORE_TEST_PASSWORD trong .env.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB="${PGDATABASE:?PGDATABASE missing}"
TEST_DB="${RESTORE_TEST_DB:-${DB}_restore_test}"
JOBS="${RESTORE_JOBS:-4}"

if [[ -n "${RESTORE_TEST_USER:-}" ]]; then
  export PGUSER="$RESTORE_TEST_USER"
  export PGPASSWORD="${RESTORE_TEST_PASSWORD:?RESTORE_TEST_PASSWORD missing}"
fi

DUMP="${1:-}"
if [[ -z "$DUMP" ]]; then
  [[ -f "$BACKUP_DIR/LATEST" ]] || {
    echo "restore-test: không có $BACKUP_DIR/LATEST; truyền đường dẫn .dump" >&2
    exit 2
  }
  DUMP="$BACKUP_DIR/$(cut -d' ' -f2 "$BACKUP_DIR/LATEST")"
fi
[[ -f "$DUMP" ]] || {
  echo "restore-test: không thấy $DUMP" >&2
  exit 2
}

log() { printf '[restore-test %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
cleanup() { dropdb --if-exists "$TEST_DB" > /dev/null 2>&1 || true; }
trap cleanup EXIT

START="$(date +%s)"
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "restore $DUMP → $TEST_DB (jobs=$JOBS)"
cleanup
createdb "$TEST_DB"
# --no-owner: role có thể khác trên máy drill; -j song song; exit code ≠ 0 nếu có lỗi.
pg_restore --dbname="$TEST_DB" --jobs="$JOBS" --no-owner --exit-on-error "$DUMP"

TABLES="$(psql -d "$TEST_DB" -At -c \
  "select count(*) from information_schema.tables where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE'")"
SCHEMAS="$(psql -d "$TEST_DB" -At -c \
  "select string_agg(nspname, ',' order by nspname) from pg_namespace where nspname not like 'pg\_%' and nspname <> 'information_schema'")"
ALEMBIC="$(psql -d "$TEST_DB" -At -c \
  "select coalesce((select version_num from alembic_version limit 1), 'n/a')" 2> /dev/null || echo 'n/a')"
DURATION=$(($(date +%s) - START))

log "bảng: $TABLES · schema: $SCHEMAS · alembic: $ALEMBIC · ${DURATION}s"
echo
echo "Dòng cho docs/ops/restore-log.md:"
echo "| $STARTED_AT | $(basename "$DUMP") | ${DEPLOY_ACTOR:-${USER:-?}} | OK | bảng=$TABLES, alembic=$ALEMBIC, ${DURATION}s | |"
