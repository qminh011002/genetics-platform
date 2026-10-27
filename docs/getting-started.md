# Getting started · chạy, build, test Genetics Platform trên máy dev

> Hướng dẫn cho người mới (và agent) sau khi repo đã khởi tạo theo `docs/tasks/initialization/setup-guide.md`. Lệnh ở đây là **lệnh chuẩn của repo**: mọi app phải giữ đúng tên script này (kiểm trong `acceptance-checklist.md`). Deploy lên VM xem `docs/ops/deploy-vm.md`.
> Trạng thái: có hiệu lực khi mốc M1 (init) hoàn thành; trước đó dùng `setup-guide.md`.

## 1. Cần có trên máy

| Công cụ | Phiên bản | Kiểm |
|---|---|---|
| Node.js | 22 LTS (`.nvmrc`) | `node -v` |
| pnpm | 12 (`packageManager` trong `package.json`; `corepack enable`) | `pnpm -v` |
| uv | 0.13+ | `uv --version` |
| Python | 3.13 (uv tự tải theo `.python-version`) | `uv python list` |
| Docker + Compose v2 | Docker ≥ 26 | `docker compose version` |
| git | ≥ 2.40 | `git --version` |

Windows: dùng WSL2 (Ubuntu) và clone repo **trong** WSL (không ở `/mnt/c`) để pnpm / Docker nhanh và không lỗi symlink.

## 2. Cài lần đầu

```bash
git clone <url> genetics_platform && cd genetics_platform
pnpm install --frozen-lockfile          # mọi package JS (apps/*, packages/*)
uv sync --locked                        # backend + tools/legacy_import vào .venv ở root
cp infra/.env.example infra/.env        # điền giá trị local (xem §6)
pnpm build:tokens                       # packages/design-tokens → web.css, tokens.ts (cần trước khi chạy web/mobile)
pnpm generate                           # export OpenAPI từ backend → contracts/ → SDK orval
```

Kiểm nhanh: `pnpm -r exec echo ok` liệt kê 6 workspace (`@genetics/web`, `@genetics/mobile`, `@genetics/ui`, `@genetics/api-client`, `@genetics/shared`, `@genetics/design-tokens`, `@genetics/backend`).

## 3. Chạy dev

### 3.1 Cách thường dùng: Postgres trong Docker, app chạy trực tiếp

```bash
docker compose -f infra/compose.yaml --profile dev up -d postgres   # chỉ DB (+ pgadmin nếu muốn)
uv run --package genetics-platform-backend alembic upgrade head      # hoặc: pnpm --filter @genetics/backend migrate
uv run genetics seed-dev                                             # dữ liệu mẫu: 4 vai trò, user giả, strain, lồng, 3 batch
pnpm dev                                                             # turbo: api (uvicorn --reload :8000), worker, web (:5173), mobile (:5174)
```

| App | URL local | Đăng nhập local |
|---|---|---|
| API | http://localhost:8000 · Swagger `/api/v1/docs` | header `X-Dev-User: executive@example.test` khi `AUTH_MODE=dev` |
| Web | http://localhost:5173 | nút "Đăng nhập dev" chọn vai trò (chỉ khi `VITE_AUTH_MODE=dev`) |
| Mobile (PWA) | http://localhost:5174 (mở bằng Chrome DevTools device mode hoặc điện thoại cùng mạng qua `--host`) | như web |
| Worker | log trong terminal `pnpm dev` | — |

Chạy riêng từng app: `pnpm --filter @genetics/web dev`, `pnpm --filter @genetics/mobile dev`, `pnpm --filter @genetics/backend dev` (= `uv run fastapi dev src/genetics/bootstrap/app.py`), `pnpm --filter @genetics/backend worker`.

Mock API (làm UI khi backend chưa có endpoint): `VITE_API_MOCK=1 pnpm --filter @genetics/web dev` — MSW dùng handler sinh từ `contracts/openapi/openapi.json`.

### 3.2 Toàn bộ trong Docker (giống staging)

```bash
docker compose -f infra/compose.yaml --profile dev up --build --wait
curl -f http://localhost/readyz
```

Nginx ở `http://localhost` (web `/`, mobile `/app`, API `/api`). Dùng khi cần test service worker / PWA thật (cần HTTPS cho camera → xem §7).

## 4. Build

| Lệnh | Kết quả |
|---|---|
| `pnpm build` | turbo build tất cả: `packages/*` → `apps/web/dist`, `apps/mobile/dist` (kèm `sw.js`, `manifest.webmanifest`), backend wheel |
| `pnpm --filter @genetics/web build` | chỉ web |
| `pnpm --filter @genetics/mobile build` | chỉ mobile (vite + vite-plugin-pwa) |
| `docker build -f services/backend/Dockerfile -t genetics-api .` | image API / worker (cùng image) |
| `docker build -f apps/web/Dockerfile -t genetics-web .` · `apps/mobile/Dockerfile` | image static + nginx |
| `pnpm generate` | export OpenAPI + sinh SDK; **phải chạy và commit** khi đổi API |
| `pnpm build:tokens` | sinh token; chạy khi đổi `tokens.json` |

