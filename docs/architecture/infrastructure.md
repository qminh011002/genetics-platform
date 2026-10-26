# Hạ tầng, triển khai và vận hành

> Phạm vi: `infra/`, `.github/workflows/`, môi trường local / staging / production. Chủ sở hữu: Claude Planner (thiết kế), Codex (Dockerfile backend), Claude web / mobile (Dockerfile của app mình). Quyết định đã chốt 26/10/2026: **VM nội bộ + Docker Compose** (ADR-0012), **Procrastinate, không Redis** (ADR-0005), **PostgreSQL 18**, **GitHub Free**; ADR-0015 (lưu file) còn Proposed.
> Phiên bản công cụ xác minh 26/10/2026 (xem `research-references.md` §D).

## 1. Yêu cầu

| Yêu cầu (PLAN-001) | Hệ quả |
|---|---|
| ~10 user, một tổ chức, dữ liệu nhỏ | Một máy chủ, Docker Compose, không Kubernetes |
| Điện thoại trong khu nuôi phải vào được HTTPS; Wi-Fi yếu | Nginx TLS; API stateless; PWA offline |
| Secret đang lộ trong OneDrive (RSK-01) | Secret chỉ ở server / GitHub Environments; rotate |
| D3 (server nội bộ hay Azure) chưa chốt | Thiết kế chạy được cả hai: Compose trên VM bất kỳ |
| Backup test được (`overview.md` §10) | `pg_dump` + restore drill; PITR tuỳ chọn |

## 2. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **Docker Compose trên VM nội bộ (server Genetics)** | Rẻ, gần dữ liệu, team đã có server + Docker (Metabase đang chạy ở đó) | Tự lo backup, TLS, cập nhật OS; điện thoại cần Wi-Fi nội bộ / VPN | **Đã chốt** (D3, ADR-0012) |
| Azure (App Service / Container Apps + Azure Database for PostgreSQL) | Hợp Entra, backup quản lý, HTTPS sẵn | Chi phí hàng tháng; cần quy trình IT | Không chọn; thiết kế vẫn chuyển được (Compose → Container Apps) nếu sau này cần |
| Kubernetes | — | Quá tầm vận hành | Loại |
| Watchtower tự cập nhật image | — | Dự án đã archive 12/2025 | Loại; deploy từ CI |

## 3. Topology (Compose)

```
                    Internet / LAN
                         │ 443
                   ┌─────▼─────┐
                   │   nginx   │  TLS, HSTS, CSP, gzip; / → web (static), /app → mobile (static),
                   │           │  /api → api:8000; /auth-redirect.html no-store
                   └──┬─────┬──┘
          ┌───────────┘     └───────────┐
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──▼────────┐
   │ web (static)│  │mobile(static│  │ api       │ FastAPI, 1 process (uvicorn), stateless
   └─────────────┘  │  PWA)       │  └──┬─────┬──┘
                    └─────────────┘     │     │
                                 ┌──────▼─┐ ┌─▼──────────┐
                                 │postgres│ │ worker     │ Procrastinate (cùng image api, lệnh khác)
                                 │  18    │◄┤ jobs + cron│
                                 └───┬────┘ └────────────┘
                                     │ volume pgdata · volume files (attachment, nhãn, report)
                                 ┌───▼────┐
                                 │ backup │ cron: pg_dump -Fc hằng đêm → /backups (+ rsync ra ngoài máy)
                                 └────────┘
```

Không còn Redis (job nền chạy trên Postgres, ADR-0005). Nếu ADR-0005 bị từ chối → thêm service `redis` 8 và worker arq / SAQ.

`compose.yaml` (tên chuẩn, không có `version:`), `profiles`: `dev` (thêm `mailpit`, `pgadmin` tuỳ chọn), `test`. `depends_on` dùng `condition: service_healthy`; mọi service có `healthcheck` (`pg_isready`, `GET /readyz`, `nginx -t`).

## 4. Image và build

