---
id: T0307
title: Harness test backend: testcontainers postgres:18 fixture, LifespanManager, httpx ASGITransport client theo vai trò (dev auth), fixture legacy rỗng
epic: E03
status: todo
area: backend
type: test
priority: P0
size: S
depends_on: [T0302, T0303]
decisions: [ADR-0013]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/tests/**"
  - "services/backend/pytest.ini"
---

## Bối cảnh
Mọi test sau dùng chung. Nguồn: `backend.md` §16, `quality-standards.md` §2.2, nghiên cứu httpx / testcontainers.

## Phạm vi
Làm:
- `tests/conftest.py`: `pg` session-scope (`PostgresContainer('postgres:18', driver=None)` → URL psycopg), chạy `alembic upgrade head`, `truncate` giữa test; `app` với `LifespanManager`; `client(role)` dùng `AUTH_MODE=dev` header `X-Dev-User`
- Marker `unit / integration / api / contract / slow`; `pytest.ini` asyncio mode auto
- `tests/fixtures/legacy/README.md` (dữ liệu từ F-0004 sẽ vào sau)

Không làm:
- Không mock DB trong integration

## Tiêu chí chấp nhận
1. Khi `uv run pytest -m unit` · Thì không cần Docker; `-m integration` · Thì kéo container một lần cho cả session
2. Khi test lỗi giữa chừng · Thì bảng được truncate, test kế không bị ảnh hưởng

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Tự kiểm

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
