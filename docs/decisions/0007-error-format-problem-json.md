# ADR-0007 · Lỗi API theo RFC 9457 (`application/problem+json`) với `code` ổn định

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
Client (web, mobile, outbox) rẽ nhánh theo mã lỗi (`gate_not_met`, `batch_closed`, `duplicate_id`, `version_conflict`, `reason_required`…) và dịch thông báo; FastAPI mặc định chỉ có `{"detail": ...}` và **không có** hỗ trợ RFC 9457 trong tài liệu chính thức (chỉ package bên thứ ba).

## Phương án
| | Mặc định FastAPI `{detail}` | Package bên thứ ba (`fastapi-problem`) | **Tự viết handler problem+json** |
|---|---|---|---|
| `code` ổn định, `blockers[]`, `errors[]`, `trace_id` | không | tuỳ package | có, đúng nhu cầu |
| Phụ thuộc | — | package nhỏ, bảo trì không rõ | ~100 dòng trong `shared_kernel/api/problem.py` |

## Quyết định đề xuất
Tự viết: handler cho `DomainError`, `RequestValidationError`, `HTTPException`, exception chung → `JSONResponse(media_type="application/problem+json")` với `type`, `title`, `status`, `code`, `detail`, `trace_id`, mở rộng `blockers[]`, `errors[]`, `required_permission`, `current_version`, `allowed[]`. Danh mục `code` ở `api-standards.md` §7 và `packages/shared/src/codes.ts`; test backend so khớp hai nơi; schema Problem khai báo trong OpenAPI cho mọi 4xx (Spectral rule).

## Hệ quả
Client đọc `code` → i18n; không hiển thị `detail` thô; `trace_id` hiện dòng nhỏ. Thêm mã mới = sửa 3 nơi trong cùng PR (có test bắt).

## Tham chiếu
RFC 9457; FastAPI handling-errors (xác nhận không có problem+json) — `research-references.md` §A.
