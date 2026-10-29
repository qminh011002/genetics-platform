---
id: T0207
title: Mobile auth: adapter MSAL (localStorage, redirect, bridge), MLogin, màn "dùng web" cho Manager/Admin, giữ outbox khi phải đăng nhập lại
epic: E02
status: deferred
area: mobile
type: feature
priority: P0
size: M
depends_on: [T0404, T0202]
decisions: [ADR-0004, ADR-0011]
wireframes: [MLogin]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/src/platform/auth*.ts"
  - "apps/mobile/src/features/auth/**"
  - "apps/mobile/public/auth-redirect.html"
  - "apps/mobile/src/routes/login.tsx"
  - "apps/mobile/e2e/auth.spec.ts"
---

## Bối cảnh
Nguồn: `mobile.md` §3, §7.4; MSAL docs; board MLogin.

## Phạm vi
Làm:
- `src/platform/auth.ts` interface + `auth.msal.ts` (localStorage, redirect, bridge `public/auth-redirect.html`), `auth.dev.ts` khi `VITE_AUTH_MODE=dev`
- MLogin (nút Microsoft, hướng dẫn cài app, yêu cầu quyền camera lần đầu sau đăng nhập), màn "Tài khoản này dùng web trên máy tính" khi 403 `platform_not_allowed`
- Token provider cho mutator; 401 → silent → nếu fail: banner "Cần đăng nhập lại" và outbox giữ `pending` (không mất)

Không làm:
- Không SW ở task này (T0406)

## Tiêu chí chấp nhận
1. Cho dev mode · Khi chọn Manager · Thì màn "dùng web"
2. Cho MSW mock 401 sau khi có 2 item outbox · Thì item vẫn `pending`, banner hiện; sau đăng nhập lại → gửi tiếp (test với fake auth)
3. Cho staging Entra thật trên Android Chrome đã cài PWA · Khi đăng nhập · Thì quay lại app standalone (ghi kết quả thủ công; iOS ghi riêng)

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Vitest; thủ công thiết bị

## Câu hỏi
- 2026-10-28: chủ dự án hoãn mobile; W1 tập trung web + backend. Mở lại → đổi `status: todo` và cập nhật board.
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
