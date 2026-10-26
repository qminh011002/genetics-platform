---
id: T0504
title: Web /strains: feature reference (Strains page với DataTable, Can strain.create, dialog thêm/sửa với zod + If-Match + ReasonDialog khi cần), i18n, test component + e2e + visual
epic: E05
status: todo
area: web
type: feature
priority: P0
size: M
depends_on: [T0401, T0402, T0403, T0502]
decisions: [ADR-0008]
wireframes: [Strains, StrainsManager]
owner: claude-web
allowed_paths:
  - "apps/web/src/features/reference/**"
  - "apps/web/src/routes/_app/strains/**"
  - "apps/web/e2e/strains.spec.ts"
  - "packages/shared/src/forms/strain.ts"
---

## Bối cảnh
Lát dọc mẫu web — đối chiếu board Strains (thẻ dòng giống có ảnh) ở mức tối thiểu: bảng/thẻ danh sách + thêm/sửa; KPI so thế hệ trước để trống (W3). Nguồn: `web.md` §6, §7, §9, §10, §12.

## Phạm vi
Làm:
- `features/reference/` (`index.ts` export `StrainsPage`), `api/queries.ts` bọc `useReferenceListStrains`, `mutations.ts` (`useReferenceCreateStrain` invalidate list), `model/search.ts` (zod: `q`, `program`, `cursor`)
- Route `_app/strains/index.tsx` với `validateSearch`, `beforeLoad` perm `strain.view`, loader `ensureQueryData`
- UI: PageHeader + nút Thêm (`Can`), DataTable / thẻ theo wireframe (StrainBadge, số thế hệ), dialog thêm / sửa (react-hook-form + zod từ `@genetics/shared/forms/strain`), lỗi 409 / 412 / 422 theo `web.md` §7.4; Manager thấy nhãn "Chỉ xem"
- Test: component (Can ẩn nút cho Manager, 409 hiện lỗi mã trùng), e2e (Executive thêm `TMX` → xuất hiện), visual Strains

Không làm:
- Không StrainDetail / Generation (W1 sau)

## Tiêu chí chấp nhận
1. Cho mock Manager · Khi mở `/strains` · Thì không có nút Thêm, có nhãn Chỉ xem (khớp board StrainsManager)
2. Cho Executive · Khi thêm mã trùng · Thì toast / lỗi trường theo 409 `duplicate_code`
3. Khi URL `?q=tm` · Thì danh sách lọc và giữ khi reload
4. Khi e2e với backend thật · Thì tạo → danh sách cập nhật không reload trang

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Vitest + Playwright + visual

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
