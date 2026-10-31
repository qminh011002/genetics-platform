---
id: T0404
title: Mobile skeleton: Vite + React + TanStack Router (tab bar + stack), Tailwind 4 + token + @genetics/ui, components/mobile đợt 1, platform adapters interface + mock, ESLint no-restricted-globals, MSW
epic: E04
status: deferred
area: mobile
type: feature
priority: P0
size: L
depends_on: [T0101, T0102, T0103, T0104, T0306]
decisions: [ADR-0010, ADR-0008]
wireframes: [MTabBar, MHome, UIStates]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/**"
---

## Bối cảnh
Nguồn: `mobile.md` §3–5, `setup-guide.md` §7; board MTabBar / MHome.

## Phạm vi
Làm:
- `pnpm create vite` react-ts → cấu trúc `mobile.md` §4 (chưa SW); router: `_tabs.tsx` (BottomTabBar 5 mục, nút Quét giữa), `_tabs/index|tasks|scan|inbox|me.tsx` placeholder, `batches/$batchId.tsx` placeholder; safe-area utilities; `<ViewTransition>` cho push/pop
- `components/mobile/`: BottomTabBar, ScreenHeader (≥ 60 px, icon 44), ActionFooter, PhoneTile, MListRow (≥ 56 px), NumberField (48 px, `inputMode=decimal`, chấp nhận `,`/`.`), SegmentedControl, SyncBadge, OfflineBanner
- `src/platform/`: interface `auth`, `storage`, `scanner`, `push`, `files`, `install`, `haptics` + `*.mock.ts`; ESLint `no-restricted-globals` (window, navigator, document, indexedDB, localStorage) ngoài `platform/`
- `index.html` meta Apple, `viewport-fit=cover`; i18n; testing MSW; `globals.css`

Không làm:
- Không SW / manifest (T0406), không offline (T0405), không auth (T0207)

## Tiêu chí chấp nhận
1. Khi mở `/` trên profile iPhone 15 · Thì tab bar dưới trong safe-area, nút Quét 48 px, 5 PhoneTile mock cho Worker
2. Khi dùng `navigator.onLine` trong `features/` · Thì ESLint lỗi; trong `platform/` → ok
3. Khi `NumberField` nhập `0,0291` · Thì giá trị số 0.0291 và không zoom (font 16 px)
4. Khi `pnpm --filter @genetics/mobile lint typecheck test build` · Thì xanh

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Vitest + Testing Library; lint

## Câu hỏi
- 2026-10-28: chủ dự án hoãn mobile; W1 tập trung web + backend. Mở lại → đổi `status: todo` và cập nhật board.
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
