---
id: T0201
title: Schema auth: role, permission, role_permission, user_permission, user_scope + seed 4 vai trò và danh mục quyền; auth.has_perm()
epic: E02
status: ready
area: backend
type: feature
priority: P0
size: L
depends_on: [T0302]
decisions: [ADR-0004]
wireframes: [RolePerms]
owner: codex
allowed_paths:
  - "services/backend/alembic/versions/0006_auth.py"
  - "services/backend/src/genetics/modules/identity/**"
  - "services/backend/src/genetics/modules/reference/infrastructure/orm.py (form_def)"
  - "services/backend/tests/**/test_auth_*.py"
---

## Bối cảnh
Quyền là dữ liệu. Nguồn: `backend.md` §12, `overview.md` §2, danh mục quyền `backend.md` (bản 1.0 §8.2 — giữ nguyên nội dung) , blueprint tab Phân quyền.

## Phạm vi
Làm:
- Migration `0006_auth`: bảng theo blueprint (role is_system, web_access, app_access, phone_home jsonb, web_home; permission(code, area, action, kind, form_code); role_permission(scope, device); user_permission(effect, scope, batch_id, valid_until, reason, granted_by); user_scope); FK `app_user.role_id`; attach audit
- Seed trong migration: 4 vai trò, `form_def` 13 mã (bảng `core.form_def` tạo ở đây vì permission tham chiếu), danh mục quyền đầy đủ theo ma trận W/E/M/A
- SQL function `auth.has_perm(perm text, scope text) returns boolean STABLE` đọc `app.user_id`, `app.device`, hợp vai trò ∪ grant − deny còn hạn, deny thắng (PGFunction qua alembic_utils)
- Domain `identity`: `PermissionSet` (Python) + `effective_permissions(user)` query — logic trùng với SQL, test parity

Không làm:
- Không endpoint (T0202/T0203), không RLS policy (T0204)

## Tiêu chí chấp nhận
1. Khi seed xong · Thì `SELECT count(*) FROM auth.permission` = số dòng danh mục; Worker có `egg_collection.add` device both; Manager không có `platform.app`
2. Khi user Worker có `user_permission grant larvae_observation.add batch X valid_until hôm qua` · Thì `has_perm` false; còn hạn → true
3. Khi có deny và grant cùng quyền · Thì false
4. Parity: với 20 user giả, `has_perm` SQL == `PermissionSet.has` Python cho mọi mã quyền

## Ghi chú kỹ thuật
- Mã quyền và `form_def` phải khớp `packages/shared` (test như T0303)

## Kiểm thử bắt buộc
- pytest integration (SQL) + unit (Python) + parity

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