| Service | Base | Build |
|---|---|---|
| `api`, `worker` | `python:3.13-slim` + `COPY --from=ghcr.io/astral-sh/uv:0.13 /uv /bin/`; hai stage: `uv sync --locked --no-install-project --no-dev` (cache mount) → copy source → `uv sync --locked --no-dev`; `UV_COMPILE_BYTECODE=1`; cài `libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0` cho WeasyPrint; user non-root | `services/backend/Dockerfile` |
| `web` | stage build `node:22` + pnpm (`pnpm fetch` → `pnpm install --frozen-lockfile --filter @genetics/web...` → `pnpm --filter @genetics/web build`) → stage `nginx:1.27-alpine` copy `dist/` | `apps/web/Dockerfile` |
| `mobile` | như web (`vite build` sinh `dist/` kèm `sw.js`, `manifest.webmanifest`) | `apps/mobile/Dockerfile` |
| `nginx` | `nginx:1.27-alpine`, template `/etc/nginx/templates/*.template` (envsubst) | `infra/nginx/` |
| `postgres` | `postgres:18` (image 18 đặt `PGDATA` theo version: volume mount `/var/lib/postgresql` thay vì `/var/lib/postgresql/data`; `uuidv7()` có sẵn) | official |

Tag image theo git SHA và tag phát hành `vX.Y.Z`; registry: GitHub Container Registry (`ghcr.io/<org>/genetics-*`).

## 5. Môi trường và cấu hình

| Môi trường | Ở đâu | Dữ liệu | Deploy | Secret |
|---|---|---|---|---|
| `local` | máy dev, `docker compose --profile dev up` | seed + fixture legacy | — | `.env` (gitignore), từ `.env.example` |
| `test` (CI) | runner GitHub, testcontainers / Compose profile `test` | fixture | — | không có secret thật |
| `staging` | VM công ty (stack riêng `/opt/genetics/staging`) | bản sao đã ẩn danh hoặc thật nếu được duyệt | thủ công `deploy.sh sha-<sha>` sau khi merge `main` | `.env` trên VM |
| `production` | server Genetics | thật | thủ công từ tag `vX.Y.Z` bởi người có SSH (GitHub Free không có Environment reviewer cho repo private) | `.env` trên server, không ở GitHub |

- Biến môi trường: `DATABASE_URL` (role `app_rw`), `MIGRATION_DATABASE_URL` (`app_migrator`), `ENTRA_TENANT_ID`, `ENTRA_API_CLIENT_ID`, `ENTRA_WEB_CLIENT_ID`, `ENTRA_MOBILE_CLIENT_ID`, `FILE_STORAGE_ROOT`, `PUBLIC_WEB_URL`, `PUBLIC_MOBILE_URL`, `SENTRY_DSN`, `LOG_LEVEL`. `.env.example` chỉ tên + mô tả.
- Frontend chỉ nhận biến `VITE_*` không nhạy cảm (client id, API URL).
- Secret đặt trên VM trong `/opt/genetics/<env>/.env` (chmod 600, owner `deploy`) do chủ dự án tạo; GitHub chỉ giữ PAT đọc package nếu cần (không cần nếu VM login GHCR bằng PAT riêng).

## 6. Deploy

1. CI build image, push GHCR, tag SHA.
2. **Mọi deploy do chủ dự án chạy trên VM** (quyết định 26/10/2026): `infra/deploy.sh <tag>` kéo image từ GHCR, backup DB trước, `docker compose up -d`, smoke. Không có SSH từ GitHub vào VM; CI chỉ build + push image. Chi tiết: `docs/ops/deploy-vm.md`.
3. Container `api` chạy `alembic upgrade head` **trước** khi uvicorn khởi động (entrypoint); worker chờ `api` healthy. Migration phải tương thích với bản cũ đang chạy trong vài giây chuyển đổi (thêm cột nullable trước, xoá sau).
4. Healthcheck `/readyz` xanh → nginx chuyển traffic (một instance, chấp nhận vài giây gián đoạn; ghi trong SLO).
5. Rollback: `docker compose up -d api=<sha cũ>` + `alembic downgrade <rev>` nếu migration có downgrade; production chỉ deploy migration có downgrade đã thử trên staging.

## 7. Backup và khôi phục

