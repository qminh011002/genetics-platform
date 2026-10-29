---
id: T0406
title: Mobile PWA: vite-plugin-pwa injectManifest (sw.ts routes), manifest, icons/screenshots, install (Android prompt / iOS hướng dẫn), cập nhật "Có bản mới" không reload khi đang nhập, e2e PWA offline + axe
epic: E04
status: deferred
area: mobile
type: feature
priority: P0
size: M
depends_on: [T0404, T0405]
decisions: [ADR-0010]
wireframes: [MLogin, MProfile]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/vite.config.ts"
  - "apps/mobile/src/sw/**"
  - "apps/mobile/src/platform/install.ts"
  - "apps/mobile/src/features/profile/**"
  - "apps/mobile/public/**"
  - "apps/mobile/e2e/**"
  - "apps/mobile/playwright.config.ts"
---

## Bối cảnh
Nguồn: `mobile.md` §7, §11; vite-plugin-pwa docs; Workbox docs.

## Phạm vi
Làm:
- `vite.config.ts` `VitePWA({ strategies:'injectManifest', srcDir:'src/sw', filename:'sw.ts', registerType:'prompt', manifest:{…§7.1}, injectManifest:{ globPatterns:['**/*.{js,css,html,woff2,wasm,png,svg}'] } })`
- `src/sw/sw.ts`: precache + `createHandlerBoundToURL('/app/index.html')`, SWR cho `form-defs|strains|containers|me`, NetworkOnly API + `auth-redirect.html`
- `platform/install.ts`: `beforeinstallprompt` capture + nút cài (MProfile / MLogin); iOS: hướng dẫn khi `!navigator.standalone`
- `useRegisterSW` → toast "Có bản mới · Tải lại"; hoãn nếu `drafts` hoặc outbox `sending`
- `e2e/pwa.spec.ts`: tải → `serviceWorker.ready` → `context.setOffline(true)` → reload → shell hiện; `e2e/a11y.spec.ts`
- `public/icons`, `screenshots`, `apple-touch-icon`

Không làm:
- Không push (OQ-12)

## Tiêu chí chấp nhận
1. Khi `pnpm --filter @genetics/mobile build` · Thì `dist/sw.js` chứa precache mọi chunk JS (test đọc manifest), `dist/manifest.webmanifest` hợp lệ (schema)
2. Khi offline sau lần tải đầu · Thì `/app/` và `/app/tasks` render shell; API trả lỗi mạng được UI xử lý
3. Khi có SW mới và đang có draft · Thì không reload; sau khi lưu draft → reload khi bấm
4. Khi chạy Lighthouse thủ công · Thì installable (ghi kết quả, không gate)

## Ghi chú kỹ thuật
- `base: '/app/'` trong Vite vì nginx phục vụ ở `/app`

## Kiểm thử bắt buộc
- Playwright profile Pixel 7 + iPhone 15; Vitest cho install adapter

## Câu hỏi
- 2026-10-28: chủ dự án hoãn mobile; W1 tập trung web + backend. Mở lại → đổi `status: todo` và cập nhật board.
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
