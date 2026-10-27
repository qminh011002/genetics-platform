---
id: T0106
title: Infra: compose.yaml (postgres 18, api, worker, web, mobile, nginx, backup; profile dev/test/ops), nginx template, .env.example, deploy.sh, backup scripts
epic: E01
status: in_review
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
- `/healthz`: tiêu chí #2 yêu cầu nginx trả 200 khi chưa có app → nginx tự trả `200 ok` ở `location = /healthz`; `/readyz` mới passthrough tới api. `/healthz` của api chỉ dùng cho healthcheck container. Chấp nhận hay muốn thêm `/api/healthz` passthrough?
- Mobile tại `/app`: edge **bỏ tiền tố** `/app/` khi proxy (`rewrite ^/app/(.*)$ /$1`), giả định image mobile (T0108) phục vụ `dist/` ở gốc `/` và Vite build với `base: '/app/'`. Nếu T0108 muốn image tự phục vụ dưới `/app/`, bỏ 5 dòng `rewrite` trong `nginx/snippets/app-locations.conf`.
- Worker healthcheck dựa trên file heartbeat `WORKER_HEARTBEAT_FILE=/tmp/worker.alive` (worker chạm ≤ 60 s) — hợp đồng cần T0107 thực hiện; nếu không, đổi healthcheck sang lệnh CLI của worker.
- `offsite.sh`: image `postgres:18` không có `rsync` → trong container chỉ cảnh báo; cần cron trên host (user `deploy`) hoặc image backup riêng (cần Dockerfile → ngoài phạm vi). Chọn hướng nào?
- `restore-test.sh` cần `CREATEDB` → chạy với superuser `postgres` (`RESTORE_TEST_USER`), khác lệnh mẫu `deploy-vm.md` §6 dùng `app_migrator`. Nên cấp `CREATEDB` cho `app_migrator` hay giữ như hiện tại (và sửa `deploy-vm.md` ở PR khác)?
- CSP có `style-src 'unsafe-inline'` (Tailwind / Radix inline style) và `wasm-unsafe-eval` (barcode-detector); xác nhận với Claude web / mobile khi app chạy thật.

## Kết quả (điền khi xong)
- PR: # (nhánh `infra/T0106-infra`, commit duy nhất, chưa push)
- Files:
  - `infra/compose.yaml` — postgres:18 (volume `pgdata:/var/lib/postgresql`, init roles), api, worker, web, mobile, nginx, backup (cron), `postgres-test` (profile `test`, tmpfs), `uptime-kuma` (profile `ops`); healthcheck mọi service; `depends_on` `service_healthy`; không `version:`
  - `infra/compose.prod.yaml` — image GHCR `${REGISTRY}/genetics-*:${IMAGE_TAG}`, `build: !reset`, không publish postgres/api, nginx 80+443 với template TLS, bind `backups/` `files/` `tls/`
  - `infra/compose.dev.yaml` — pgadmin, mailpit (profile `dev`), SMTP trỏ mailpit
  - `infra/postgres/init/01-roles.sh` — tạo / đồng bộ `app_migrator`, `app_rw`, `app_analytics_ro` từ env (idempotent, NOBYPASSRLS, default privileges, DB owner = migrator)
  - `infra/nginx/default.conf.template` (HTTP local), `infra/nginx/prod/default.conf.template` (80→301, 443 TLS1.2+, HSTS), `infra/nginx/snippets/{app-locations,security-headers,proxy-params}.conf` — `/` web SPA fallback, `/app/` mobile SPA fallback, `/api/` proxy, `/readyz` passthrough, `/healthz` 200 từ nginx, `/auth-redirect.html` + `/app/auth-redirect.html` `no-store`, CSP / X-Content-Type-Options / Referrer-Policy / X-Frame-Options / Permissions-Policy, không COOP; upstream qua biến + `resolver 127.0.0.11` để nginx trả 502 thay vì không khởi động khi app thiếu
  - `infra/.env.example` — đủ biến của `getting-started.md` §6 + `infrastructure.md` §5 + nginx / backup / dev tools / deploy.sh
  - `infra/deploy.sh` — `set -euo pipefail`, kiểm tag, ghi `IMAGE_TAG` vào `.env` (idempotent), pull → backup (`pre-<tag>`, bỏ qua lần đầu) → `up -d --remove-orphans --wait` → smoke (`/readyz`, `/`, `/app/manifest.webmanifest`, `genetics db-current`) → ghi `docs/ops/deploy-log.md` (cả khi FAIL qua trap); `--dry-run`, `--skip-backup`, `--skip-smoke`; không `source` `.env`
  - `infra/backup/{cron.sh,backup.sh,offsite.sh,restore-test.sh}` — vòng lặp cron trong container (heartbeat cho healthcheck), `pg_dump -Fc` + giữ 30 ngày / 12 tháng + `LATEST`, rsync offsite, restore drill vào DB tạm in số bảng + dòng markdown
  - `infra/tests/deploy.bats`, `infra/.gitignore` (backups/ files/ tls/ .env)
  - `docs/ops/deploy-log.md`, `docs/ops/restore-log.md` (mẫu bảng)
