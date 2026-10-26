---
id: T0402
title: Web common components đợt 1: DataTable (TanStack Table v9, sort server, cursor), PageHeader, ReasonDialog, BlockerList, StatCard, StageStepper, Timeline khung + test + gallery
epic: E04
status: todo
area: web
type: feature
priority: P0
size: L
depends_on: [T0401]
decisions: [ADR-0009]
wireframes: [Foundations, BatchHead, CloseStage, EggDetail]
owner: claude-web
allowed_paths:
  - "apps/web/src/components/common/**"
  - "apps/web/gallery/**"
  - "apps/web/src/testing/**"
---

## Bối cảnh
Thành phần nghiệp vụ web theo `design-system.md` §6.2 cần sẵn cho W2. Nguồn: `web.md` §8.

## Phạm vi
Làm:
- `components/common/`: `DataTable` (v9 `useTable` + `tableFeatures`, `manualSorting`, `manualPagination`, cursor "Tải thêm", cột số `tabular-nums`, row token DQ, virtual > 200 dòng), `PageHeader`, `ReasonDialog` (≥ 5 ký tự), `BlockerList` (✓/✗ theo `blockers[]` dịch theo code), `StatCard` + `KpiDelta`, `StageStepper`, `Timeline`
- Test component mỗi cái; thêm vào gallery; ảnh visual baseline (T0403)

Không làm:
- Không BatchHead / LineageChain / CupMap / RecordTable (W2, cần dữ liệu thật)

## Tiêu chí chấp nhận
1. Cho 300 dòng · Khi render DataTable · Thì chỉ ~40 dòng trong DOM (virtual) và sort gọi callback server
2. Khi `BlockerList blockers=[{code:'pending_individuals', params:{count:24}}]` · Thì hiện "Còn 24 cá thể chưa xử lý" (vi)
3. Khi ReasonDialog submit 3 ký tự · Thì lỗi; 5 ký tự → `onSubmit(reason)`

## Ghi chú kỹ thuật
- shadcn data-table example là v8: không copy

## Kiểm thử bắt buộc
- Vitest + Testing Library

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