| Mức | Cách | RPO / RTO | Khi nào |
|---|---|---|---|
| 1 (bắt buộc từ W1) | `pg_dump -Fc` hằng đêm 02:00 vào volume `backups`, giữ 30 bản ngày + 12 bản tháng; `rsync` sang máy khác / SharePoint; **restore drill hằng tháng** (`pg_restore -j4` vào DB tạm + chạy `alembic check` + đếm bảng) ghi kết quả vào `docs/ops/restore-log.md` | RPO 24 h, RTO < 1 h | Trước khi staging có dữ liệu thật |
| 2 (tuỳ chọn) | pgBackRest (full / diff / incr + WAL archive, PITR) | RPO ~ 1 phút | Nếu Genetics Manager yêu cầu RPO < 24 h (open question OQ-7) |
| File | volume `files` rsync cùng lịch backup | như mức 1 | |

Không dùng `pg_dump` làm PITR (tài liệu Postgres nói rõ).

## 8. Quan sát và vận hành

- Log JSON stdout → `docker logs` + `journald`; giữ 14 ngày. Log có `trace_id`, không có token / nội dung file.
- Sentry SaaS (free Developer plan 5.000 lỗi / tháng) cho API, web, mobile. Self-host Sentry cần 16 GB RAM → không.
- Uptime Kuma (container nhỏ) kiểm `/healthz`, `/readyz`, trang web, trang mobile; thông báo email / Teams.
- Metric: `/metrics` Prometheus **không** bắt buộc ở bản đầu; thêm khi có nhu cầu (ngưỡng ở `quality-standards.md` §7).
- Tài liệu vận hành: `docs/ops/runbook.md` (khởi động lại, rotate secret, restore, cutover) — viết ở W4.

## 9. Bảo mật hạ tầng

- TLS: chứng chỉ nội bộ Entobel hoặc Let's Encrypt (nếu có tên miền public); HSTS; TLS 1.2+.
- Nginx: CSP (`default-src 'self'`; `connect-src 'self' https://login.microsoftonline.com`; `frame-ancestors 'none'`), `X-Content-Type-Options`, `Referrer-Policy`; `/auth-redirect.html` `Cache-Control: no-store`, không COOP.
- Postgres không mở ra ngoài mạng Docker; 3 role (`app_migrator`, `app_rw`, `app_analytics_ro`); mật khẩu sinh ngẫu nhiên; RLS bật.
- File upload lưu ngoài web root, phục vụ qua API có kiểm quyền; giới hạn kích thước; quét MIME.
- Rotate ngay: mật khẩu SSH, DB cũ, AppSheet API key (sau khi snapshot PM) — RSK-01, DN-11.
- Cập nhật: Dependabot (pnpm, uv, Docker, GitHub Actions) với cooldown 3 ngày mặc định, nhóm theo minor / patch; `pnpm audit`, `pip-audit` trong CI hằng tuần; gitleaks pre-commit + CI.

## 10. Chi phí và vận hành ước lượng

| Khoản | Mặc định (nội bộ) | Nếu Azure |
|---|---|---|
| Máy chủ | Server Genetics hiện có (đang chạy Postgres + Metabase) | 1 VM B2ms hoặc Container Apps + Azure DB Flexible B1ms (ước lượng theo bảng giá Azure lúc chốt D3) |
| Dịch vụ ngoài | Sentry free, GHCR free cho repo private trong giới hạn, GitHub Free (đã chốt: không Environment reviewer, không secret scanning cho private → gitleaks + ruleset) | (không áp dụng) |
| Công vận hành | 2–4 giờ / tháng: xem backup log, cập nhật image, restore drill | thấp hơn cho DB |

## 11. Kiểm chứng tự động

| Quy tắc | Kiểm |
|---|---|
| Compose hợp lệ, mọi service có healthcheck | CI `docker compose config` + script kiểm `healthcheck` |
| Image build được, không chạy root | CI build + `docker run --rm image id -u` ≠ 0 |
| Không secret trong image / repo | gitleaks; `.dockerignore` loại `.env` |
| Migration chạy khi deploy | smoke test staging gọi `/readyz` và `alembic current == head` |
| Backup chạy | Uptime Kuma kiểm file backup mới nhất < 26 h (script HTTP nhỏ) |
| Restore drill | ghi log hằng tháng; CI không kiểm, review hằng tháng |
