---
id: T0107
title: Dockerfile backend (api + worker cùng image, uv multi-stage, WeasyPrint deps, non-root, entrypoint migrate)
epic: E01
status: ready
area: backend
type: chore
priority: P0
size: S
depends_on: [T0301]
decisions: [ADR-0012]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/Dockerfile"
  - "services/backend/entrypoint.sh"
  - "services/backend/.dockerignore"
---

## Bối cảnh
Nguồn: `infrastructure.md` §4, uv Docker guide. Image dùng chung cho `api` và `worker` (lệnh khác).

## Phạm vi
Làm:
- `services/backend/Dockerfile` 2 stage với `ghcr.io/astral-sh/uv:0.13`, `uv sync --locked --no-dev`, `UV_COMPILE_BYTECODE=1`, cài `libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0`, user `app`
- `entrypoint.sh`: `alembic upgrade head` (role migrator) rồi `exec` lệnh (`genetics api` / `genetics worker`)
- `.dockerignore`

Không làm:
- Không cài dev deps vào image

## Tiêu chí chấp nhận
1. Khi `docker build -f services/backend/Dockerfile .` · Thì thành công; `docker run --rm img id -u` ≠ 0
2. Khi chạy với Postgres trống · Thì entrypoint migrate tới head rồi `/healthz` 200
3. Khi import `weasyprint` trong container · Thì không lỗi thư viện hệ thống

## Ghi chú kỹ thuật
- Kích thước image mục tiêu < 400 MB

## Kiểm thử bắt buộc
- Build trong CI job `build`

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
