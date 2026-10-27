---
id: T0302
title: Migrations nền: 0001 schemas + roles + extension, audit trigger, idempotency_key; Alembic async env với alembic_utils; test up/down/up
epic: E03
status: done
area: backend
type: feature
priority: P0
size: M
depends_on: [T0301]
decisions: [ADR-0003]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/alembic.ini"
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
- Đã giải quyết: người dùng cho phép thêm `services/backend/alembic.ini` vào `allowed_paths` và xác nhận hoàn tất T0302 trong phiên này.

## Kết quả (điền khi xong)
- PR: [#5](https://github.com/qminh011002/genetics-platform/pull/5) (draft, chờ kiểm testcontainers trên Docker).
- Worktree: `/tmp/genetics-platform-T0302`; base `main` đã có T0301 (`a19aad9`).
- Đã thêm cấu hình Alembic async đọc `MIGRATION_DATABASE_URL` qua Settings, `include_schemas`, metadata và đăng ký PGFunction/PGTrigger/PGView cho autogenerate. URL truyền trực tiếp vào engine, không qua nội suy INI (test password chứa `%`).
- `0001_schemas`: bốn schema thuộc `app_migrator`, quyền theo schema; thu hẹp default privileges rộng từ init infra, chặn sửa bảng phiên bản Alembic, giữ SELECT cho CLI `genetics db-current`. Role/mật khẩu do init infra tạo, migration không tạo/xóa role. PostgreSQL 18 có sẵn `gen_random_uuid()`, không cần extension pgcrypto (backend §7.6, overview §6.3).
- `0002_audit`: audit_log, index tra theo bảng/id, PGFunction SECURITY DEFINER với search_path cố định; lưu actor/device/reason/request, ảnh cũ/mới và action I/U/D. App chỉ đọc log, trigger ghi dưới quyền owner.
- `0003_idempotency`: khóa `(key, user_id)`, hash/response JSONB/timestamp và index cho user/cleanup 72 giờ; FK user bổ sung ở `0004`.
- `0004_app_user`: identity nền, role_id nullable chờ T0201, user hệ thống `00000000-0000-0000-0000-000000000001`, audit trigger và seed idempotent. Seed khôi phục audit context sau khi chạy.
- `attach_audit` / `detach_audit`, mô tả PGTrigger dùng lại cho env; helper `ReplaceablePolicy` create/drop/replace, kiểm thử khôi phục định nghĩa cũ. Không thêm RLS policy nghiệp vụ.
- Metadata hiện tại độc lập với định nghĩa bảng trong revision; function `audit_v1.py` được giữ nguyên sau merge, phiên bản sau dùng file/revision mới. Hướng dẫn chạy và giới hạn downgrade nằm trong `services/backend/alembic/README`.

### Tiêu chí chấp nhận và bằng chứng
| Tiêu chí | Test / bước kiểm | Kết quả |
|---|---|---|
| 1. Schema, role, bảng; up/down/up | `test_upgrade_downgrade_upgrade_and_check`: kiểm 4 schema, 3 role không superuser/BYPASSRLS, owner, bảng, seed duy nhất, downgrade sạch rồi upgrade lại | PASS trên PostgreSQL 18 |
| 2. INSERT audit đúng actor | `test_app_role_audits_insert_update_delete_with_context`: đăng nhập app_rw, set_config, kiểm I/U/D, actor, reason/device/request, old/new; context không rò sang transaction sau | PASS |
| 3. alembic check sạch | `command.check` sau cả hai lượt upgrade; test drift cố ý đổi cột/default/function hoặc xóa trigger phải phát hiện | PASS |
| Bổ sung | Rollback audit cùng dữ liệu; cấm sửa/xóa/chèn/truncate audit và tắt trigger; app_rw đọc nhưng không sửa phiên bản Alembic; quyền bảng mới theo schema; analytics chỉ đọc; uniqueness/FK idempotency; ReplaceablePolicy create/replace/restore/drop | PASS |

### Lệnh kiểm và kết quả
```text
TEST_POSTGRES_URL=postgresql+psycopg://postgres@127.0.0.1:55432/test_t0302 \
  uv run pytest -m integration tests/integration/test_migrations.py -q
16 passed

TEST_POSTGRES_URL=postgresql+psycopg://postgres@127.0.0.1:55432/test_t0302 \
  TURBO_ENV_MODE=loose pnpm run ci
exit 0: format:check, check:catalog, lint, typecheck, test, contract:check, build
backend: 24 passed in 1.86s (16 integration + 8 tests có sẵn)
design-tokens: 56 passed; shared: 49 passed
ruff: All checks passed, 109 files already formatted
import-linter: 19 kept, 0 broken
mypy: Success: no issues found in 96 source files

uv run alembic upgrade head --sql
exit 0, xuất SQL đủ bốn revision
uv run alembic heads
0004_app_user (head)
git diff --check
exit 0
```
- Máy không có Docker daemon/client: đã chạy cùng bộ test integration trên cluster PostgreSQL 18 riêng trong `/tmp`, bootstrap bằng đúng `infra/postgres/init/01-roles.sh`. Nhánh test mặc định dùng testcontainers `postgres:18` và mount init script, nhưng chưa được chạy tại máy này. Không skip test và không dùng dữ liệu production.
- `TURBO_ENV_MODE=loose` chỉ dùng cho lượt kiểm để truyền URL database test qua Turbo; không đổi cấu hình repo.
- Gate contract exit 0 nhưng SDK chưa có (`No projects matched @genetics/api-client`, phụ thuộc T040x); không thay API. File OpenAPI tạm sinh bởi gate được dọn, không đưa vào PR.
- Không thêm dependency, không sửa file sinh tay, không sửa migration đã merge.

### Còn lại
- ~~Chạy lại nhánh testcontainers trên CI có Docker~~ — xong 2026-10-27 (Planner, PR tạm #7 gộp workflow T0105): 11 check CI xanh; `test-backend` 24 passed, 16 test `test_migrations.py` trên testcontainers `postgres:18`, coverage 88 %.
- GitGuardian báo "Generic Password" ở `tests/integration/test_migrations.py:31` (mật khẩu giả cho container test) → đánh dấu false positive trên dashboard GitGuardian.
- Downgrade xóa dữ liệu trong bốn schema; giữ role/password, bảng alembic_version rỗng và global defaults đã thu hẹp. Không dùng CASCADE. Không có thay đổi bảng nghiệp vụ hoặc RLS policy.

### Lệnh để tiếp tục
```bash
cd /tmp/genetics-platform-T0302/services/backend
# Máy có Docker: bỏ override để chạy đúng nhánh testcontainers mặc định.
unset TEST_POSTGRES_URL
uv run pytest -m integration tests/integration/test_migrations.py
cd ../..
pnpm run ci
```
