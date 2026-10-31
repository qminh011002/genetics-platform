---
id: T0303
title: Lỗi problem+json + danh mục mã lỗi, pagination cursor/offset, If-Match / ETag / version, test so khớp codes với packages/shared
epic: E03
status: in_review
area: backend
type: feature
priority: P0
size: M
depends_on: [T0301, T0104]
decisions: [ADR-0007]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/bootstrap/app.py"
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
- Đã giải quyết (2026-10-31): người dùng trả lời `yes`, cho phép bổ sung `services/backend/src/genetics/bootstrap/app.py` vào `allowed_paths` để đăng ký handler/middleware từ shared_kernel.

## Kết quả
- PR: đang mở từ `backend/dev` vào `web/dev` (sẽ cập nhật URL).
- `domain/errors.py`: 29 mã HTTP + subclass, 12 blocker, 7 field code; domain chỉ dùng stdlib.
- `api/problem.py`, `api/titles.py`: handler DomainError / RequestValidationError / HTTPException / Exception, Problem schema + helper responses cho mọi HTTP 4xx chuẩn; title vi/en dùng nội dung shared i18n, hỗ trợ quality của Accept-Language. Lỗi 5xx không trả detail hoặc extension đầu vào.
- Middleware ASGI bind/reset structlog trace_id, sinh UUIDv7 trên Python 3.13 hoặc trả lại X-Request-ID đầu vào; mọi response có Cache-Control: no-store, kể cả 500.
- `api/pagination.py`: Page bỏ total khi không có, cursor base64 JSON, limit 1..200, offset page/page_size + total, include_total, q, sort allowlist.
- `api/concurrency.py`: require_if_match → IfMatch.check(current_version), helper etag; thiếu header → 428, lệch / ETag yếu → 412 với current_version.
- Bootstrap đăng ký middleware/handler và response schemas trên router `/api/v1`; không thêm endpoint nghiệp vụ hoặc dependency.

### Tiêu chí chấp nhận và kiểm chứng
1. `test_real_app_404`: app thực tế trả 404 problem+json/not_found, trace_id UUIDv7 đồng nhất với header.
2. `test_validation_field_errors`: body thiếu name và count ngoài giới hạn → 422 validation_failed; errors có field/code, không echo dữ liệu đầu vào.
3. `test_if_match`: thiếu → 428; lệch / yếu / không trích dẫn / wildcard → 412 + current_version=3; đúng → 200 + ETag.
4. `test_error_codes_match_shared` so chính xác mã và HTTP status; `test_python_only_code_is_detected` thêm mã Python trong monkeypatch, xác nhận test so khớp phát AssertionError. Hai danh mục blocker/field cũng được so với TS.
- Test bổ sung: mọi mã lỗi, title vi/en, HTTP headers, lỗi 500 không lộ exception, structlog không rò context giữa request, schema Problem cho mọi 4xx, cursor/offset/sort/q/total và query sai.

### Lệnh và kết quả
- `uv run --project services/backend pytest services/backend/tests/api services/backend/tests/unit`: **77 passed**.
- `pnpm ci`: pnpm 12 coi đây là alias cài đặt; đã chạy script gate bằng `pnpm run ci`.
- Lượt CI đầu: **77 passed, 16 errors** ở migration vì không có Docker. Không tắt hoặc skip test.
- Dùng PostgreSQL **18** cài sẵn, cluster tạm `/tmp/t0303-postgres`, chỉ lắng nghe localhost:55433, database `test_t0303`, bootstrap role bằng script infra với mật khẩu test trong fixture. Turbo strict lọc TEST_POSTGRES_URL, nên truyền `TURBO_ENV_MODE=loose` khi chạy local.
- `TURBO_ENV_MODE=loose TEST_POSTGRES_URL=postgresql+psycopg://postgres@127.0.0.1:55433/test_t0303 pnpm run ci`: **exit 0**, format:check, check:catalog, lint, typecheck, test, contract:check, build đều xanh. Backend **93 passed**, import-linter **19 kept, 0 broken**, mypy **101 source files**; frontend packages **151 tests passed**.
- `contract:check` xuất OpenAPI với paths rỗng (chưa có endpoint nghiệp vụ), api-client chưa có nên generate no-op. Đã xoá đúng output tạm chưa được track, không sửa file sinh tay; T0305/T0306 quản lý hợp đồng/SDK.
- `git diff --check`: xanh.

## Còn lại
- Chờ CI GitHub và một review người; squash merge PR vào web/dev. Claude chạy pnpm generate sau merge theo AGENTS.md.
- Không còn phần hiện thực T0303; không rate limit, auth hoặc endpoint nghiệp vụ.

## Lệnh để tiếp tục
```sh
cd /home/qminh/company_project/gp-backend
gh pr checks --watch
# Sau khi PR được review/merge vào web/dev, trước task backend kế tiếp:
git merge web/dev
```
