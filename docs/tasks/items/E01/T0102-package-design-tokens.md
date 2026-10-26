---
id: T0102
title: Package design-tokens: tokens.json → web.css (Tailwind 4 @theme + biến shadcn) và tokens.ts
epic: E01
status: todo
area: shared
type: feature
priority: P0
size: M
depends_on: [T0101]
decisions: [ADR-0009]
wireframes: [Foundations]
owner: planner
allowed_paths:
  - "packages/design-tokens/**"
---

## Bối cảnh
Token là nguồn duy nhất cho web và mobile (`design-system.md` §3–5, §11). Cả hai app dùng Tailwind 4 nên chỉ cần một đầu ra CSS. Nguồn: `setup-guide.md` §2.

## Phạm vi
Làm:
- `packages/design-tokens/tokens.json` đầy đủ: màu nền tảng, trạng thái, dòng giống, thẻ số, delta, alert, dòng bảng, sexing, biểu đồ; chữ; khoảng cách; bo góc; bóng (lấy đúng giá trị `design-system.md`)
- `scripts/build.ts` sinh `dist/web.css` (`@theme { --color-primary … }`, `--radius-*`, `--font-*`, `:root { --primary … }` biến shadcn dạng OKLCH chuyển từ hex) và `dist/tokens.ts` (object typed)
- `package.json` exports `./web.css`, `./tokens`; script `build`; test snapshot 2 file sinh

Không làm:
- Không sinh preset Tailwind 3 (không còn NativeWind)
- Không thêm token ngoài design-system; màu mới phải sửa `design-system.md` trước

## Tiêu chí chấp nhận
1. Cho `tokens.json` theo design-system · Khi `pnpm --filter @genetics/design-tokens build` · Thì `dist/web.css` chứa `--color-primary` tương ứng `#013db3` (OKLCH) và `--color-status-ok-bg`; `dist/tokens.ts` export `tokens.color.strain.TMA.chart`
2. Khi đổi một giá trị trong `tokens.json` · Thì test snapshot thất bại cho tới khi cập nhật có chủ ý
3. Khi import `@genetics/design-tokens/web.css` trong một file CSS Tailwind 4 · Thì class `bg-primary`, `text-muted-foreground`, `bg-stat-blue`, `rounded-xl` tồn tại

## Ghi chú kỹ thuật
- Chuyển hex → OKLCH bằng `culori`; kiểm tương phản ≥ 4.5:1 cho các cặp §3 bằng test

## Kiểm thử bắt buộc
- Vitest: snapshot + contrast

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
