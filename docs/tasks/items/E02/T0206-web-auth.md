---
id: T0206
title: Web auth: MSAL redirect flow + bridge page, AuthGate / PlatformGate, Login, WorkerDesktop, NoAccess, dev login khi VITE_AUTH_MODE=dev, xử lý 401/403 chung
epic: E02
status: todo
area: web
type: feature
priority: P0
size: M
depends_on: [T0401, T0202, T0203]
decisions: [ADR-0004]
wireframes: [Login, WorkerDesktop, NoAccess]
owner: claude-web
allowed_paths:
  - "apps/web/src/app/auth/**"
  - "apps/web/src/features/auth/**"
  - "apps/web/public/auth-redirect.html"
  - "apps/web/src/routes/login.tsx"
  - "apps/web/src/routes/worker.tsx"
  - "apps/web/src/routes/no-access.tsx"
  - "apps/web/src/app/query-client.ts"
  - "apps/web/e2e/auth.spec.ts"
---

## Bối cảnh
Nguồn: `web.md` §3 (MSAL), §7.4; `api-standards.md` §5; MSAL docs (redirect, bridge, sessionStorage); board Login / WorkerDesktop / NoAccess.

## Phạm vi
Làm:
- `app/auth/msal.ts` (`PublicClientApplication`, `cacheLocation: sessionStorage`, `handleRedirectPromise` mỗi lần tải), `public/auth-redirect.html` (bridge same-origin), `useAccessToken`, `tokenProvider` cho mutator
- `AuthGate` (router context `auth`, `beforeLoad` redirect `/login`), `PlatformGate` (403 `platform_not_allowed` → `/worker`), `account_pending` → `/no-access` với nút "Gửi yêu cầu" (gọi `POST /access-requests` nếu có, else mailto)
- Pages: Login (nút Microsoft; dev: chọn vai trò khi `VITE_AUTH_MODE=dev` đặt header `X-Dev-User`), WorkerDesktop (QR tới `PUBLIC_MOBILE_URL`), NoAccess
- `query-client.ts`: 401 → `acquireTokenSilent` + retry 1 lần → `loginRedirect`; 403 permission → toast + invalidate `/me/permissions`

Không làm:
- Không màn Home thật (T0402 placeholder)

## Tiêu chí chấp nhận
1. Cho `VITE_AUTH_MODE=dev` · Khi chọn "Worker" · Thì chuyển `/worker` (WorkerDesktop); chọn "Executive" → `/home`
2. Cho MSW mock `/me` 403 `account_pending` · Thì màn NoAccess
3. (hoãn tới T0205) Cho staging với Entra thật · Khi đăng nhập · Thì `GET /me` 200 và reload trang không phải đăng nhập lại (sessionStorage)
4. Khi token hết hạn (mock 401 `token_expired`) · Thì refresh một lần rồi request thành công

## Ghi chú kỹ thuật
- Bridge page không được SW / cache; không COOP header

## Kiểm thử bắt buộc
- Vitest + MSW; e2e dev login

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
