---
id: T0505
title: Mobile reference store: nạp strains/containers/form-defs vào IndexedDB khi online, màn chọn dòng giống (MListRow) mở được offline, dùng trong Home mock
epic: E05
status: todo
area: mobile
type: feature
priority: P0
size: S
depends_on: [T0404, T0405, T0502]
decisions: [ADR-0011]
wireframes: [MHome]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/src/offline/cache.ts"
  - "apps/mobile/src/features/batches/**"
  - "apps/mobile/src/features/home/**"
  - "apps/mobile/e2e/reference.spec.ts"
---

## Bối cảnh
Lát dọc mẫu mobile: đọc qua SDK → cache → hiển thị offline. Nguồn: `mobile.md` §6.1, §6.3.

## Phạm vi
Làm:
- `offline/cache.ts`: `refreshReference()` gọi `useReferenceListStrains` (SDK) + ghi store `reference` (TTL 1 ngày); đọc ưu tiên cache khi offline
- `features/batches/` màn tạm "Chọn dòng giống" từ store; Home placeholder hiện số strain
- Test: Vitest (cache TTL), Playwright: online tải → offline → danh sách vẫn hiện

Không làm:
- Không form đo lường

## Tiêu chí chấp nhận
1. Cho online lần đầu · Khi mở màn · Thì gọi API và ghi 6 strain; offline reload · Thì vẫn hiện 6 strain từ cache
2. Cho cache > 1 ngày và online · Thì refresh

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Vitest + Playwright

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
