---
id: T0304
title: Session / UnitOfWork với set_config(app.*), Procrastinate app + worker + job ping + readyz hàng đợi, job đăng ký gọi use case
epic: E03
status: ready
area: backend
type: feature
priority: P0
size: L
depends_on: [T0302]
decisions: [ADR-0003, ADR-0005]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/shared_kernel/**"
  - "services/backend/src/genetics/jobs/**"
  - "services/backend/alembic/versions/0005_procrastinate_grants.py"
  - "services/backend/tests/integration/test_uow.py"
  - "services/backend/tests/integration/test_jobs.py"
---

## Bối cảnh
Nguồn: `backend.md` §7.2, §7.3, §10, §13; ADR-0005; tài liệu Procrastinate (connector psycopg async, periodic).

## Phạm vi
Làm:
- `shared_kernel/infrastructure/db.py`: engine `postgresql+psycopg`, `async_sessionmaker(expire_on_commit=False)`, pool mặc định + `pool_pre_ping`
- `UnitOfWork`: `async with` → BEGIN + `SELECT set_config('app.user_id'|'app.device'|'app.reason'|'app.request_id', …, true)`; `commit()`, `after_commit()`; `Actor` (`user_id, device, perms, system()`)
- Dependency `get_uow(actor)` (yield, không commit)
- `jobs/app.py`: Procrastinate `App(PsycopgConnector)`, schema apply ở entrypoint (`genetics worker --apply-schema`), job `ping`, periodic mẫu `heartbeat` mỗi 10 phút; job gọi use case với `Actor.system()`
- `/readyz` kiểm DB + bảng `procrastinate_jobs`
- `genetics worker` chạy worker; `genetics job run <name>`

Không làm:
- Không job nghiệp vụ thật (W2)

## Tiêu chí chấp nhận
1. Khi use case mở UoW với actor X · Thì trong transaction `current_setting('app.user_id')` = X và sau commit không còn (test integration)
2. Khi enqueue `ping` trong transaction rồi rollback · Thì job không tồn tại; commit → worker chạy `ping` trong < 5 s
3. Khi worker dừng · Thì `/readyz` vẫn 200 nếu bảng tồn tại (readyz kiểm schema, không kiểm worker sống — ghi rõ)
4. Khi 2 worker chạy · Thì periodic `heartbeat` chỉ chạy một lần mỗi chu kỳ

## Ghi chú kỹ thuật
- SQLAlchemy 2.1 autoflush trên text(): `set_config` phải là lệnh đầu tiên sau begin
- Procrastinate dùng pool riêng (psycopg_pool) cùng DATABASE_URL role `app_rw` (GRANT trên schema `procrastinate`)

## Kiểm thử bắt buộc
- pytest integration + test worker e2e nhỏ

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
