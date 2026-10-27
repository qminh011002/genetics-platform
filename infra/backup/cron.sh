#!/usr/bin/env bash
# cron.sh — entrypoint container `backup` (image postgres:18, không có cron daemon):
# vòng lặp ngủ tới BACKUP_TIME (HH:MM, giờ của container; đặt TZ trong .env nếu cần) rồi chạy backup.sh + offsite.sh.
# Chạm $BACKUP_DIR/.heartbeat mỗi phút cho healthcheck. Lỗi backup không làm container chết (ghi log, chờ lần sau).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_TIME="${BACKUP_TIME:-02:00}"
HERE="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"

if ! [[ "$BACKUP_TIME" =~ ^([01][0-9]|2[0-3]):[0-5][0-9]$ ]]; then
  echo "cron: BACKUP_TIME '$BACKUP_TIME' phải là HH:MM" >&2
  exit 2
fi

mkdir -p "$BACKUP_DIR"
log() { printf '[cron %s] %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*"; }

# Chờ Postgres thật sự nhận kết nối (depends_on healthy đã lo, nhưng restart riêng lẻ thì không).
until pg_isready -q; do
  log "chờ postgres…"
  sleep 5
done
log "sẵn sàng; backup hằng ngày lúc $BACKUP_TIME (TZ=${TZ:-UTC}), giữ ${BACKUP_KEEP_DAILY:-30} ngày / ${BACKUP_KEEP_MONTHLY:-12} tháng"

while true; do
  now="$(date +%s)"
  next="$(date -d "today $BACKUP_TIME" +%s)"
  if (( next <= now )); then
    next="$(date -d "tomorrow $BACKUP_TIME" +%s)"
  fi
  log "lần tới: $(date -d "@$next" +%Y-%m-%dT%H:%M:%S%z)"
  while (( $(date +%s) < next )); do
    touch "$BACKUP_DIR/.heartbeat"
    remaining=$(( next - $(date +%s) ))
    sleep "$(( remaining < 60 ? remaining : 60 ))"
  done

  if "$HERE/backup.sh" daily; then
    "$HERE/offsite.sh" || log "offsite thất bại (sẽ thử lại lần sau)"
  else
    log "BACKUP THẤT BẠI — kiểm tra log; thử lại lần tới"
  fi
  sleep 61 # tránh chạy hai lần trong cùng một phút
done