- Tiêu chí chấp nhận (máy dev **không có Docker**: `docker`, `podman` đều không cài; CI runner cần chạy lại #1–#4):
  1. **Không chạy được `docker compose config`** (không có docker). Thay thế: parse 3 file bằng PyYAML (`uvx --from pyyaml`) — hợp lệ, không khoá `version`, 9/9 service trong `compose.yaml` có `healthcheck`; prettier `--check` xanh. Cú pháp `!reset` / `!override` chỉ Compose v2.24+ hiểu.
  2. **Không chạy** (không có docker). Lưu ý khi chạy thật: stub `hello-world` thoát ngay nên không bao giờ healthy và `--wait` sẽ fail; dùng stub HTTP (vd `nginx:alpine` cho web/mobile, `API_IMAGE=nginx` + `IMAGE_TAG=alpine` cho api — healthcheck api gọi `/readyz` qua python nên cần ảnh có python, hoặc tạm `--skip`); nginx đã thiết kế để trả 502 cho `/api` và 200 cho `/healthz` khi api không có.
  3. **Không chạy** (không có docker / postgres server). Script `bash -n` ok; logic đã kiểm bằng đọc.
  4. **Không chạy** (không có docker). `no-store` được đặt ở `location = /auth-redirect.html` và `/app/auth-redirect.html` trong snippet dùng chung cho cả HTTP và TLS; không có `nginx` binary để `nginx -t`.
- Kiểm thử bắt buộc: `bats` không cài → `bash -n` 6 script OK; dry-run thủ công `deploy.sh v1.2.3 --dry-run` với `.env` copy từ `.env.example`: in đúng thứ tự pull → backup `pre-v1.2.3` → up → smoke → log, exit 0, `.env` không đổi (md5 giống), không tạo log; `deploy.sh 'latest;rm'` → exit 2; không tag → usage exit 2; thiếu `.env` → exit 1. `infra/tests/deploy.bats` mã hoá đúng các kiểm này để CI chạy khi có bats.
- `pnpm run ci`: exit 0 (prettier check xanh; turbo / contract không có package nào — repo mới chỉ có T0101).
- Lệch so với scope: thêm `infra/nginx/prod/default.conf.template` + `snippets/` (template chỉ envsubst được một file, cần hai server block khác nhau cho HTTP/TLS); thêm `infra/postgres/init/01-roles.sh` (`.sh` thay `.sql` vì SQL thuần không đọc được env); thêm `infra/backup/cron.sh`; thêm `infra/.gitignore`. Không viết Dockerfile, không Azure.
- Còn lại / lệnh tiếp (máy có Docker): `cd infra && cp .env.example .env && docker compose config` → `docker compose --profile dev up --wait` (với stub) → `docker compose run --rm --no-deps --entrypoint /opt/backup/backup.sh backup` → `... restore-test.sh` → `openssl req -x509 -newkey rsa:2048 -nodes -keyout tls/privkey.pem -out tls/fullchain.pem -subj /CN=localhost -days 7` + `docker compose -f compose.yaml -f compose.prod.yaml up -d nginx` + `curl -kI https://localhost/auth-redirect.html` → `docker compose down -v`. Điền kết quả vào mục trên.
