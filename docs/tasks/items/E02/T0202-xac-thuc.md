---
id: T0202
title: Xác thực: TokenVerifier Entra v2 (PyJWT JWKS, iss/aud/tid/exp, azp → platform), AUTH_MODE=dev, tạo app_user lần đầu, GET /me
epic: E02
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0201, T0303]
decisions: [ADR-0004]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/modules/identity/**"
  - "services/backend/src/genetics/shared_kernel/api/auth.py"
  - "services/backend/src/genetics/shared_kernel/infrastructure/entra.py"
  - "services/backend/tests/**/test_auth_*.py"
  - "services/backend/tests/**/test_me.py"
---

## Bối cảnh
Nguồn: `api-standards.md` §5, §5.1; `backend.md` §12; Microsoft Learn access-tokens / claims.

## Phạm vi
Làm:
- Port `TokenVerifier` + adapter `EntraTokenVerifier` (`PyJWKClient` cache 24 h, kiểm `iss`, `aud`, `tid`, `exp`, `azp` → `web|app` theo client id env) + `DevTokenVerifier` (chỉ `ENV=local`, header `X-Dev-User`)
- Dependency `current_actor`: tạo `app_user` từ `oid/email/name` nếu chưa có; không role → 403 `account_pending`; `is_active=false` → 403
- `GET /api/v1/me` theo §5.1 (role, platform, home, phone_home)
- 401 `unauthenticated` / `token_expired`; 403 `platform_not_allowed` khi role không có `web_access` / `app_access` tương ứng

Không làm:
- Không `/me/permissions` (T0203)

## Tiêu chí chấp nhận
1. Cho token JWT giả ký bằng khoá test (JWKS mock) với `azp` = web client id · Khi gọi `/me` · Thì 200 `platform: web`; `aud` sai → 401
2. Cho user mới chưa gán role · Thì 403 `account_pending` và dòng `app_user` được tạo
3. Cho Worker gọi `/me` bằng token web · Thì 403 `platform_not_allowed`
4. Khi `ENV=production` và `AUTH_MODE=dev` · Thì app từ chối khởi động

## Ghi chú kỹ thuật
- JWKS mock bằng `pytest-httpx` hoặc fixture khoá RSA tự sinh

## Kiểm thử bắt buộc
- pytest api + unit verifier

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
