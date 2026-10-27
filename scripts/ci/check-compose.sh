#!/usr/bin/env bash
# infrastructure.md §11: Compose hợp lệ và mọi service có healthcheck.
# Kiểm compose.yaml (mọi profile) và bộ ghép prod, dùng .env.example làm biến (không secret thật).
set -euo pipefail
cd "$(dirname "$0")/../../infra"
env_file=.env.example
fail=0

check() {
  local label="$1"; shift
  local json
  json="$(docker compose --env-file "$env_file" "$@" config --format json)"
  local missing
  missing="$(jq -r '.services | to_entries[] | select(.value.healthcheck == null or .value.healthcheck.disable == true) | .key' <<<"$json")"
  if [[ -n "$missing" ]]; then
    echo "::error title=compose::[$label] service thiếu healthcheck: $(tr '\n' ' ' <<<"$missing")"
    fail=1
  else
    echo "compose [$label]: $(jq '.services | length' <<<"$json") service, đều có healthcheck"
  fi
}

check dev -f compose.yaml -f compose.dev.yaml --profile dev --profile test --profile ops
check prod -f compose.yaml -f compose.prod.yaml --profile ops
exit "$fail"
