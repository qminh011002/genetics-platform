---
id: T0104
title: Package shared: format vi-VN, mã lỗi / blocker, mã quyền, enum + nhãn, schema zod form mẫu, glossary
epic: E01
status: todo
area: shared
type: feature
priority: P0
size: M
depends_on: [T0101]
decisions: [ADR-0007]
wireframes: []
owner: claude-web
allowed_paths:
  - "packages/shared/**"
---

## Bối cảnh
Code TS dùng chung web + mobile không phụ thuộc UI. Nguồn: `overview.md` §5, `api-standards.md` §7, §21, `design-system.md` §7.

## Phạm vi
Làm:
- `src/format`: `formatNumber(0.0291)→"0,0291"`, `formatInt(11140)→"11.140"`, `formatPercent(0.92)→"92,0 %"`, `formatDate/Time` theo `Asia/Ho_Chi_Minh`, parse số chấp nhận `,` và `.`
- `src/codes.ts`: danh mục `code` HTTP + blocker + field codes đúng `api-standards.md` §7 (const object + type)
- `src/permissions.ts`: mã quyền theo `backend.md` §12 / overview + helper `can(perms, code, scope?)`
- `src/enums.ts`: enum stage / status / priority… + nhãn vi / en + token badge theo design-system §3.2
- `src/forms/egg_collection.ts` (zod 4) làm mẫu + `forms/index.ts`
- `src/glossary.ts` từ `overview.md` §14
- `src/i18n/{vi,en}.json` chung (lỗi, enum)

Không làm:
- Không hook React, không import UI
- Không copy logic KPI (server tính)

## Tiêu chí chấp nhận
1. Khi `formatNumber(1234567.891)` · Thì `"1.234.567,891"`; `parseDecimal("0,0291")` → `0.0291`
2. Khi backend thêm mã lỗi mà `codes.ts` thiếu · Thì test backend `test_error_codes_match_shared` (T0303) đỏ — file này là nguồn cho test đó
3. Khi `can({ "record.edit": { scope: "own" } }, "record.edit", "all")` · Thì `false`

## Ghi chú kỹ thuật
- Dùng `Intl.NumberFormat('vi-VN')`; test chạy trên Node 22 (ICU full)

## Kiểm thử bắt buộc
- Vitest

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
