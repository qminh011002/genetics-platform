---
id: T0301
title: Backend skeleton: bootstrap, shared_kernel, 13 module rỗng + public.py, settings, CLI, healthz/readyz, import-linter, package.json bọc uv
epic: E03
status: done
area: backend
type: feature
priority: P0
size: L
depends_on: [T0101]
decisions: [ADR-0002, ADR-0003]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/**"
  - "package.json (chỉ thêm script nếu cần)"
---

## Bối cảnh
Bộ khung để mọi task backend khác gắn vào. Nguồn: `backend.md` §3–6, §14, `setup-guide.md` §3.

## Phạm vi
Làm:
- `uv init --package` trong `services/backend`; deps theo blueprint §3
- Cấu trúc `backend.md` §5: `bootstrap/{app,container,settings}.py`, `shared_kernel/{domain,application,infrastructure,api}`, `modules/<13>/{domain,application,infrastructure,api}/__init__.py` + `application/public.py` rỗng, `jobs/`, `templates/`
- `create_app()` với lifespan (engine), router `/api/v1` rỗng, `/healthz`, `/readyz` (DB ping; hàng đợi job sẽ thêm ở T0304), `generate_unique_id_function=lambda r: r.name`
- `genetics` CLI: `api`, `worker` (stub), `export-openapi`, `seed-dev` (stub), `db-current`
- `.importlinter` với contract layers cho từng module, forbidden domain → fastapi/sqlalchemy/pydantic/httpx, independence modules (trừ `public`), acyclic siblings
- `package.json` bọc: lint / typecheck / test / build / export-openapi / dev / worker / migrate
- ruff, mypy (strict cho domain + application) cấu hình; `AGENTS.md` của backend đã có (T0109)

Không làm:
- Không migration (T0302), không auth (E02), không nghiệp vụ

## Tiêu chí chấp nhận
1. Khi `uv run lint-imports` · Thì xanh và một import thử `modules.breeding.domain` ← `fastapi` làm đỏ
2. Khi `uv run pytest` · Thì test `/healthz` 200, `/readyz` 503 khi không DB
3. Khi `uv run genetics export-openapi` · Thì in JSON OpenAPI 3.1 hợp lệ
4. Khi `pnpm --filter @genetics/backend lint typecheck test` · Thì gọi đúng uv và xanh

## Ghi chú kỹ thuật
- Python 3.13; `sqlalchemy[asyncio]>=2.1`, `psycopg[binary]`
- Settings `pydantic-settings`, `.env` đọc từ `infra/.env` khi `ENV=local`

## Kiểm thử bắt buộc
- pytest khung + import-linter + mypy

## Câu hỏi
- Root `.gitignore` chưa có `.import_linter_cache/` (ngoài `allowed_paths`). Tạm xử lý bằng `services/backend/.gitignore` + loại thư mục này khỏi glob prettier ở root `package.json`. Đề xuất: Planner thêm một dòng vào root `.gitignore` rồi bỏ glob loại trừ.
- `pnpm --filter @genetics/backend lint typecheck test` (tiêu chí 4, viết liền) thực ra bị pnpm hiểu là `lint` với hai tham số `typecheck test`; phải chạy ba lệnh riêng (hoặc `pnpm --filter @genetics/backend run "/^(lint|typecheck|test)$/"`). Đề xuất sửa câu chữ tiêu chí.

## Kết quả (điền khi xong)
- PR: # (nhánh `backend/T0301-backend-skeleton`)
- Ghi chú:

### File
- `services/backend/pyproject.toml`: layout `--package` (`uv_build`, `module-name = genetics`), script `genetics = genetics.cli:main`, deps runtime + dev đúng blueprint §3 (không thêm gói ngoài danh sách; CLI dùng argparse thay typer), pytest markers (`unit`, `integration`, `api`, `contract`), `[tool.ruff] extend = ../../pyproject.toml` + `src` để isort nhận `genetics` là first-party. Ruff/mypy rule vẫn lấy từ root.
- `services/backend/{.python-version,.importlinter,.gitignore,package.json}`; `uv.lock` cập nhật (`uv sync --locked` xanh).
- `src/genetics/bootstrap/{app,container,settings,health}.py`: `create_app(settings=None)` với lifespan tạo `Container` (async engine `postgresql+psycopg`, `pool_pre_ping`), router `/api/v1` rỗng, CORS theo `PUBLIC_WEB_URL`/`PUBLIC_MOBILE_URL`, `openapi_url=/api/v1/openapi.json`, docs chỉ local/staging, `generate_unique_id_function=lambda r: r.name`. `/healthz` → 200 `{"status":"ok"}`; `/readyz` ping `SELECT 1` (timeout 2 s) → 503 + `Retry-After: 5` khi DB down. Health nằm ở `bootstrap` (api chỉ được chạm infrastructure ở đó) và `include_in_schema=False` (hợp đồng SDK không cần).
- `settings.py`: pydantic-settings, `SecretStr` cho URL DB / Sentry, `ENV=local` (mặc định) nạp `infra/.env` nếu có.
- `src/genetics/cli.py`: `api` (uvicorn factory, 1 worker), `worker` (stub, exit 2), `export-openapi` (stdout), `seed-dev` (stub, exit 2), `db-current` (đọc `alembic_version`, báo rõ khi chưa có bảng / không kết nối được; `alembic.ini` sẽ có ở T0302).
- `shared_kernel/{domain,application,infrastructure,api}` (+ `infrastructure/engine.py`), `modules/<13>/{domain,application,infrastructure,api}/__init__.py` + `application/public.py` (docstring, không mã), `jobs/`, `templates/`, `tests/{unit,api,integration,contract,fixtures/legacy}`.
- `.importlinter`: 19 contract — `layers` cho shared_kernel + 13 module (`api | infrastructure > application > domain`), `forbidden` domain → fastapi/starlette/sqlalchemy/psycopg/alembic/pydantic/pydantic_settings/httpx/procrastinate, `forbidden` application → fastapi/sqlalchemy/…, `forbidden` shared_kernel → modules/bootstrap/jobs, `independence` `genetics.modules.*` (ignore `*.application.** -> *.application.public`), `acyclic_siblings` trên `genetics.modules`.

### Tiêu chí
1. `uv run lint-imports`: `Contracts: 19 kept, 0 broken`. Thử thêm `import fastapi` vào `modules/breeding/domain/_probe.py` → `domain thuần Python … BROKEN`, `18 kept, 1 broken`; đã xoá file thử.
2. `uv run pytest`: 8 passed — `test_healthz_returns_200`, `test_readyz_returns_503_without_db` (DB URL trỏ cổng 1, không phụ thuộc Postgres local), `test_health_endpoints_not_in_openapi`, + 5 test unit (export-openapi, operationId = tên route, docs tắt ở production, SecretStr, stub exit 2).
3. `uv run genetics export-openapi` → JSON `"openapi": "3.1.0"`, `paths: {}`, title `Genetics Data Platform API`.
4. `pnpm --filter @genetics/backend lint` / `typecheck` / `test` (ba lệnh riêng, xem Câu hỏi): ruff check + format --check + lint-imports xanh; `mypy --config-file ../../pyproject.toml src` → `Success: no issues found in 93 source files`; pytest 8 passed. `pnpm --filter @genetics/backend build` → wheel + sdist trong `services/backend/dist/`.
- `pnpm run ci` từ gốc worktree: xanh (format:check, check:catalog, lint, typecheck, test, contract:check, build). `contract:check` sinh `contracts/openapi/openapi.json` tạm — đã xoá, không commit (T0401+).
- Smoke: `uv run genetics api --port 8765` → `/healthz` 200, `/readyz` 503 khi DB sai mật khẩu.

### Ngoài allowed_paths / lệch
- Root `package.json`: thêm `"!**/.import_linter_cache/**"` vào glob `format` / `format:check` (cache import-linter làm prettier đỏ). Không thêm script mới.
- Root `.pre-commit-config.yaml` (hook `lint-imports`, T0101): chạy `uv run --project services/backend lint-imports` từ gốc nên import-linter không tìm thấy `services/backend/.importlinter` ("Could not read any configuration") và chặn mọi commit backend. Sửa một dòng: `(cd services/backend && uv run lint-imports)`.
- `backend.md` §5 ghi mypy chạy `uv run mypy src`; mypy chỉ đọc config ở cwd nên package.json dùng `--config-file ../../pyproject.toml` để không nhân đôi cấu hình root.
- Chưa có: `alembic.ini`/`alembic/` (T0302), problem+json handler (T0303), Procrastinate (T0304), structlog middleware, Dockerfile (E12).

### Còn lại / lệnh tiếp
- T0302: `uv run alembic init -t async alembic` trong `services/backend`, nối `MIGRATION_DATABASE_URL` từ `Settings`.
- Khi có endpoint đầu tiên: `include_router` vào `build_api_router()` ở `bootstrap/app.py`, factory use case vào `Container`.