Thứ tự khi build từ máy trống: `pnpm install` → `uv sync` → `pnpm build:tokens` → `pnpm generate` → `pnpm build`.

## 5. Test và kiểm tra chất lượng

```bash
pnpm lint            # ruff + lint-imports (backend), eslint + boundaries + dependency-cruiser (JS)
pnpm typecheck       # mypy (backend), tsc (JS)
pnpm test            # pytest (unit + integration testcontainers + API + schemathesis), vitest (web, mobile, packages)
pnpm test:e2e        # playwright: cần `docker compose --profile test up -d` trước (hoặc script tự bật)
pnpm test:visual     # playwright screenshots trong image pin (chạy qua docker, xem quality-standards §2.2)
pnpm contract:check  # export OpenAPI + generate + git diff + spectral + oasdiff
pnpm ci              # tất cả gate Init như CI (dùng trước khi mở PR; skill /run-ci-locally gọi lệnh này)
```

Backend riêng: `uv run pytest services/backend -m "not slow"`; `uv run pytest -k close_stage -x`. Integration cần Docker chạy (testcontainers kéo `postgres:18`).

Cập nhật ảnh visual (chỉ khi PR ghi rõ "visual change"): `pnpm test:visual -- --update-snapshots`.

## 6. Biến môi trường (`infra/.env.example`)

| Biến | Local | Ý nghĩa |
|---|---|---|
| `ENV` | `local` | bật Swagger, `AUTH_MODE=dev` |
| `AUTH_MODE` | `dev` | `dev` nhận `X-Dev-User`; `entra` kiểm JWT |
| `DATABASE_URL` | `postgresql+psycopg://app_rw:app_rw@localhost:5432/genetics` | role app |
| `MIGRATION_DATABASE_URL` | `postgresql+psycopg://app_migrator:…@localhost:5432/genetics` | Alembic |
| `ENTRA_TENANT_ID`, `ENTRA_API_CLIENT_ID`, `ENTRA_WEB_CLIENT_ID`, `ENTRA_MOBILE_CLIENT_ID` | trống ở local | khi `AUTH_MODE=entra` |
| `FILE_STORAGE_ROOT` | `./.data/files` | ADR-0015 |
| `PUBLIC_WEB_URL`, `PUBLIC_MOBILE_URL` | `http://localhost:5173`, `http://localhost:5174` | CORS, link trong thông báo |
| `SENTRY_DSN` | trống | |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | web / mobile |
| `VITE_AUTH_MODE`, `VITE_API_MOCK` | `dev`, `0` | |

Không bao giờ commit `.env`; gitleaks chặn.

## 7. PWA và camera trên điện thoại thật khi dev

Camera chỉ chạy trên HTTPS. Cách nhanh: `pnpm --filter @genetics/mobile dev -- --host` rồi dùng tunnel có HTTPS (ví dụ `cloudflared tunnel --url http://localhost:5174`) hoặc chứng chỉ local (`mkcert`) + `vite --https`. Service worker chỉ đăng ký ở bản build (`pnpm build` + `pnpm --filter @genetics/mobile preview --host`).

## 8. Quy trình làm một task

1. Đọc task file trong `docs/tasks/items/`, tài liệu kiến trúc nó trỏ tới, `AGENTS.md`.
2. `git worktree add ../gp-<task-id> -b <area>/<task-id>-<mo-ta>` (hoặc `claude --worktree <task-id>`).
3. Làm trong `allowed_paths`; `pnpm ci` xanh; cập nhật `docs/tasks/board.md`.
4. PR theo template; squash merge sau khi CI xanh và có review.

## 9. Lỗi thường gặp

| Triệu chứng | Nguyên nhân / cách sửa |
|---|---|
| `ERR_PNPM_OUTDATED_LOCKFILE` | ai đó đổi `package.json` mà không chạy `pnpm install`; chạy `pnpm install` và commit lockfile |
| `uv sync` báo lockfile không khớp | `uv lock` rồi commit `uv.lock` (cần nhãn `deps-approved` nếu thêm gói) |
| CI `contract` đỏ | chưa chạy `pnpm generate` sau khi đổi API |
| Web báo 403 `platform_not_allowed` | đang dùng token mobile / vai trò Worker trên web — đúng hành vi |
| Playwright khác ảnh baseline | chạy trong image pin (`pnpm test:visual`), không chạy trên máy host |
| Postgres 18 không mount volume cũ | image 18 đổi `PGDATA`: mount `/var/lib/postgresql`, không phải `/var/lib/postgresql/data` |

