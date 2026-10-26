# Mobile · PWA web-first cho khu nuôi (Vite + React + shadcn + vite-plugin-pwa)

> Phạm vi: `apps/mobile` (tên dự án `genetics_platform_mobile`, package `@genetics/mobile`). Chủ sở hữu code: **Claude (mobile)**. App điện thoại cho Worker và Executive nhập liệu tại khu nuôi, phát hành dạng **PWA** cài được, không qua store.
> Quyết định: **ADR-0010 Accepted 26/10/2026 — phương án B (web-first)**. Expo + React Native Web không dùng; đường lên native sau này là Capacitor (bọc `dist/`) hoặc app Expo riêng dùng chung `@genetics/*`.
> Đọc trước: `overview.md`, `web.md` (cùng stack, cùng luật), `api-standards.md` §9, `design-system.md`, `quality-standards.md`. ADR liên quan: 0006 (SDK), 0009 (UI, `packages/ui`), 0011 (offline).
> Mọi khả năng "giống native" phân loại theo ma trận mục 9; không hứa điều trình duyệt không làm được.

## 1. Mục tiêu và giới hạn

| Mục tiêu | Ý nghĩa | Kiểm bằng |
|---|---|---|
| Nhập nhanh tại khu nuôi | Mở app → quét QR → đúng form → lưu trong vài chạm | e2e Playwright profile điện thoại: ≤ 4 chạm từ Home tới lưu thu trứng |
| Không mất dữ liệu | Mất Wi-Fi vẫn nhập; tự gửi khi có mạng; không trùng | e2e offline → 3 bản ghi → online → server có đúng 3 |
| Cài như app | Thêm vào màn hình chính, standalone, mở offline được shell | checklist thiết bị thật mỗi bản phát hành |
| Chỉ việc điện thoại nên làm | Đo lường, xem batch, sửa / xoá của mình 24 h, việc được giao, thông báo | quyền `platform.app` + `device` trong RBAC |

Không làm trên điện thoại: chốt giai đoạn, import, tạo task / dự án, master data, quản trị, sửa bản ghi người khác.

## 2. Vì sao web-first (tóm tắt ADR-0010)

| Tiêu chí | Expo + RN Web (đã loại) | **Web-first PWA (chọn)** |
|---|---|---|
| Tooling PWA | Expo không sinh manifest / SW; phải chạy Workbox CLI tay; Expo tự khuyến nghị native cho offline tốt | `vite-plugin-pwa` 2 sinh manifest, SW (Workbox), script đăng ký |
| UI | NativeWind 4 (Tailwind 3), Reusables web chưa xác minh | Dùng chung `packages/ui` (shadcn, Base UI, Tailwind 4) và token với web |
| Danh sách, bàn phím | FlatList "basic support, not optimized for web" | DOM + `@tanstack/react-virtual` |
| API trình duyệt | qua adapter; SecureStore / Notifications không có web | trực tiếp |
| Agent | hai stack | một stack với web |
| Native sau này | EAS | Capacitor 8 ("first-class support for PWA and native") |

Điều kiện xem lại: sau 6 tháng vận hành nếu cần Bluetooth cân, quét nhanh hơn, hoặc phản hồi "không giống app" → Capacitor trước, app native riêng sau.

## 3. Công nghệ (phiên bản xác minh 26/10/2026)

| Việc | Chọn | Ghi chú |
|---|---|---|
| Build | Vite 8, TypeScript strict, React 19.3 (Compiler bật), `vite-plugin-pwa` 2 (`strategies: injectManifest`, `registerType: prompt`) | cùng config nền với web |
| Điều hướng | TanStack Router file-based; layout tab bar dưới + stack; View Transitions (React 19.3) cho chuyển cảnh | URL thường → deep link tự nhiên |
| UI | `@genetics/ui` (shadcn primitives: Button, Input, Sheet, Dialog, Tabs, Badge, Switch…), Tailwind 4, token `@genetics/design-tokens/web.css`; component mobile riêng trong `src/components/mobile` (PhoneTile, MListRow, NumberField, SegmentedControl, BottomTabBar, SyncBadge, OfflineBanner) | không dark mode |
| Dữ liệu | TanStack Query 5 + `@genetics/api-client` (orval) | cùng hook với web |
| Lưu cục bộ | IndexedDB qua `idb` 8 (`src/platform/storage.ts`) | |
| Form | react-hook-form + zod 4, schema `@genetics/shared/forms` | |
| Đăng nhập | `@azure/msal-browser` 5, redirect flow, trang bridge `public/auth-redirect.html` (MSAL v5), `cacheLocation: localStorage` | SW không cache bridge |
| Quét QR | `barcode-detector` 3 (ponyfill ZXing-C++ WASM) trên `getUserMedia`; native `BarcodeDetector` khi có | `@zxing/browser`, `html5-qrcode` đang maintenance mode |
| Test | Vitest 5 + Testing Library + MSW; Playwright profile iPhone / Pixel; axe | như web |
| Lint | ESLint 10 flat, `eslint-plugin-boundaries`, `no-restricted-globals` ngoài `src/platform` | |

