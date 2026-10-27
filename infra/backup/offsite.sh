#!/usr/bin/env bash
# offsite.sh — rsync backups/ (và files/ nếu có) sang máy khác / share (infrastructure.md §7, deploy-vm.md §6).
# Đích: OFFSITE_TARGET (user@host:/path qua SSH, hoặc thư mục đã mount như /mnt/share/genetics). Rỗng → bỏ qua (exit 0).
# Chạy từ cron.sh sau backup hằng đêm, hoặc từ host (cron user deploy) khi container không có rsync:
#   BACKUP_DIR=/opt/genetics/production/backups FILES_DIR=/opt/genetics/production/files OFFSITE_TARGET=... ./offsite.sh
# Image postgres:18 KHÔNG có rsync → trong container script chỉ cảnh báo và thoát 0; đặt cron trên host cho bước này.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
FILES_DIR="${FILES_DIR:-}"
TARGET="${OFFSITE_TARGET:-}"
SSH_KEY="${OFFSITE_SSH_KEY:-}"

log() { printf '[offsite %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

if [[ -z "$TARGET" ]]; then
  log "OFFSITE_TARGET rỗng → bỏ qua"
  exit 0
fi
if ! command -v rsync > /dev/null 2>&1; then
  log "CẢNH BÁO: không có rsync trong môi trường này → bỏ qua; chạy offsite.sh trên host (cron)"
  exit 0
fi

RSYNC=(rsync -a --delete-after --partial --human-readable --stats)
if [[ "$TARGET" == *:* && -n "$SSH_KEY" ]]; then
  RSYNC+=(-e "ssh -i $SSH_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new")
fi

log "backups → $TARGET/backups/"
"${RSYNC[@]}" --exclude '*.part' "$BACKUP_DIR/" "$TARGET/backups/"

if [[ -n "$FILES_DIR" && -d "$FILES_DIR" ]]; then
  log "files → $TARGET/files/"
  "${RSYNC[@]}" "$FILES_DIR/" "$TARGET/files/"
fi
log "xong"
