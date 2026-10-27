#!/usr/bin/env bash
# deploy.sh <tag> [--dry-run] [--skip-backup] [--skip-smoke]
#
# Deploy / cập nhật stack trên VM theo docs/ops/deploy-vm.md §3 — dừng ngay khi lỗi:
#   1. ghi IMAGE_TAG vào .env, docker compose pull
#   2. backup DB trước khi migrate (backup/backup.sh pre-<tag>)       [bỏ qua lần đầu khi postgres chưa chạy]
#   3. docker compose up -d --remove-orphans --wait (api tự alembic upgrade head trong entrypoint)
#   4. smoke: /readyz, /, /app/manifest.webmanifest, `genetics db-current`
#   5. ghi một dòng vào docs/ops/deploy-log.md (tag, giờ, người, kết quả)
#
# Idempotent: chạy lại cùng tag không gây hại (pull no-op, backup thêm một bản, up không đổi).
# Chạy từ thư mục chứa compose.yaml + .env (vd /opt/genetics/production). Biến tuỳ chọn (có thể đặt trong .env):
#   COMPOSE_FILES   mặc định "-f compose.yaml -f compose.prod.yaml"
#   DEPLOY_LOG      mặc định <repo>/docs/ops/deploy-log.md (tính từ vị trí thật của script); không có → ./deploy-log.md
#   SMOKE_BASE_URL  mặc định PUBLIC_WEB_URL; SMOKE_INSECURE=1 → curl -k (cert tự ký)
#   DEPLOY_ACTOR    mặc định $USER@$(hostname)
set -euo pipefail

usage() {
  # In khối comment đầu file (tới dòng không phải comment đầu tiên).
  awk 'NR > 1 && !/^#/ { exit } NR > 1 { sub(/^# ?/, ""); print }' "$0"
  exit 2
}

TAG=""
DRY_RUN=0
SKIP_BACKUP=0
SKIP_SMOKE=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --skip-backup) SKIP_BACKUP=1 ;;
    --skip-smoke) SKIP_SMOKE=1 ;;
    -h | --help) usage ;;
    -*)
      echo "deploy: tham số không hợp lệ: $arg" >&2
      usage
      ;;
    *)
      if [[ -n "$TAG" ]]; then
        echo "deploy: chỉ nhận một tag" >&2
        usage
      fi
      TAG="$arg"
      ;;
  esac
done
[[ -n "$TAG" ]] || usage

# Tag hợp lệ: vX.Y.Z[-suffix], sha-<hex>, main, local (tránh ghi chuỗi lạ vào .env).
if ! [[ "$TAG" =~ ^(v[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.]+)?|sha-[0-9a-f]{7,40}|main|local)$ ]]; then
  echo "deploy: tag '$TAG' không hợp lệ (vX.Y.Z | sha-<sha> | main | local)" >&2
  exit 2
fi

SCRIPT_PATH="$(readlink -f "$0")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
WORK_DIR="$(pwd)"
ENV_FILE="${ENV_FILE:-$WORK_DIR/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "deploy: thiếu $ENV_FILE (tạo từ .env.example, chmod 600)" >&2
  exit 1
fi

# Đọc từng khoá từ .env (không `source`: .env là định dạng của Compose, không phải shell; chứa secret).
# Giá trị: bỏ comment sau khoảng trắng + '#', bỏ dấu nháy bao ngoài. Biến đã có trong môi trường được ưu tiên.
env_get() {
  local key="$1" default="${2:-}" raw
  if [[ -n "${!key:-}" ]]; then
    printf '%s' "${!key}"
    return
  fi
  raw="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true)"
  raw="$(printf '%s' "$raw" | sed -E 's/[[:space:]]+#.*$//; s/^[[:space:]]+//; s/[[:space:]]+$//; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/')"
  printf '%s' "${raw:-$default}"
}
ENV="$(env_get ENV)"
COMPOSE_PROJECT_NAME="$(env_get COMPOSE_PROJECT_NAME genetics)"
PUBLIC_WEB_URL="$(env_get PUBLIC_WEB_URL)"
COMPOSE_FILES="$(env_get COMPOSE_FILES)"
DEPLOY_LOG="$(env_get DEPLOY_LOG)"
SMOKE_BASE_URL="$(env_get SMOKE_BASE_URL)"
SMOKE_INSECURE="$(env_get SMOKE_INSECURE 0)"
DEPLOY_ACTOR="$(env_get DEPLOY_ACTOR)"

