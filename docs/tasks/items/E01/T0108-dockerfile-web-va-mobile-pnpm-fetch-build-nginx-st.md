---
id: T0108
title: Dockerfile web (pnpm fetch + build + nginx static)
epic: E01
status: todo
area: web
type: chore
priority: P0
size: S
depends_on: [T0401]
decisions: [ADR-0012]
wireframes: []
owner: claude-web
allowed_paths:
  - "apps/web/Dockerfile"
  - "apps/web/.dockerignore"
---

## Bối cảnh
Image static cho web. (Phần mobile hoãn cùng mobile — làm lại theo cùng mẫu khi mở T0404.) Nguồn: `infrastructure.md` §4, pnpm Docker guide.

## Phạm vi
Làm:
- `apps/web/Dockerfile`: stage build `node:22` + pnpm (`pnpm fetch` → `install --frozen-lockfile --filter <app>...` → `turbo run build --filter <app>`), stage `nginx:1.27-alpine` copy `dist/`, config SPA fallback; `.dockerignore`

Không làm:
- Không làm Dockerfile mobile (hoãn; khi làm: nginx `location /app` với `try_files … /app/index.html`, header `Service-Worker-Allowed: /app/`, không chung image với web)

## Tiêu chí chấp nhận
1. Khi build image web từ gốc repo · Thì thành công; `curl localhost/` trả `index.html`
2. Khi mở `/strains` trực tiếp · Thì nhận `index.html` (SPA fallback)

## Ghi chú kỹ thuật
- Build arg `VITE_API_URL`, `VITE_*` client id truyền lúc build (không secret)

## Kiểm thử bắt buộc
- CI job `build`

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
