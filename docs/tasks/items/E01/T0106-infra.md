---
id: T0106
title: Infra: compose.yaml (postgres 18, api, worker, web, mobile, nginx, backup; profile dev/test/ops), nginx template, .env.example, deploy.sh, backup scripts
epic: E01
status: todo
area: infra
type: chore
priority: P0
size: L
depends_on: [T0101]
decisions: [ADR-0012, ADR-0005, ADR-0003]
wireframes: []
owner: planner
allowed_paths:
  - "infra/**"
  - "docs/ops/deploy-log.md"
  - "docs/ops/restore-log.md"
---

## Bối cảnh
VM công ty, deploy thủ công, PostgreSQL 18, không Redis. Nguồn: `infrastructure.md` §3–7, §9, `docs/ops/deploy-vm.md`, `setup-guide.md` §9.

## Phạm vi
Làm:
- `infra/compose.yaml` + `compose.prod.yaml` (TLS, image GHCR theo `IMAGE_TAG`) + `compose.dev.yaml` (pgadmin, mailpit); `healthcheck` mọi service; `depends_on: condition: service_healthy`; postgres 18 volume `/var/lib/postgresql`; init SQL tạo 3 role từ env
- `infra/nginx/default.conf.template`: `/` web SPA fallback, `/app` mobile SPA fallback, `/api` proxy, `/auth-redirect.html` `no-store`, CSP / HSTS / headers; `/healthz` passthrough
- `infra/.env.example` đủ biến (`getting-started.md` §6, `infrastructure.md` §5)
- `infra/deploy.sh <tag>` theo `deploy-vm.md` §3 (pull → backup → up → smoke → log); `infra/backup/{backup.sh,offsite.sh,restore-test.sh}` + container cron
- `docs/ops/deploy-log.md`, `docs/ops/restore-log.md` mẫu

Không làm:
- Không viết Dockerfile app (T0107, T0108)
- Không cấu hình Azure

## Tiêu chí chấp nhận
1. Khi `docker compose -f infra/compose.yaml config` · Thì hợp lệ, không warning `version`
2. Cho image stub `hello-world` thay app · Khi `--profile dev up --wait` · Thì postgres healthy, 3 role tồn tại, nginx trả 502 cho `/api` (chưa có app) và 200 cho `/healthz` của nginx
3. Khi chạy `backup.sh` · Thì có file `.dump`; `restore-test.sh` restore vào DB tạm và in số bảng
4. Khi `curl -I https://localhost/auth-redirect.html` (stack prod local với cert tự ký) · Thì `Cache-Control: no-store`

## Ghi chú kỹ thuật
- `deploy.sh` idempotent; `set -euo pipefail`; log ra `deploy-log.md`

## Kiểm thử bắt buộc
- Shell test bằng `bats` tối thiểu cho deploy.sh (dry-run) hoặc kiểm thủ công có ghi

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
