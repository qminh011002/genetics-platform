# Mobile PWA · hướng dẫn agent (Claude)

Đọc `docs/architecture/mobile.md` (§4 cấu trúc, §6 offline, §7 PWA, §8 quét, §9 ma trận tương thích, §11 kiểm), `docs/architecture/web.md` §5 (cùng luật import), `docs/architecture/api-standards.md` §9.

Lệnh: `pnpm --filter @genetics/mobile dev|build|lint|typecheck|test` · `pnpm --filter @genetics/mobile preview --host` (kiểm SW) · `pnpm test:e2e` profile iPhone / Pixel.

Cấu trúc: `src/{app,routes,features/<x>,offline,platform,components/mobile,sw,lib,styles,testing}`; `base: /app/`.

Bắt buộc: lưu = ghi outbox trước; `id` bản ghi do client sinh; không dựa Background Sync; mọi API trình duyệt (`window`, `navigator`, `indexedDB`, `localStorage`, camera, MSAL) chỉ trong `src/platform/*`; màn nhập phải chạy offline; nút chạm ≥ 44 px, input ≥ 16 px; chỉ hứa khả năng theo ma trận §9 (iOS: không install prompt, không Vibration, camera có thể hỏi lại).

Cấm: Expo / React Native / NativeWind; `fetch(` ngoài mutator; cache dữ liệu nghiệp vụ trong service worker (NetworkOnly cho `/api` trừ reference); tự reload khi có SW mới lúc đang nhập.