COMPOSE_FILES="${COMPOSE_FILES:-"-f compose.yaml -f compose.prod.yaml"}"
# shellcheck disable=SC2206
COMPOSE=(docker compose --env-file "$ENV_FILE" $COMPOSE_FILES)
DEPLOY_ACTOR="${DEPLOY_ACTOR:-${USER:-deploy}@$(hostname)}"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-${PUBLIC_WEB_URL:-}}"
CURL_OPTS=(-fsS --max-time 20)
[[ "${SMOKE_INSECURE:-0}" == "1" ]] && CURL_OPTS+=(-k)

if [[ -z "${DEPLOY_LOG:-}" ]]; then
  if [[ -f "$SCRIPT_DIR/../docs/ops/deploy-log.md" ]]; then
    DEPLOY_LOG="$SCRIPT_DIR/../docs/ops/deploy-log.md"
  else
    DEPLOY_LOG="$WORK_DIR/deploy-log.md"
  fi
fi

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STEP="init"
RESULT="FAIL"
NOTE=""

log() { printf '[deploy %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] %q' "$1"
    shift
    for a in "$@"; do printf ' %q' "$a"; done
    printf '\n'
  else
    "$@"
  fi
}

write_log() {
  local line
  line="| $STARTED_AT | ${ENV:-?} | $TAG | $DEPLOY_ACTOR | $RESULT | ${NOTE:-} |"
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] >> $DEPLOY_LOG: $line"
    return
  fi
  if [[ ! -f "$DEPLOY_LOG" ]]; then
    printf '# Deploy log\n\n| Thời điểm (UTC) | Env | Tag | Người | Kết quả | Ghi chú |\n|---|---|---|---|---|---|\n' > "$DEPLOY_LOG"
  fi
  printf '%s\n' "$line" >> "$DEPLOY_LOG"
  log "ghi $DEPLOY_LOG"
}

on_exit() {
  local code=$?
  if [[ $code -ne 0 && "$RESULT" != "OK" ]]; then
    RESULT="FAIL"
    NOTE="lỗi ở bước: $STEP (exit $code)"
    write_log || true
    log "THẤT BẠI ở bước '$STEP'. Stack giữ nguyên trạng thái hiện tại; xem docker compose ps / logs."
  fi
}
trap on_exit EXIT

# ---- 1. IMAGE_TAG + pull ------------------------------------------------------------------------------
STEP="set-image-tag"
log "stack=$COMPOSE_PROJECT_NAME env=${ENV:-?} tag=$TAG actor=$DEPLOY_ACTOR dry_run=$DRY_RUN"
if grep -qE '^IMAGE_TAG=' "$ENV_FILE"; then
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/' $ENV_FILE"
  else
    sed -i.bak -E "s/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  fi
else
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] echo IMAGE_TAG=$TAG >> $ENV_FILE"
  else
    printf '\nIMAGE_TAG=%s\n' "$TAG" >> "$ENV_FILE"
  fi
fi
export IMAGE_TAG="$TAG"

STEP="pull"
run "${COMPOSE[@]}" pull --quiet

# ---- 2. backup trước khi migrate ---------------------------------------------------------------------
STEP="backup"
if [[ "$SKIP_BACKUP" == "1" ]]; then
  log "bỏ qua backup (--skip-backup)"
  NOTE="skip-backup"
else
  postgres_running=0
  if [[ "$DRY_RUN" == "1" ]]; then
    postgres_running=1
  elif [[ -n "$("${COMPOSE[@]}" ps -q --status running postgres 2>/dev/null)" ]]; then
    postgres_running=1
  fi
  if [[ "$postgres_running" == "1" ]]; then
    run "${COMPOSE[@]}" run --rm --no-deps --entrypoint /opt/backup/backup.sh backup "pre-$TAG"
  else
    log "postgres chưa chạy (deploy lần đầu) → không có gì để backup"
    NOTE="first-deploy"
  fi
fi

# ---- 3. up ----------------------------------------------------------------------------------------------
STEP="up"
run "${COMPOSE[@]}" up -d --remove-orphans --wait --wait-timeout 300

# ---- 4. smoke -------------------------------------------------------------------------------------------
STEP="smoke"
if [[ "$SKIP_SMOKE" == "1" ]]; then
  log "bỏ qua smoke (--skip-smoke)"
  NOTE="${NOTE:+$NOTE, }skip-smoke"
else
  if [[ -z "$SMOKE_BASE_URL" ]]; then
    echo "deploy: thiếu PUBLIC_WEB_URL / SMOKE_BASE_URL cho smoke" >&2
    exit 1
  fi
  for path in /readyz / /app/manifest.webmanifest; do
    run curl "${CURL_OPTS[@]}" -o /dev/null "${SMOKE_BASE_URL%/}$path"
    log "smoke OK $path"
  done
  run "${COMPOSE[@]}" exec -T api genetics db-current
fi

# ---- 5. log ---------------------------------------------------------------------------------------------
STEP="log"
RESULT="OK"
write_log
log "xong: $TAG"
