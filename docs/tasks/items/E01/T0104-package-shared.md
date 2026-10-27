---
id: T0104
title: Package shared: format vi-VN, mã lỗi / blocker, mã quyền, enum + nhãn, schema zod form mẫu, glossary
epic: E01
status: in_review
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
- Danh mục mã quyền: `backend.md` §12 hiện tại không liệt kê mã; lấy theo bảng **§8.2 "Danh mục quyền ban đầu" của `backend.md` bản 1.0** (T0201 trích "giữ nguyên nội dung", bản nằm trong thư mục handover `Claude outputs/`). 51 mã, scope `own` / `mem` / `all`. Đề nghị Planner đưa lại bảng này vào `backend.md` hiện tại (hoặc `docs/data`) để repo tự đủ nguồn.
- `can(perms, code, scope)` giả định thứ tự bao hàm `own < mem < all` (scope cấp ≥ scope yêu cầu). Tài liệu chỉ định nghĩa 3 giá trị, không nói rõ thứ tự → cần xác nhận; nếu `mem` và `own` không so sánh được thì sửa `SCOPE_RANK`.
- Enum `priority`: tài liệu viết `Urgent · Important · Normal · Low` (design-system §3.2); shared dùng giá trị `urgent | important | normal | low` (snake_case như các enum khác) và giữ nhãn tiếng Anh. Backend cần dùng cùng giá trị hoặc báo lại.
- Nhãn chưa có trong tài liệu, tự đặt (cần duyệt copy): `routine.cancelled` "Đã huỷ", `dq.error/warning` "Lỗi"/"Cảnh báo", `dq.resolved` "Đã xử lý", `sync.failed` "Thất bại" (token `status-error`, §3.2 không có hàng `failed`), tên form `form.*`, title tiếng Việt / Anh cho 29 mã lỗi, nội dung `blocker.*`.
- `dq` trong §3.2 gộp `error, warning, ignored, resolved` thành một hàng → shared để `DQ_STATE` đúng như vậy; nếu DB tách `severity` + `status` thì tách enum theo migration.
- Form `egg_collection`: trường `note` có trên board MEggCollect ("Ghi chú") nhưng không có trong cột INV-14 (`batch_id, room_id, collected_on, seq, egg_mass_mg`) → để `optional`; backend xác nhận có cột `note` hay bỏ.
- `parseDecimal("11.140")` → `11.14` (một dấu xuất hiện một lần = thập phân, chấp nhận cả `,` và `.`); chuỗi hàng nghìn phải có ≥ 2 dấu hoặc kèm dấu thập phân khác. Nếu muốn ưu tiên quy ước vi (dấu chấm = hàng nghìn) cần quyết định.

## Kết quả (điền khi xong)
- PR: # (nhánh `shared/T0104-package-shared`, chưa push)
- File tạo trong `packages/shared/`: `package.json` (exports `.`, `./format`, `./codes`, `./permissions`, `./enums`, `./forms`, `./forms/*`, `./glossary`, `./i18n`, `./i18n/*.json`; deps `zod`, dev `typescript`, `vitest`, `eslint`, `typescript-eslint`, `@eslint/js` — tất cả `catalog:`), `tsconfig.json` (strict, ESNext / bundler, json module), `tsconfig.build.json`, `eslint.config.js` (kế thừa base), `vitest.config.ts`; `src/index.ts`; `src/format/index.ts` (`formatNumber`, `formatInt`, `formatPercent`, `formatWithUnit`, `parseDecimal`, `formatDate`, `formatTime`, `formatDateTime`, `toBusinessDate`; `Asia/Ho_Chi_Minh`); `src/codes.ts` (`ERROR_CODES` 29 mã → status, `BLOCKER_CODES` 12, `FIELD_ERROR_CODES` 7, `FORM_CODES` 13, type guard, kiểu `Problem` / `Blocker` / `FieldError`); `src/permissions.ts` (`PERMISSIONS` 51 mã + kind/form_code, `PERMISSION_SCOPES`, `can()`, `formPermission()`); `src/enums.ts` (16 enum, nhãn đọc từ i18n, token badge §3.2); `src/forms/{common,egg_collection,index}.ts` (zod 4, lỗi = mã `FIELD_ERROR_CODES`); `src/glossary.ts` (16 mục §14); `src/i18n/{vi,en}.json` + `index.ts`. Test: `src/**/*.test.ts` (6 file, 49 test). Lockfile `pnpm-lock.yaml` cập nhật.
- Tiêu chí: (1) `formatNumber(1234567.891) === "1.234.567,891"`, `parseDecimal("0,0291") === 0.0291` — pass (`format.test.ts`); (2) `codes.ts` là nguồn cho T0303: mỗi mã một dòng dạng `code: status,` / `'code',`, ghi chú định dạng ở đầu file; test kiểm số lượng và i18n phủ đủ mã — pass (`codes.test.ts`); (3) `can({ "record.edit": { scope: "own" } }, "record.edit", "all") === false` — pass (`permissions.test.ts`).
- Lệnh đã chạy xanh: `pnpm install` · `pnpm --filter @genetics/shared test` (49 passed) · `typecheck` · `lint` · `build` · `pnpm run ci` (exit 0: format:check, check:catalog, lint, typecheck, test, contract:check (chưa có backend / api-client → no-op), build).
- Lệch so với phạm vi: thêm `formatWithUnit`, `toBusinessDate`, `FORM_CODES` vào `codes.ts` (api-standards §16 ghi `form_code` cũng thuộc `codes.ts`), kiểu `Problem`; i18n có thêm `form.*`. Không có KPI, không React, không import UI.
- Còn lại: Planner trả lời mục Câu hỏi; T0303 / T0201 viết test so khớp; mở PR nhãn `shared`.