## 4. Cấu trúc thư mục

```
apps/mobile/
├─ index.html                      # meta apple-mobile-web-app-*, viewport-fit=cover, theme-color
├─ vite.config.ts                  # plugin-react, router plugin, VitePWA({ strategies: 'injectManifest', srcDir: 'src/sw', filename: 'sw.ts', manifest, registerType: 'prompt' })
├─ public/
│  ├─ auth-redirect.html           # MSAL v5 redirect bridge (same-origin, no-store)
│  ├─ icons/ (192, 512, maskable, apple-touch-icon)
│  └─ screenshots/                 # Android richer install UI
├─ src/
│  ├─ main.tsx                     # MsalProvider → QueryClientProvider → SyncProvider → RouterProvider; registerSW
│  ├─ app/                         # providers, query-client, router (context auth + queryClient), auth/, i18n/
│  ├─ routes/                      # __root.tsx · login.tsx · _tabs.tsx (BottomTabBar) · _tabs/index|tasks|scan|inbox|me.tsx
│  │                               # batches/$batchId.tsx · batches/$batchId/$form.tsx · records/$form/$id.tsx · tasks/$taskId.tsx · sync.tsx · search.tsx
│  ├─ features/                    # auth, home, scan, batches, forms/<form_code>, records, tasks, inbox, profile, search, sync
│  ├─ offline/                     # db.ts (idb schema + migration), outbox.ts, sync-engine.ts, cache.ts
│  ├─ platform/                    # auth.ts (MSAL), storage.ts (idb), scanner.ts (barcode-detector + camera), push.ts, files.ts, install.ts, haptics.ts — nơi DUY NHẤT dùng window/navigator
│  ├─ components/mobile/           # PhoneTile, MListRow, NumberField, SegmentedControl, BottomTabBar, SyncBadge, OfflineBanner, ScreenHeader, ActionFooter
│  ├─ sw/sw.ts                     # Workbox injectManifest: precache + routes (mục 7.2)
│  ├─ lib/                         # api.ts (mutator token), utils
│  ├─ styles/globals.css           # @import "tailwindcss"; @import "@genetics/design-tokens/web.css"; safe-area utilities
│  └─ testing/
└─ e2e/                            # Playwright mobile profiles: offline, pwa, scan (nhập tay), a11y
```

Luật import như web (`web.md` §5): `routes/*` chỉ import `features/<x>/index.ts`; feature không import feature; `platform/*` là nơi duy nhất chạm API trình duyệt (`no-restricted-globals` + `no-restricted-imports` cho `idb`, `@azure/msal-browser`, `barcode-detector` ngoài thư mục đó). `@genetics/ui` và `components/mobile` không import feature.

## 5. Màn hình và điều hướng

Thanh dưới (giống nhau cho mọi vai trò, board MTabBar): **Trang chủ · Việc · Quét (nút giữa) · Thông báo · Tôi**.

