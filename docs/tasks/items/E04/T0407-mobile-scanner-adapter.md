---
id: T0407
title: Mobile scanner adapter: barcode-detector ponyfill + native, camera (getUserMedia, torch feature-detect, dừng khi ẩn), MScan + MScanResult khung với nhập mã tay
epic: E04
status: deferred
area: mobile
type: feature
priority: P1
size: M
depends_on: [T0404]
decisions: [ADR-0010]
wireframes: [MScan, MScanResult]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/src/platform/scanner.ts"
  - "apps/mobile/src/features/scan/**"
  - "apps/mobile/src/routes/_tabs/scan.tsx"
  - "apps/mobile/e2e/scan.spec.ts"
---

## Bối cảnh
Nguồn: `mobile.md` §8, board MScan / MScanResult; `barcode-detector` README.

## Phạm vi
Làm:
- `platform/scanner.ts`: `start(videoEl)`, `stop()`, `onDetect(code)`, `torch(on)` nếu `getCapabilities().torch`; dùng native `BarcodeDetector` khi `getSupportedFormats()` có `qr_code`, ngược lại ponyfill WASM (CSP `wasm-unsafe-eval`)
- MScan: khung vuông, nút đèn, ô nhập tay, xử lý từ chối quyền (hướng dẫn), dừng khi `visibilitychange`
- MScanResult: gọi `GET /lookup?code=` (mock) hoặc store `batches` offline; hiện thao tác theo `can.add` mock

Không làm:
- Không form nhập thật

## Tiêu chí chấp nhận
1. Khi quét ảnh QR `TMA_F7_BC01` (Playwright inject video giả / test unit với ảnh) · Thì `onDetect` nhận mã
2. Khi không có camera · Thì ô nhập tay vẫn dùng được và `/lookup` được gọi
3. Khi rời màn · Thì track camera dừng (test gọi `stop`)

## Ghi chú kỹ thuật
- Playwright có `--use-fake-device-for-media-stream` + `--use-file-for-fake-video-capture` để test video giả

## Kiểm thử bắt buộc
- Vitest + Playwright

## Câu hỏi
- 2026-10-28: chủ dự án hoãn mobile; W1 tập trung web + backend. Mở lại → đổi `status: todo` và cập nhật board.
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
