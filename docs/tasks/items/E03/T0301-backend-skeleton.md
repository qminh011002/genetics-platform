---
id: T0301
title: Backend skeleton: bootstrap, shared_kernel, 13 module rỗng + public.py, settings, CLI, healthz/readyz, import-linter, package.json bọc uv
epic: E03
status: todo
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
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
