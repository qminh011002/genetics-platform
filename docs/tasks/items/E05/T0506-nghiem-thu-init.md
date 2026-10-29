---
id: T0506
title: Nghiệm thu init: chạy acceptance-checklist.md đầy đủ, ghi kết quả, đánh dấu lát dọc Strains là mẫu tham chiếu trong AGENTS.md, cập nhật ADR / open-questions / board
epic: E05
status: todo
area: docs
type: chore
priority: P0
size: S
depends_on: [T0502, T0503, T0504, T0106, T0107, T0108, T0109, T0204, T0206, T0403]
decisions: []
wireframes: []
owner: planner
allowed_paths:
  - "docs/**"
  - "AGENTS.md"
---

## Bối cảnh
Kết thúc PLAN-003 / mốc M1 phần init. Nguồn: `docs/tasks/initialization/acceptance-checklist.md`.

## Phạm vi
Làm:
- Chạy từng mục checklist, ghi ✓/✗ + ngày vào file; mục mobile (E, H-mobile) ghi "hoãn", không chặn nghiệm thu
- Thêm mục "Mẫu tham chiếu" vào `AGENTS.md` trỏ tới PR T0502 / T0504 (T0505 bổ sung khi mobile mở lại)
- Cập nhật trạng thái ADR còn Proposed đã được thực tế xác nhận (0001, 0002, 0006, 0007, 0008, 0011, 0013, 0014) nếu chủ dự án đồng ý; `open-questions.md` (OQ-10, OQ-14)
- `W1-status.md` cập nhật; viết ghi chú mở đầu W2 (khung `docs/tasks/W2-status.md`)

Không làm:
- Không làm feature W2

## Tiêu chí chấp nhận
1. Khi đọc checklist · Thì mọi mục (*) ✓; mục ✗ có task bug tương ứng

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Thủ công

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
