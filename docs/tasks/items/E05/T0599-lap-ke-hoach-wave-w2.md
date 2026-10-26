---
id: T0599
title: Lập kế hoạch wave W2 (Maintenance Breeding): tách task E06–E10, board W2, bảng phát việc W2
epic: E05
status: todo
area: docs
type: chore
priority: P0
size: L
depends_on: [T0506]
decisions: [D7, DN-1, DN-2, DN-10]
wireframes: []
owner: planner
allowed_paths:
  - "docs/tasks/**"
  - "docs/migration/03-feature-backlog.md"
  - "docs/migration/07-screen-coverage.md"
---

## Bối cảnh
Task cuối của mỗi wave là lập kế hoạch wave kế (quy ước `how-to-work.md` §4a). W2 gồm E06 Breeding lõi, E07 Data quality, E08 Nhãn & quét, E09 Import, E10 Việc & lịch (`docs/migration/05-waves.md`, `04-dependency-map.md`). Đầu vào bắt buộc: W0 đã ký (F-0001…F-0006) hoặc ghi rõ mặc định; kết quả nghiệm thu W1 (T0506).

## Phạm vi
Làm:
- Đọc feature E06–E10 trong `03-feature-backlog.md`; tách mỗi feature thành task ≤ 2 ngày theo mẫu `workflow.md` §4.4, lát dọc theo giai đoạn (Egg → Neonate → Larvae/Nursery/Pupae), mỗi task có `allowed_paths`, `wireframes:` đúng board, tiêu chí Cho / Khi / Thì gồm lỗi và quyền.
- Tạo `docs/tasks/epics/E06…E10.md`; tạo `docs/tasks/board-w2.md` (hoặc thêm mục W2 vào `board.md`); cập nhật `agent-dispatch.md` với bảng đợt phát việc W2 theo lane.
- Cập nhật cột task trong backlog và `07-screen-coverage.md`; mọi board thuộc trang 4–8, 13–15 của wireframe phải có task.
- Thêm task cuối `T1099 Lập kế hoạch W3` theo cùng quy ước.
- Đưa danh sách cho chủ dự án duyệt trước khi phát.

Không làm:
- Không tách W3+; không viết code.

## Tiêu chí chấp nhận
1. Cho backlog E06–E10 · Khi tách xong · Thì mọi feature P0/P1 của 5 epic có ≥ 1 task; không task nào > L; mọi task đạt Definition of Ready (`workflow.md` §5) hoặc ghi rõ quyết định mặc định.
2. Khi chạy kiểm phủ màn hình · Thì không còn board trang 4–8, 13–15 thiếu task.
3. Khi chủ dự án mở `agent-dispatch.md` · Thì có bảng đợt W2 với cột Chờ; không hai task cùng đợt chung `allowed_paths`.

## Ghi chú kỹ thuật
- Dùng script sinh task / board như PLAN-003 để nhất quán frontmatter.

## Kiểm thử bắt buộc
- Script kiểm phủ màn hình và kiểm trùng `allowed_paths` chạy xanh.

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
