# Cách làm việc theo wave, theo dõi task và tạo task mới

> Dành cho chủ dự án. Bổ sung cho `workflow.md` (quy tắc chi tiết). Đọc trong 5 phút.

## 1. Có bao nhiêu wave

7 wave, định nghĩa ở `docs/migration/05-waves.md`. Mỗi wave gom vài epic (E00–E15) và kết thúc ở một mốc demo được (M0–M6).

| Wave | Epic | Kết quả demo | Task đã tách? |
|---|---|---|---|
| W0 Chốt logic | E00 | KPI / mã / data dictionary / protocol được Executive ký; fixture legacy | chưa (việc với Executive, không phải code) |
| W1 Nền tảng | E01–E05 (phần init) | đăng nhập, master data Strains, khung web + mobile + offline, CI | **đã tách: 38 task** (PLAN-003) |
| W2 Maintenance Breeding | E06–E10 | chạy trọn Egg → Neonate → Nursery → Pupae → Egg + Larvae trên web + mobile | chưa |
| W3 Analytics + migrate | E11, E12 | dashboard, dữ liệu MB thật trên staging, đối chiếu KPI | chưa |
| W4 Cutover | E13 | chạy song song, khoá AppSheet, hypercare | chưa |
| W5 Project Management | E14 | dự án, task, chat, report | chưa |
| W6 Selective Breeding | E15 | một thế hệ MSB chạy hết vòng | chưa |

W0 chạy song song W1. W5 / W6 có thể chạy song song W3 / W4 nếu có người.

## 2. Theo dõi ở đâu

| Mức | Nơi xem | Ai cập nhật | Khi nào |
|---|---|---|---|
| Từng task | `docs/tasks/items/E0x/Txxxx-*.md` — dòng `status:` (todo → ready → in_progress → in_review → done, hoặc blocked) và mục "Kết quả" | agent làm task | mỗi lần đổi trạng thái, cuối phiên |
| Toàn wave | `docs/tasks/board.md` — một dòng mỗi task, cột Trạng thái + PR | agent sau mỗi PR; Planner mỗi ngày | mỗi PR |
| Epic | `docs/tasks/epics/E0x.md` — tiêu chí xong + bảng task | Planner | cuối epic |
| Feature (nghiệp vụ) | `docs/migration/03-feature-backlog.md` — 129 feature; thêm cột / ghi chú "task: Txxxx" khi feature được tách | Planner | khi tách task |
| Màn hình | `docs/migration/07-screen-coverage.md` — 146 board → feature → task | Planner (sinh lại bằng script) | khi tách task có UI |
| Nghiệm thu wave | `docs/tasks/initialization/acceptance-checklist.md` (W1); wave sau có checklist riêng | người duyệt | cuối wave |
| GitHub | PR + nhãn; ruleset bắt CI xanh; không dùng GitHub Issues làm nguồn chính (task file là nguồn) | — | — |

Cách xem nhanh tiến độ: mở `board.md`, đếm cột Trạng thái. Nếu muốn, chạy `grep -h '^status:' docs/tasks/items/*/*.md | sort | uniq -c`.

Quy tắc: `board.md` và `status:` trong task file phải khớp nhau; task `blocked` quá 1 ngày đưa lên thảo luận.

## 3. Nhịp làm việc

- Vòng 2 tuần: đầu vòng chọn task `ready` theo thứ tự epic và ưu tiên, giao theo cột Owner; cuối vòng demo trên staging.
- Mỗi task: agent mở worktree → làm trong `allowed_paths` → `pnpm ci` xanh → PR → anh (hoặc người được uỷ quyền) review → squash merge → agent cập nhật task file + board.
- Khi task `blocked`: mục "Câu hỏi" trong task file ghi câu hỏi + phương án đề xuất; anh trả lời ngay trong file hoặc trong chat, rồi đổi lại `ready`.

## 4. Khi nào và cách tạo task mới

Có ba tình huống.

**(a) Mở một wave mới (phổ biến nhất).** Không cần nhớ: đợt cuối của mỗi wave luôn có sẵn task `Txx99 Lập kế hoạch wave kế` (W1: T0599) của Planner. Anh phát task đó như mọi task khác; Planner sẽ:
1. Lấy feature của epic đó từ `03-feature-backlog.md` (cột Phụ thuộc, Nguồn, Phạm vi, Xong khi).
2. Tách mỗi feature thành 1–4 task ≤ 2 ngày theo lát dọc (API → UI web → UI mobile) hoặc theo lớp khi lát dọc quá lớn, theo mẫu `workflow.md` §4.4 (bối cảnh trỏ mục tài liệu, Làm / Không làm, tiêu chí Cho / Khi / Thì, `allowed_paths`, `wireframes:` ghi đúng board).
3. Tạo `docs/tasks/epics/E0x.md`, thêm vào `board.md`, cập nhật `07-screen-coverage.md` và cột task trong backlog.
4. Đưa anh duyệt danh sách trước khi giao agent.

**(b) Việc nhỏ phát sinh (bug, chỉnh sửa, câu hỏi từ user).** Tạo một task file bằng tay hoặc bảo Planner tạo: copy mẫu §4.4, `type: bug|chore`, `size: S|M`, ghi bước tái hiện / kết quả mong đợi, `allowed_paths`, gắn `epic` gần nhất; thêm dòng vào `board.md`. Lỗi từ đối chiếu migrate phân loại Match / Source Gap / Logic Difference / User Error / Platform Defect.

**(c) Yêu cầu mới không có trong AppSheet và không có trong backlog.** Đây là đổi phạm vi: trước tiên thêm feature vào `03-feature-backlog.md` (nguồn gốc `New`, lý do, wave), nếu ảnh hưởng kiến trúc thì thêm ADR Proposed; rồi mới tách task. Không tạo task trực tiếp để tránh mất dấu vết.

Checklist một task "đủ điều kiện bắt đầu" (Definition of Ready, `workflow.md` §5): có bối cảnh trỏ mục tài liệu cụ thể, có Làm / Không làm, tiêu chí Cho / Khi / Thì gồm trường hợp lỗi và quyền, phụ thuộc đã done, quyết định liên quan đã chốt hoặc ghi mặc định, có board wireframe nếu là UI, size ≤ L.

## 5. Ai làm gì

| Vai trò | Việc |
|---|---|
| Anh (chủ dự án) | duyệt danh sách task mỗi wave, trả lời `blocked`, review PR (hoặc uỷ quyền), deploy staging / production, chốt ADR |
| Claude Planner | tách task, giữ board / backlog / coverage / ADR / tài liệu nhất quán, nghiệm thu wave |
| Codex | task `area: backend`, `data` |
| Claude web / mobile | task `area: web` / `mobile` |
| Executive / Manager (nghiệp vụ) | ký KPI, protocol (W0), test nghiệm thu trên staging, trả lời câu hỏi nghiệp vụ trong task `blocked` |

## 6. Lệnh / câu hỏi mẫu để gọi Planner

- "Tách task cho E06 (Breeding lõi), ưu tiên P0 trước, ghi board wireframe cho từng màn."
- "Cập nhật board.md: T0302 done PR #12, T0303 in_review PR #15."
- "Tạo task bug: web /strains hiện mã trùng không báo lỗi; tái hiện …"
- "Nghiệm thu W1 theo acceptance-checklist và ghi kết quả."
- "Sinh lại 07-screen-coverage.md và báo board nào chưa có task sau khi tách W2."
