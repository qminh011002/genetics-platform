#!/usr/bin/env bash
# backup.sh [prefix]
# pg_dump -Fc toàn DB vào $BACKUP_DIR/<prefix>-<db>-<UTC time>.dump (infrastructure.md §7 mức 1), rồi dọn:
#   - giữ BACKUP_KEEP_DAILY bản mới nhất có prefix "daily"
#   - bản đầu tiên của mỗi tháng được sao chép sang $BACKUP_DIR/monthly/, giữ BACKUP_KEEP_MONTHLY bản
#   - bản "pre-<tag>" (deploy.sh) không bị dọn tự động (xoá tay sau khi bản phát hành ổn định)
# Chạy trong container `backup` (image postgres:18; PG* env đã đặt) hoặc trên host có pg_dump cùng major version:
#   docker compose run --rm --no-deps --entrypoint /opt/backup/backup.sh backup            # daily
#   docker compose run --rm --no-deps --entrypoint /opt/backup/backup.sh backup pre-v1.4.0 # trước deploy
set -euo pipefail

PREFIX="${1:-daily}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
KEEP_DAILY="${BACKUP_KEEP_DAILY:-30}"
KEEP_MONTHLY="${BACKUP_KEEP_MONTHLY:-12}"
DB="${PGDATABASE:?PGDATABASE missing}"

if ! [[ "$PREFIX" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$ ]]; then
  echo "backup: prefix '$PREFIX' không hợp lệ" >&2
  exit 2
fi

mkdir -p "$BACKUP_DIR" "$BACKUP_DIR/monthly"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/$PREFIX-$DB-$STAMP.dump"
TMP="$OUT.part"

log() { printf '[backup %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

log "pg_dump -Fc $DB → $OUT"
# -Fc: custom format, nén, pg_restore -j được. --no-owner/--no-acl không dùng: giữ owner app_migrator để restore đúng quyền.
pg_dump --format=custom --compress=6 --file="$TMP" "$DB"
mv "$TMP" "$OUT"
SIZE="$(du -h "$OUT" | cut -f1)"
log "xong: $OUT ($SIZE)"

# Kiểm nhanh file đọc được (TOC), bắt lỗi dump hỏng ngay.
pg_restore --list "$OUT" > /dev/null

# ---- giữ bản tháng: bản daily đầu tiên của tháng hiện tại ---------------------------------------------
if [[ "$PREFIX" == "daily" ]]; then
  MONTH="$(date -u +%Y%m)"
  if ! compgen -G "$BACKUP_DIR/monthly/monthly-$DB-$MONTH*.dump" > /dev/null; then
    cp "$OUT" "$BACKUP_DIR/monthly/monthly-$DB-$STAMP.dump"
    log "giữ bản tháng $MONTH"
  fi

  # ---- dọn: daily ---------------------------------------------------------------------------------------
  # ls -1t sắp xếp mới → cũ; xoá từ bản thứ KEEP_DAILY+1.
  mapfile -t old_daily < <(ls -1t "$BACKUP_DIR"/daily-"$DB"-*.dump 2> /dev/null | tail -n +"$((KEEP_DAILY + 1))")
  for f in "${old_daily[@]:-}"; do
    [[ -n "$f" ]] && rm -f "$f" && log "xoá $f"
  done
  mapfile -t old_monthly < <(ls -1t "$BACKUP_DIR"/monthly/monthly-"$DB"-*.dump 2> /dev/null | tail -n +"$((KEEP_MONTHLY + 1))")
  for f in "${old_monthly[@]:-}"; do
    [[ -n "$f" ]] && rm -f "$f" && log "xoá $f"
  done
fi

# Dấu mốc cho Uptime Kuma / kiểm "backup mới nhất < 26 h" (infrastructure.md §11).
printf '%s %s\n' "$STAMP" "$(basename "$OUT")" > "$BACKUP_DIR/LATEST"
echo "$OUT"
