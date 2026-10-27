#!/usr/bin/env bats
# Test tối thiểu cho infra/deploy.sh ở chế độ --dry-run (không cần docker).
# Chạy: bats infra/tests/deploy.bats  — hoặc kiểm thủ công theo infra/tests/README-manual.md

setup() {
  INFRA="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
  WORK="$(mktemp -d)"
  cp "$INFRA/.env.example" "$WORK/.env"
  cd "$WORK"
}

teardown() { rm -rf "$WORK"; }

@test "bash -n: cú pháp hợp lệ" {
  bash -n "$INFRA/deploy.sh"
}

@test "không có tag → usage, exit 2" {
  run bash "$INFRA/deploy.sh"
  [ "$status" -eq 2 ]
}

@test "tag lạ bị từ chối" {
  run bash "$INFRA/deploy.sh" 'latest;rm' --dry-run
  [ "$status" -eq 2 ]
}

@test "dry-run in đủ 5 bước theo thứ tự pull → backup → up → smoke → log" {
  run env DEPLOY_LOG="$WORK/deploy-log.md" bash "$INFRA/deploy.sh" v1.2.3 --dry-run
  [ "$status" -eq 0 ]
  [[ "$output" == *"IMAGE_TAG=v1.2.3"* ]]
  pull=$(grep -n 'compose .* pull' <<< "$output" | head -1 | cut -d: -f1)
  backup=$(grep -n 'backup.sh backup pre-v1.2.3' <<< "$output" | head -1 | cut -d: -f1)
  up=$(grep -n 'up -d --remove-orphans --wait' <<< "$output" | head -1 | cut -d: -f1)
  smoke=$(grep -n 'curl .*readyz' <<< "$output" | head -1 | cut -d: -f1)
  logl=$(grep -n '>> .*deploy-log.md' <<< "$output" | head -1 | cut -d: -f1)
  [ -n "$pull" ] && [ -n "$backup" ] && [ -n "$up" ] && [ -n "$smoke" ] && [ -n "$logl" ]
  [ "$pull" -lt "$backup" ] && [ "$backup" -lt "$up" ] && [ "$up" -lt "$smoke" ] && [ "$smoke" -lt "$logl" ]
}

@test "dry-run không sửa .env, không ghi log" {
  before=$(md5sum "$WORK/.env")
  DEPLOY_LOG="$WORK/deploy-log.md" bash "$INFRA/deploy.sh" sha-abc1234 --dry-run > /dev/null
  [ "$before" = "$(md5sum "$WORK/.env")" ]
  [ ! -f "$WORK/deploy-log.md" ]
}

@test "thiếu .env → exit 1" {
  rm "$WORK/.env"
  run bash "$INFRA/deploy.sh" v1.0.0 --dry-run
  [ "$status" -eq 1 ]
}
