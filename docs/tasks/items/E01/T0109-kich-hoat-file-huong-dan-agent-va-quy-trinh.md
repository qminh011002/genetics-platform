---
id: T0109
title: Kích hoạt file hướng dẫn agent và quy trình: AGENTS.md theo app, .claude/rules, hooks scope-guard, settings, .codex/setup.sh, CODEOWNERS, PR template
epic: E01
status: ready
area: docs
type: chore
priority: P0
size: S
depends_on: [T0101]
decisions: [ADR-0014]
wireframes: []
owner: planner
allowed_paths:
  - "AGENTS.md"
  - "CLAUDE.md"
  - ".claude/**"
  - ".codex/**"
  - ".github/CODEOWNERS"
  - ".github/pull_request_template.md"
  - ".github/ISSUE_TEMPLATE/**"
  - "apps/web/AGENTS.md"
  - "apps/mobile/AGENTS.md"
  - "services/backend/AGENTS.md"
---

## Bối cảnh
PLAN-003 đã viết bản gốc các file này (xem `AGENTS.md`, `.claude/`, `.github/`). Task này kiểm chúng chạy thật sau khi repo có code và điền handle reviewer.

## Phạm vi
Làm:
- Điền handle GitHub thật vào `.github/CODEOWNERS`
- Kiểm hook `scope-guard.sh` chặn Edit ngoài `TASK_SCOPE` (ghi log kiểm thử vào task file)
- Kiểm `.codex/setup.sh` chạy trong worktree Codex (pnpm install, uv sync)
- Tạo skill `/run-ci-locally` gọi `pnpm ci`

Không làm:
- Không thay đổi nội dung luật mà không sửa ADR-0014

## Tiêu chí chấp nhận
1. Cho `TASK_SCOPE=services/backend/**` · Khi Claude Edit `apps/web/x.ts` · Thì bị chặn (exit 2) có thông báo
2. Khi `codex exec --sandbox workspace-write "pnpm -v"` trong worktree · Thì chạy được sau `.codex/setup.sh`
3. Khi mở PR · Thì template hiện đủ mục; CODEOWNERS yêu cầu review đúng vùng

## Ghi chú kỹ thuật
- Claude Code ≥ 2.1.277; Codex CLI bản hiện tại

## Kiểm thử bắt buộc
- Thủ công có ghi log

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
