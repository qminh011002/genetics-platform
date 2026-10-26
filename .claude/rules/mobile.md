---
paths: ["apps/mobile/**"]
---
Áp dụng `docs/architecture/mobile.md`: outbox trước khi gửi, API trình duyệt chỉ trong `src/platform/`, không Expo / RN, màn nhập chạy offline, SW không cache `/api` (trừ reference) và không cache `auth-redirect.html`, không hứa khả năng ngoài ma trận §9. Test offline bằng `context.setOffline(true)` trong Playwright.
