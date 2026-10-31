@AGENTS.md
@.claude/karpathy-guidelines.md

# Riêng cho Claude Code
- Luật theo đường dẫn ở `.claude/rules/*.md` (tự nạp khi chạm file tương ứng).
- Hook `PreToolUse` (`.claude/hooks/scope-guard.sh`) chặn Edit/Write ngoài `TASK_SCOPE`. Đặt trước khi làm: `export TASK_SCOPE="services/backend/**,contracts/**"` (lấy từ `allowed_paths` của task).
- Làm trực tiếp trên nhánh `web/dev`; không tạo worktree riêng mỗi task. Không sửa `services/backend/` (Codex làm ở `backend/dev`, xem `AGENTS.md`).
- `/run-ci-locally` = `pnpm run ci` (không phải `pnpm ci`: ở pnpm 12 đó là lệnh clean install có sẵn); chạy trước khi mở PR.
- Không chạy `pnpm add` / `uv add` trừ khi task ghi dependency được duyệt.