| Màn | Route | Worker | Executive | Wireframe | Feature |
|---|---|---|---|---|---|
| Đăng nhập | `/login` | ✓ | ✓ | MLogin | F-0208 |
| Home: ô nhập liệu theo quyền, việc tiếp theo | `/` | 5 ô | 9 ô | MHome · MHomeExec | F-1105 |
| Việc của tôi | `/tasks` | ✓ | ✓ | MTasks | F-1003 |
| Quét QR → kết quả | `/scan` | ✓ | ✓ | MScan · MScanResult | F-0803 |
| Thông báo | `/inbox` | ✓ | ✓ | MInbox | F-0308 |
| Tôi, cài đặt, tài liệu | `/me` | ✓ | ✓ | MProfile · MDocs | F-0404, F-0409 |
| Đồng bộ offline | `/sync` | ✓ | ✓ | MSync | F-0406 |
| Tìm | `/search` | ✓ | ✓ | MSearch | F-0625 |
| Batch đang chạy, chi tiết | `/batches/$batchId` | ✓ | ✓ | MEggList · MEggDetail · MNeonateDetail · MLarvaeDetail | F-0603, F-0604 |
| Thu trứng | `/batches/$batchId/egg_collection` | ✓ | ✓ | MEggCollect | F-0606 |
| Cân ổ trứng | `…/egg_weighing` | ✓ | ✓ | MEggWeigh | F-0607 |
| Thu neonate theo khung giờ | `…/neonate_harvest` | ✓ | ✓ | MNeonateHarvest | F-0609 |
| Cân mẫu neonate | `…/neonate_weighing` | ✓ | ✓ | MNeonateWeigh | F-0610 |
| Ổ trứng Selective | `…/sb_clutch` | ✓ | ✓ | MSBClutch | F-1503 |
| Emerge & sexing | `…/sexing` | — | ✓ | MSexing | F-0608 |
| Quan sát larvae · nursery · mẫu pupae | `…/larvae_observation` · `nursery_observation` · `pupae_sample` | — | ✓ | MLarvaeObs · MNurseryObs · MPupaeSample | F-0612…F-0614 |
| Sửa bản ghi của mình (24 giờ) | `/records/$form/$id` | ✓ | ✓ | MRecordEdit | F-0622 |
| Xoá (sheet, hoàn tác 10 giây) | sheet | ✓ | ✓ | MDeleteSheet | F-0622 |
| Task nhập liệu | `/tasks/$taskId` | ✓ | ✓ | MTaskData · MTaskDataDone | F-1404 |
| Task checklist, chat; đổi trạng thái | `/tasks/$taskId`, sheet | ✓ | ✓ | MTaskDetail · MTaskStatus | F-1405, F-1406 |

- Ô trên Home sinh từ `/me.phone_home` ∩ quyền form; không có danh sách ô cứng.
- Form chỉ mở khi `batch.can.add` chứa `form_code`; không đủ điều kiện thì hiện lý do.
- Manager / Admin đăng nhập app → màn "Tài khoản này dùng web trên máy tính".
- Chuyển cảnh: `<ViewTransition>` của React 19.3 cho push / pop; nút back trình duyệt = pop stack (router history).

## 6. Offline (ADR-0011)

### 6.1 Store IndexedDB (`genetics`, version trong `offline/db.ts`)

| Store | Nội dung | Giữ |
|---|---|---|
| `outbox` | bản ghi chờ gửi | tới khi gửi xong + 7 ngày |
| `batches` | snapshot batch mở (mã, stage, status, `can.add`, container) | làm mới khi online, ≤ 24 h |
| `records` | bản ghi của mình 24 h gần nhất | 48 h |
| `reference` | strain, container, form_def, diet, khung giờ protocol | mỗi ngày |
| `work` | việc hôm nay + mai | khi online |
| `drafts` | form đang nhập dở | tới khi lưu / huỷ |

`navigator.storage.persist()` gọi sau đăng nhập (Safari 17+ ưu tiên Home Screen app; Chrome theo heuristic). Hạn mức ~60 % đĩa / origin; dữ liệu app < 50 MB; vẫn bắt `QuotaExceededError`.

### 6.2 Outbox và sync engine

- Lưu = ghi outbox trước, UI "Đã lưu", badge đếm chờ gửi.
- FIFO theo batch; không gửi song song cùng batch.
- Kích hoạt: sau mỗi lần lưu, `online`, `visibilitychange`, mỗi 30 s khi còn hàng. **Không dựa vào Background Sync** (iOS không có); Android có thì chỉ là bonus qua `platform/push.ts`.
- Kết quả: 2xx → `sent`; mạng / 5xx / 429 / 503 → backoff 5 s → 15 s → 60 s → 5 phút; 401 → làm mới token (refresh token SPA quá 24 h → giữ `pending`, nhắc đăng nhập); 409 `batch_closed` / `gate_not_met` / `duplicate_id`, 412, 422 → `conflict` (MSync: Sửa / Bỏ); 403 → `failed`.
- Xoá có hoàn tác 10 s; sửa / xoá bản ghi chưa gửi = sửa item outbox.
- Xung đột: server thắng trạng thái batch; bản ghi người dùng không bị ghi đè âm thầm. Không CRDT.
- Đăng xuất khi outbox còn hàng → cảnh báo; outbox gắn `user_id`.

### 6.3 Đọc offline

Quét QR offline tra `batches`; KPI, lineage, lịch sử chỉ khi online ("Cần mạng"). Banner "Đang offline · n bản ghi chờ gửi".

## 7. PWA engineering

