---
id: T0303
title: Lỗi problem+json + danh mục mã lỗi, pagination cursor/offset, If-Match / ETag / version, test so khớp codes với packages/shared
epic: E03
status: ready
area: backend
type: feature
priority: P0
size: M
depends_on: [T0301, T0104]
decisions: [ADR-0007]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/shared_kernel/**"
  - "services/backend/tests/api/test_problem.py"
  - "services/backend/tests/unit/test_codes_match_shared.py"
---

## Bối cảnh
Nguồn: `api-standards.md` §7, §8, §10, ADR-0007.

## Phạm vi
Làm:
- `shared_kernel/api/problem.py`: handler `DomainError`, `RequestValidationError`, `HTTPException`, `Exception` → `application/problem+json` với `type, title, status, code, detail, trace_id, errors[], blockers[], required_permission, current_version, allowed[]`; `Accept-Language` vi/en cho title
- `shared_kernel/domain/errors.py`: `DomainError(code)` + subclass theo danh mục §7
- Middleware `X-Request-ID` (sinh / trả lại), `Cache-Control: no-store`
- `shared_kernel/api/pagination.py`: `Page`, cursor opaque (base64 json), `limit≤200`, `include_total`, `sort` parser (`-field`), `q`
- `If-Match` dependency → 428 / 412; helper `etag(version)`
- Schema `Problem` trong OpenAPI gắn mọi 4xx (helper `responses()`)
- Test `test_error_codes_match_shared`: đọc `packages/shared/src/codes.ts` và so với danh mục Python

Không làm:
- Không rate limit (W4)

## Tiêu chí chấp nhận
1. Khi gọi `/api/v1/does-not-exist` · Thì 404 `application/problem+json` có `code: not_found`, `trace_id`
2. Khi body thiếu trường bắt buộc · Thì 422 `validation_failed` với `errors[].field`
3. Khi PATCH không `If-Match` · Thì 428 `precondition_required`; lệch → 412 kèm `current_version`
4. Khi thêm mã lỗi mới chỉ ở Python · Thì test so khớp đỏ

## Ghi chú kỹ thuật
- `trace_id` ulid/uuid7; log structlog bind

## Kiểm thử bắt buộc
- pytest api

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
