@AGENTS.md

# Riêng cho Claude Code
- Luật theo đường dẫn ở `.claude/rules/*.md` (tự nạp khi chạm file tương ứng).
- Hook `PreToolUse` (`.claude/hooks/scope-guard.sh`) chặn Edit/Write ngoài `TASK_SCOPE`. Đặt trước khi làm: `export TASK_SCOPE="services/backend/**,contracts/**"` (lấy từ `allowed_paths` của task).
- Mỗi task một worktree: `claude --worktree <task-id>`; `.env` được copy nhờ `.worktreeinclude`.
- `/run-ci-locally` = `pnpm ci`; chạy trước khi mở PR.
- Không chạy `pnpm add` / `uv add` trừ khi task ghi dependency được duyệt.