### 7.1 Manifest (sinh bởi `vite-plugin-pwa` từ config) và HTML

`name "Genetics Data Platform"`, `short_name "Genetics"`, `start_url /`, `scope /`, `display standalone`, `orientation portrait` (gợi ý; iOS không lock), `theme_color #013db3`, `background_color #f6f7f9`, `lang vi`, `icons` 192 / 512 / maskable, `screenshots`. `index.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, `viewport-fit=cover`; safe-area bằng CSS `env(safe-area-inset-*)` (utility trong `globals.css`).

### 7.2 Service worker (`src/sw/sw.ts`, Workbox `injectManifest`)

| Tài nguyên | Chiến lược |
|---|---|
| App shell: HTML, JS (mọi chunk lazy route), CSS, font, icon, WASM của `barcode-detector` | Precache (`self.__WB_MANIFEST`), version theo build |
| `GET /api/v1/form-defs`, `/strains`, `/containers`, `/me` | StaleWhileRevalidate, TTL 1 ngày |
| `GET /api/v1/*` khác | NetworkOnly (IndexedDB lo offline) |
| `POST / PATCH / DELETE` | NetworkOnly; outbox ở tầng app |
| `/auth-redirect.html`, `login.microsoftonline.com` | NetworkOnly, không cache |
| Điều hướng | `createHandlerBoundToURL('/index.html')` (SPA) |

Cập nhật: `registerType: 'prompt'` → `useRegisterSW` báo `needRefresh` → toast "Có bản mới · Tải lại" → `updateServiceWorker(true)`. **Không tự reload** khi đang nhập form hoặc outbox đang gửi (kiểm `drafts` / `outbox` trước).

### 7.3 Cài đặt

- Android: `beforeinstallprompt` → nút "Cài app" trên MLogin / MProfile; WebAPK tự cập nhật manifest ≤ 24 h.
- iOS: không có prompt; iOS 26 mặc định mở site thêm vào màn hình chính dạng web app; hướng dẫn "Chia sẻ → Thêm vào MH chính" khi `!navigator.standalone`.
- Web (WorkerDesktop) hiện QR dẫn tới URL PWA.

### 7.4 Phiên và bảo vệ dữ liệu trên thiết bị dùng chung

- MSAL `localStorage` để không đăng nhập lại mỗi lần mở; artefact mã hoá bằng cookie phiên (không phải ranh giới bảo mật). Refresh token SPA 24 h → đăng nhập lại mỗi ngày là bình thường; outbox giữ dữ liệu.
- Thiết bị dùng chung: outbox và cache khoá theo `user_id`; đăng xuất xoá `records`, `drafts`, `work` của user, giữ `outbox` chưa gửi (cảnh báo); không lưu token trong IndexedDB; không PIN riêng ở v1 (OQ-11).
- CSP: `default-src 'self'`; `connect-src` API + `login.microsoftonline.com`; `worker-src 'self'`; `wasm-unsafe-eval` cho barcode WASM.

## 8. Quét QR và camera

- HTTPS bắt buộc. Camera sau, khung vuông, nút đèn chỉ khi `track.getCapabilities().torch`; luôn có ô nhập mã tay.
- `barcode-detector` ponyfill: native khi `getSupportedFormats()` có `qr_code` (Chrome Android, cần Google Play Services), ngược lại ZXing-C++ WASM (iOS không bật API này mặc định).
- iOS Home Screen app có thể hỏi quyền camera lại mỗi phiên; UI có nút "Cho phép camera" + hướng dẫn.
- Rung: iOS không có Vibration API → hiệu ứng hình + âm; Android `navigator.vibrate` sau gesture.
- Dừng camera khi rời màn / app vào nền.

## 9. Ma trận tương thích (MDN BCD 8.1.7, WebKit, Chrome Developers, web.dev; 26/10/2026)

S = hỗ trợ · SR = hỗ trợ có hạn chế · F = cần fallback · N = không.

| Khả năng | iOS Safari (Home Screen PWA) | Android Chrome (installed PWA) | Thiết kế |
|---|---|---|---|
| Install prompt | N → F (hướng dẫn Share; iOS 26 mở dạng web app mặc định) | S (`beforeinstallprompt` Chrome 61+) | nút cài Android, hướng dẫn iOS |
| Standalone display, status bar | S (manifest 11.3+, meta Apple) | S (WebAPK) | cả hai |
| Safe area | S (`env()` iOS 11+) | S | CSS `env()` |
| Web Push | SR (16.4+, chỉ khi cài, user gesture) | S | tuỳ chọn sau cài (OQ-12) |
| Background Sync | N → F | S | outbox + retry foreground |
| Periodic Sync | N | SR | không dùng |
| Camera `getUserMedia` | SR (standalone từ iOS 13.4; có thể hỏi lại mỗi phiên) | S | xử lý re-prompt |
| Đèn (torch) | SR / chưa xác minh (iOS ≥ 17.5 có báo cáo chạy) | SR (tuỳ máy) | feature-detect |
| `BarcodeDetector` | N mặc định (iOS 17 sau cờ) → F | SR (Chrome 83, Play Services) | ponyfill ZXing-C++ |
| IndexedDB + `persist()` | S / SR (persist 15.2+, Storage API đủ từ 17) | S | `idb`, gọi `persist()` |
| Hạn mức / xoá cache | SR (~60 % đĩa; 7 ngày ITP áp cho tab Safari; Home Screen app có bộ đếm riêng) | S (60 % / origin, LRU) | khuyến khích cài app |
| Screen Wake Lock | SR (chỉ từ iOS 18.4 trong Home Screen app) | S (Chrome 84) | bật khi quét, feature-detect |
| Vibration | N | SR (sau gesture) | âm + hình |
| Badge | SR (16.4+, Home Screen) | N | không dựa vào |
| Web Share | S | S | chia sẻ PDF nhãn |
| File picker / `capture` | S (`<input capture>`); N (`showOpenFilePicker`) | S | `<input type=file capture>` |
| Clipboard | SR (gesture) | SR | copy mã sau chạm |
| Orientation lock | N | S | không ép |
| MSAL redirect trong standalone | SR (WebKit sửa từ iOS 16.4; redirect sang Authenticator có thể mở tab Safari — chưa có tài liệu Microsoft) | S | bridge same-origin; test thiết bị thật |

## 10. Ví dụ luồng: Worker thu trứng offline (F-0606)

1. Mở app (shell precache), MSAL silent token (localStorage); nếu refresh token hết 24 h và offline → vẫn vào được màn, outbox chờ.
2. Chạm Quét → camera → `barcode-detector` đọc `TMA_F7_BC01` → tra `batches` (offline) → MScanResult hiện `can.add` cache.
3. MEggCollect: phòng (từ `reference`), ngày (hôm nay), mg → zod kiểm hình thức → **ghi outbox** với `id = crypto.randomUUID()`, `client_recorded_at` → toast "Đã lưu" → "Lưu & thêm tiếp".
4. Sync engine chờ `online` → POST `/batches/{id}/measurements/egg_collection` → 201 → `sent`; gửi lại sau rớt mạng → 200 (cùng hash), không trùng.
5. Batch đã bị chốt trong lúc đó → 409 `batch_closed` → `conflict`; MSync hiện lý do.

## 11. Kiểm chứng tự động

| Quy tắc | Công cụ |
|---|---|
| Luật import; `platform/` là nơi duy nhất chạm API trình duyệt | `eslint-plugin-boundaries`, `no-restricted-globals`, `no-restricted-imports` |
| Sync engine (thứ tự, backoff, phân loại lỗi, idempotent) | Vitest unit với fake fetch + fake timers |
| Form offline, 422, sửa 24 h | Testing Library + MSW handler orval |
| Đường đi chính + offline | Playwright (`context.setOffline`) profile iPhone / Pixel trên `vite build` |
| Manifest + SW hợp lệ, precache đủ chunk | Playwright: `navigator.serviceWorker.ready`, mở offline sau lần tải đầu; test đọc `dist/sw.js` manifest phủ mọi chunk (Lighthouse 12 đã bỏ PWA category) |
| Accessibility | axe trên màn chính; chữ ≥ 14 px, input ≥ 16 px, chạm ≥ 44 px (test style) |
| Thiết bị thật | checklist mục 12 mỗi bản phát hành |
| Kích thước | JS ban đầu ≤ 300 KB gzip (`size-limit`) |

## 12. Checklist thiết bị thật (mỗi bản phát hành)

- [ ] Cài PWA (Android prompt; iOS Share sheet), icon, splash, standalone.
- [ ] Quét nhãn in thật; đèn (nếu có); nhập mã tay.
- [ ] Mất Wi-Fi giữa lúc gửi → không trùng, không mất.
- [ ] Đăng nhập lại sau 24 h; outbox còn nguyên.
- [ ] Cập nhật bản mới khi đang nhập form → không reload giữa chừng.
- [ ] Đổi user trên cùng máy → không thấy nháp / bản ghi của user trước.
