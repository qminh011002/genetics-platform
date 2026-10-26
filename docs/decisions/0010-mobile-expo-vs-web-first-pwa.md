# ADR-0010 · Mobile PWA: web-first (Vite + React + shadcn + vite-plugin-pwa) thay Expo + React Native Web

- Trạng thái: **Accepted** (chủ dự án duyệt qua trao đổi 26/10/2026) · Ngày: 2026-10-26 · **Chọn phương án B (web-first)**

## Bối cảnh
Mục tiêu v1: app điện thoại **cài được dạng PWA**, không qua store, offline-first, quét QR, dùng ở khu nuôi Wi-Fi yếu (overview §1.2, mobile.md §1). Bản 1.0 chọn Expo + RN Web để "giữ đường lui native". Nghiên cứu 26/10/2026 (nguồn chính thức, `research-references.md` §E):
- Expo SDK 58: **không sinh manifest / service worker**; hướng dẫn PWA của Expo là viết manifest tay + chạy `workbox-cli` trên `dist/`, kèm cảnh báo SW "gây hành vi bất ngờ" và "khuyến nghị build native nếu cần offline tốt". `web.output` mặc định đổi → phải đặt `single` tường minh. Async routes mặc định trên web (nhiều chunk cần precache).
- React Native Web 0.21: FlatList "basic support, not optimized for the web"; KeyboardAvoidingView mock; `expo-secure-store`, `expo-notifications` không có web.
- NativeWind stable 4.2 = Tailwind 3 (web dùng Tailwind 4); NativeWind 5 RC "không dành cho production". React Native Reusables: web support chưa xác minh.
- MSAL 5 cần trang redirect bridge riêng (được với cả hai).
- Web-first: `vite-plugin-pwa` 2 sinh manifest + SW + registration; Capacitor 8 là đường bọc native sau ("first-class support for PWA and native").

## Động lực
Giảm rủi ro cho mục tiêu PWA; tốc độ làm của agent (cùng stack với web); giữ khả năng native nếu đó là mục tiêu thật; tránh hứa điều trình duyệt không làm được.

## Phương án
| Tiêu chí | A · Expo + RN Web (giữ) | B · Vite + React + shadcn + vite-plugin-pwa |
|---|---|---|
| Đạt mục tiêu PWA v1 | Đạt, với lớp dán thủ công (Workbox CLI, manifest, safe-area CSS, adapter) | Đạt với tool first-party |
| Native sau này | EAS build cùng codebase (đổi adapter `platform/`) | Capacitor bọc; hoặc viết Expo app riêng dùng chung `@genetics/*` |
| Dùng chung với web | token (2 định dạng), api-client, shared, schema; **không** component | token, api-client, shared, schema, **và** `components/ui` + một phần `common` |
| Chất lượng UI mobile | RN primitives + gesture-handler / reanimated web (độ tin cậy từng phần) | DOM + CSS; thiếu "cảm giác native" ở chuyển cảnh trừ khi làm tay (View Transitions React 19.3 giúp một phần) |
| Điểm chưa xác minh | Expo Router tabs trên web, reusables web, NativeWind 4 ↔ SDK 58 | ít |
| Công agent | hai stack (RN + DOM) | một stack |
| Chi phí chuyển đổi nếu chọn sai | A→B: viết lại UI mobile (~34 màn) | B→native: Capacitor (thấp) hoặc viết lại (cao) |

## Quyết định
**B — web-first PWA.** `apps/mobile` là ứng dụng Vite + React 19 + TanStack Router dùng chung `packages/ui` (shadcn, Base UI, Tailwind 4), `@genetics/design-tokens`, `@genetics/api-client`, `@genetics/shared` với web; `vite-plugin-pwa` (`injectManifest`); `platform/` giữ interface để thay adapter khi bọc Capacitor. Expo / React Native Web / NativeWind / Reusables không dùng. `mobile.md` đã viết lại theo B.

## Hệ quả theo từng lựa chọn
- A: thêm task init: Workbox CLI pipeline, `public/index.html` với meta Apple, safe-area CSS, verify Expo Router web tabs, verify reusables web; design-tokens xuất Tailwind 3.
- B: `apps/mobile` là Vite app; tách `packages/ui` (shadcn monorepo) để web + mobile dùng chung; bỏ NativeWind / Reusables; `platform/` giữ interface.

## Điều kiện xem lại
Sau 6 tháng vận hành: nếu phản hồi "không giống app" hoặc cần Bluetooth cân / quét nhanh hơn → native (EAS nếu A, Capacitor nếu B).

## Tham chiếu
Expo docs (publishing-websites, progressive-web-apps, app config, async-routes, camera, securestore, notifications, sqlite, platform-specific-modules; changelog SDK 58), react-native-web docs (lists, compatibility), NativeWind, react-native-reusables, vite-plugin-pwa, Capacitor, MSAL redirect-bridge, WebKit / Chrome compatibility — `research-references.md` §E.
