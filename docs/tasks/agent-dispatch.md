# Điều phối agent · ai làm task nào, chạy song song thế nào

> Dành cho chủ dự án khi "phát việc". Nguồn: `board.md` (trạng thái), task file (nội dung), `how-to-work.md` (quy trình). Mỗi agent chạy trong **một worktree riêng, một task một lúc**; nhiều agent chạy song song miễn `allowed_paths` không giao nhau.

## 1. Làn (lane) và cách khởi động

| Lane | Agent | Khởi động một task | Ghi chú |
|---|---|---|---|
| **PL** | Claude Planner (Claude Code) | `claude --worktree <id>` rồi dán `docs/tasks/prompts/start-task.md` với id | Tài liệu, token, infra, CI, điều phối |
| **BE** | Codex | Codex desktop: New chat → Worktree → dán prompt start-task; hoặc `codex exec --sandbox workspace-write "$(sed s/TASK_ID/<id>/ docs/tasks/prompts/start-task.md)"` | `.codex/setup.sh` tự chạy khi tạo worktree |
| **WEB** | Claude Code (web) | `claude --worktree <id>` + prompt start-task | |
| **MOB** | Claude Code (mobile) | `claude --worktree <id>` + prompt start-task | |
| **HU** | Anh / IT | làm tay theo task file | T0110, T0205 |

Trước khi dán prompt, đặt phạm vi cho Claude: `export TASK_SCOPE="<allowed_paths của task, nối bằng dấu phẩy>"` (hook `scope-guard` dùng). Codex không cần vì sandbox chỉ ghi trong worktree, nhưng vẫn kiểm diff ở CI (`scope-check`).

Một lane có thể mở **nhiều phiên** nếu có ≥ 2 task `ready` không chung `allowed_paths` (ví dụ WEB chạy T0104 và T0103 cùng lúc trên hai worktree). Giới hạn thực tế: anh review được bao nhiêu PR một ngày.

## 2. Wave W1 · kế hoạch phát việc (đợt song song)

Mỗi đợt = tập task có thể chạy cùng lúc; đợt sau bắt đầu khi phụ thuộc của nó `done` (merge). Chỉ cần nhìn cột "Chờ" để biết khi nào bấm phát.

| Đợt | PL (Planner) | BE (Codex) | WEB (Claude) | MOB (Claude) | HU | Chờ |
|---|---|---|---|---|---|---|
| 0 | T0101 | — | — | — | T0205 (gửi IT, song song suốt W1) | — |
| 1 | T0102, T0106 | T0301 | T0104 | — | — | T0101 merge |
| 2 | T0105 | T0302 | T0103 (cần T0102) | — | — | đợt 1 |
| 3 | T0109 | T0303 → T0307 → T0304 (tuần tự, cùng lane) | T0306 (cần T0305? **không** — chạy được với spec rỗng của T0301; chốt lại sau T0305) | T0404 (cần T0103, T0104, T0306) | T0110 (cần T0105) | đợt 2 |
| 4 | review | T0305 → T0201 → T0202 | T0401 → T0402 | T0405 | — | đợt 3 |
| 5 | review | T0203 → T0204 → T0107 | T0206 → T0403 → T0108 | T0207 → T0406 → T0407 | — | đợt 4 |
| 6 | chuẩn bị T0506 | T0501 → T0502 → T0503 → T0308 | T0504 | T0505 | — | đợt 5 |
| 7 | T0506 | — | — | — | duyệt | tất cả |
| 8 | **T0599 lập kế hoạch W2** (tách task E06–E10, board W2, bảng đợt W2 thêm vào file này) | — | — | — | duyệt danh sách W2 | T0506 |

Quy ước cho mọi wave: **đợt cuối luôn là một task `Txx99` của Planner lập kế hoạch wave kế** (task + board + bảng đợt), chủ dự án duyệt rồi mới phát. Wave W2 sẽ có mục "## Wave W2" ngay dưới đây khi T0599 xong.

Đọc theo cột: mỗi cột là một agent, mũi tên là thứ tự trong cùng lane; các ô cùng hàng chạy song song. Nhiều nhất 4 agent + anh cùng lúc.

## 3. Luật tránh va chạm

1. Hai task đang `in_progress` không được chung `allowed_paths`. Kiểm nhanh trước khi phát: `scripts/ci/scope-overlap.sh T0103 T0104` (tạo ở T0105) hoặc so bằng mắt.
2. File dùng chung (`contracts/`, `packages/*`, `pnpm-workspace.yaml`, `uv.lock`, `docs/`) chỉ do một task sửa tại một thời điểm; task khác cần → chờ merge rồi rebase.
3. Thứ tự merge trong một đợt: task có `allowed_paths` rộng hơn (skeleton) merge trước; task phụ thuộc rebase lên `main` trước khi `pnpm ci`.
4. Agent gặp lỗi do task khác chưa merge → `blocked` kèm id task chờ, không tự sửa sang vùng người khác.
5. Mỗi PR một task; không gộp.

## 4. Theo dõi khi nhiều agent chạy

- `board.md`: cột Trạng thái + PR; cập nhật bởi agent cuối phiên. Xem nhanh: `grep -h '^status:' docs/tasks/items/*/*.md | sort | uniq -c`.
- Phiên đang chạy: `git worktree list` (mỗi worktree = một task đang làm) và `gh pr list --label task`.
- Task chặn: `grep -l 'status: blocked' docs/tasks/items/*/*.md` → mở mục "Câu hỏi", trả lời, đổi lại `ready`.
- Cuối ngày: mỗi agent phải để lại "Kết quả / Còn lại / Lệnh để tiếp tục" trong task file; phiên hôm sau dán prompt `resume-task.md`.

## 5. Khi một task xong

1. CI xanh, anh review (checklist PR), squash merge.
2. Agent đổi `status: done`, ghi PR vào task file và `board.md`.
3. Anh xem đợt kế: task nào có mọi `depends_on` = done thì đổi `todo → ready` và phát.
4. Planner cập nhật `07-screen-coverage.md` / backlog nếu task có UI hoặc đóng một feature.
