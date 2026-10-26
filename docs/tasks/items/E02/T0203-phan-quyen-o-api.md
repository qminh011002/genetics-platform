---
id: T0203
title: Phân quyền ở API: require(perm, scope, device) dependency, actor.require trong use case, GET /me/permissions với etag, cấm kiểm tên vai trò (CI grep)
epic: E02
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0202]
decisions: [ADR-0004]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/shared_kernel/api/**"
  - "services/backend/src/genetics/shared_kernel/application/actor.py"
  - "services/backend/src/genetics/modules/identity/api/**"
  - "scripts/ci/no-role-name-check.sh"
  - "services/backend/tests/api/test_permissions.py"
---

## Bối cảnh
Nguồn: `backend.md` §12, `api-standards.md` §5.1, §6.

## Phạm vi
Làm:
- `require(perm, scope='all', device=None)` → 403 `permission_denied` kèm `required_permission`, `scope`
- `Actor.require()` cùng logic (dùng từ use case / job)
- `GET /me/permissions`: `permissions{code:{scope}}`, `overrides[]`, `etag` (hash); `If-None-Match` → 304
- Script CI `scripts/ci/no-role-name-check.sh` grep `role.code ==` / `role == "` trong backend → fail
- Endpoint mẫu `GET /api/v1/_demo/protected` (chỉ `ENV=local`/test) để test

Không làm:
- Không RLS (T0204)

## Tiêu chí chấp nhận
1. Cho Manager · Khi gọi endpoint `require('stage.close')` · Thì 403 kèm `required_permission: stage.close`
2. Cho Executive với token app · Khi gọi endpoint `require('import.run', device='web')` · Thì 403
3. Khi `/me/permissions` với `If-None-Match` đúng · Thì 304
4. Khi thêm `if actor.role.code == 'admin'` · Thì CI script đỏ

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- pytest api

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
