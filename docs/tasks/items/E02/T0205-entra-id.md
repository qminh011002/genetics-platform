---
id: T0205
title: Entra ID: 3 app registration (API scope v2, web SPA, mobile SPA), admin consent, redirect URI local/staging, điền env
epic: E02
status: ready
area: infra
type: chore
priority: P0
size: S
depends_on: []
decisions: [ADR-0004]
wireframes: []
owner: human
allowed_paths:
  - "(ngoài repo: GitHub / Entra)"
---

## Bối cảnh
OQ-3a: cần IT Entobel hoặc người có quyền trên tenant. Có thể làm song song; local dùng `AUTH_MODE=dev` cho tới khi xong. Nguồn: `setup-guide.md` §8.

## Phạm vi
Làm:
- API: `genetics-platform-api`, Application ID URI `api://genetics-platform-api`, scope `access_as_user`, `requestedAccessTokenVersion: 2`
- Web SPA: redirect `http://localhost:5173/auth-redirect.html`, `https://<staging>/auth-redirect.html`; Mobile SPA: `http://localhost:5174/auth-redirect.html`, `https://<staging>/app/auth-redirect.html`; delegated permission tới scope API; admin consent
- Ghi 4 giá trị client/tenant id vào `infra/.env` staging (không commit); cập nhật `open-questions.md` OQ-3a

Không làm:
- Không dùng implicit flow
- Không secret client (SPA public)

## Tiêu chí chấp nhận
1. Khi đăng nhập web staging · Thì token có `aud` = API client id, `ver` 2.0, `azp` = web client id (kiểm bằng jwt.ms)

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Thủ công, ảnh chụp vào task file

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
