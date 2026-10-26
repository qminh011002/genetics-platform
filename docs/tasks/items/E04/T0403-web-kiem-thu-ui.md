---
id: T0403
title: Web kiểm thử UI: Playwright e2e (dev login) + axe trên route smoke + visual baseline gallery trong Docker image pin + size-limit; script test:e2e / test:visual ở root
epic: E04
status: todo
area: web
type: test
priority: P0
size: M
depends_on: [T0401, T0402, T0206]
decisions: [ADR-0013]
wireframes: []
owner: claude-web
allowed_paths:
  - "apps/web/playwright.config.ts"
  - "apps/web/e2e/**"
  - "apps/web/.size-limit.json"
  - "package.json (script)"
  - "scripts/ci/playwright-docker.sh"
---

## Bối cảnh
Nguồn: `quality-standards.md` §2.2, `web.md` §8.3–8.4, §11; Playwright docs (docker, snapshots, accessibility).

## Phạm vi
Làm:
- `playwright.config.ts`: projects chromium; `webServer` (vite preview hoặc compose profile test); `snapshotPathTemplate`; `expect.toHaveScreenshot` `maxDiffPixelRatio 0.01`
- `e2e/smoke.spec.ts`: đăng nhập dev → `/home` → mở từng route có trong nav → axe (wcag2a/2aa/21aa) 0 serious/critical
- `e2e/visual.spec.ts`: `/__gallery` từng section + `/home`
- Script root `test:e2e`, `test:visual` chạy trong `mcr.microsoft.com/playwright:v1.64.1-noble` qua docker; `size-limit` config (250 KB gzip)

Không làm:
- Không e2e nghiệp vụ (W2)

## Tiêu chí chấp nhận
1. Khi chạy `pnpm test:visual` lần đầu · Thì tạo baseline; lần hai xanh; đổi màu nút → đỏ
2. Khi thêm `<img>` không alt vào Home · Thì axe fail
3. Khi bundle vượt 250 KB · Thì `size-limit` báo (fail từ Harden)

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Chính là test

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
