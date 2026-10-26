---
id: T0108
title: Dockerfile web và mobile (pnpm fetch + build + nginx static)
epic: E01
status: todo
area: web
type: chore
priority: P0
size: S
depends_on: [T0401, T0404]
decisions: [ADR-0012]
wireframes: []
owner: claude-web
allowed_paths:
  - "apps/web/Dockerfile"
  - "apps/web/.dockerignore"
  - "apps/mobile/Dockerfile"
  - "apps/mobile/.dockerignore"
---

## Bối cảnh
Hai image static giống nhau; mobile cần `sw.js` ở gốc `/app`. Nguồn: `infrastructure.md` §4, pnpm Docker guide.

## Phạm vi
Làm:
- `apps/web/Dockerfile`, `apps/mobile/Dockerfile`: stage build `node:22` + pnpm (`pnpm fetch` → `install --frozen-lockfile --filter <app>...` → `turbo run build --filter <app>`), stage `nginx:1.27-alpine` copy `dist/`, config SPA fallback; `.dockerignore`
- Mobile: nginx `location /app` với `try_files … /app/index.html`, header `Service-Worker-Allowed: /app/`

Không làm:
- Không build mobile và web trong một image

## Tiêu chí chấp nhận
1. Khi build hai image từ gốc repo · Thì thành công; `curl localhost/` trả `index.html`; `curl localhost/app/sw.js` trả JS
2. Khi mở `/app/batches/x` trực tiếp · Thì nhận `index.html` của mobile (fallback)

## Ghi chú kỹ thuật
- Build arg `VITE_API_URL`, `VITE_*` client id truyền lúc build (không secret)

## Kiểm thử bắt buộc
- CI job `build`

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
