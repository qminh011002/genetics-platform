---
id: T0302
title: Migrations nền: 0001 schemas + roles + extension, audit trigger, idempotency_key; Alembic async env với alembic_utils; test up/down/up
epic: E03
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0301]
decisions: [ADR-0003]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/alembic/**"
  - "services/backend/src/genetics/shared_kernel/infrastructure/**"
  - "services/backend/tests/integration/test_migrations.py"
---

## Bối cảnh
Migration là nguồn sự thật schema kể cả trigger. Nguồn: `backend.md` §7.3, §7.4, §8; `setup-guide.md` §3.

## Phạm vi
Làm:
- `alembic init -t async`; `env.py` đọc `MIGRATION_DATABASE_URL`, `include_schemas`, đăng ký `alembic_utils`
- `0001_schemas`: `CREATE SCHEMA core, auth, audit, analytics`; roles `app_rw`, `app_migrator`, `app_analytics_ro` (idempotent, mật khẩu từ env khi tạo lần đầu ở init SQL — migration chỉ GRANT)
- `0002_audit`: bảng `audit.audit_log` + function `audit.log_change()` (PGFunction) đọc `current_setting('app.user_id', true)`, `app.reason`, `app.request_id`; helper `attach_audit(table)` cho migration sau
- `0003_idempotency`: `core.idempotency_key`
- `0004_app_user`: `core.app_user` (entra_oid, email, display_name, role_id null tạm, is_active) + user hệ thống + attach audit
- Helper `ReplaceablePolicy` cho RLS (dùng ở T0204)
- Test integration: up → down → up trên testcontainers `postgres:18`; `alembic check` sạch

Không làm:
- Không bảng nghiệp vụ (E05), không RLS policy (T0204)

## Tiêu chí chấp nhận
1. Khi `alembic upgrade head` trên DB trống · Thì 4 schema, 3 role, bảng audit / idempotency / app_user tồn tại; `downgrade base` sạch; `upgrade head` lại xanh
2. Khi INSERT vào `core.app_user` với `set_config('app.user_id', …, true)` · Thì `audit.audit_log` có dòng `I` đúng actor
3. Khi `alembic check` · Thì không phát hiện thay đổi

## Ghi chú kỹ thuật
- `app_rw` không là owner; `GRANT USAGE` + DML trên `core`, `auth`; `SELECT` trên `analytics` cho `app_analytics_ro`

## Kiểm thử bắt buộc
- pytest integration (testcontainers)

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
