---
id: T0502
title: Strains API: GET /strains (cursor, q, sort), POST /strains (quyền strain.create), PATCH /strains/{id} (If-Match), GET /strains/{id}; use case + test + schemathesis
epic: E05
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0501, T0203, T0303, T0305]
decisions: [ADR-0002]
wireframes: [Strains]
owner: codex
allowed_paths:
  - "services/backend/src/genetics/modules/reference/**"
  - "services/backend/tests/**/test_strains*.py"
  - "contracts/openapi/openapi.json"
  - "packages/api-client/src/generated/**"
---

## Bối cảnh
Lát dọc mẫu backend — mọi task backend sau sao chép cấu trúc này. Nguồn: `backend.md` §10, §11, §15, §17; `api-standards.md` §3, §10, §14.

## Phạm vi
Làm:
- Use case `ListStrains` (query), `GetStrain`, `CreateStrain` (require `strain.create`), `UpdateStrain` (require `strain.edit`, `If-Match`); router tên hàm `reference_list_strains`, `reference_get_strain`, `reference_create_strain`, `reference_update_strain`; schema Pydantic có `examples`; `can` block (`edit`)
- Test: unit use case (fake repo: thành công, thiếu quyền, trùng mã), API (200/201/403/409/412/422 cho 4 vai trò), schemathesis xanh; export OpenAPI + commit `contracts/`

Không làm:
- Không xoá strain (chỉ `is_active`)

## Tiêu chí chấp nhận
1. Cho Executive · Khi POST `{code:'tma', name:'…'}` · Thì 201, code lưu `TMA`, audit có dòng I với actor
2. Cho Manager · Khi POST · Thì 403 `permission_denied` `required_permission: strain.create`
3. Cho Worker token app · Khi GET /strains · Thì 200 (strain.view both device)
4. Khi PATCH với `If-Match` cũ · Thì 412; đúng → 200 `version` +1 và audit U
5. Khi `pnpm contract:check` · Thì xanh và SDK có `useReferenceListStrains`

## Ghi chú kỹ thuật
- Docstring use case ghi nguồn luật (`overview.md` §6.2, INV-10 Adds only)

## Kiểm thử bắt buộc
- pytest unit + api + contract

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
