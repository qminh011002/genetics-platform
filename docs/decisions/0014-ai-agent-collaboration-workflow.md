# ADR-0014 · Quy trình làm việc cho agent AI: AGENTS.md là nguồn duy nhất, sở hữu theo đường dẫn, worktree, hook và gate enforce bằng tool

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
Codex (backend), Claude (web), Claude (mobile), Claude Planner. Nghiên cứu 26/10/2026: AGENTS.md là chuẩn mở (Codex, Copilot đọc; Claude Code đọc AGENTS.md **chỉ khi không có CLAUDE.md** hoặc khi CLAUDE.md `@AGENTS.md`); Codex gộp AGENTS.md từ gốc tới cwd, giới hạn 32 KiB, không đọc thư mục con dưới cwd; Claude Code có `.claude/rules/*.md` (frontmatter `paths`), hooks (`PreToolUse` exit 2 = chặn), `settings.json` permissions, skills, worktree `--worktree` (`.claude/worktrees/`, `.worktreeinclude` cho `.env`); Codex sandbox `workspace-write` giữ `.git` read-only, có `.codex/` setup script cho worktree; GitHub CODEOWNERS + rulesets.

## Quyết định đề xuất
1. **Một nguồn**: `AGENTS.md` gốc (≤ 200 dòng): mục tiêu, bản đồ repo, lệnh, thứ tự đọc tài liệu, luật chung, quy trình task / PR, "cấm". `CLAUDE.md` gốc = `@AGENTS.md` + 10 dòng riêng Claude (hook, skill). Mỗi app có `AGENTS.md` ngắn (≤ 60 dòng: lệnh, cấu trúc, tài liệu kiến trúc của app, vùng được sửa). `.claude/rules/{backend,web,mobile,shared}.md` với `paths:` cho luật theo file.
2. **Sở hữu theo đường dẫn** (`overview.md` §5.1) → `CODEOWNERS`; vùng chung (`contracts/`, `packages/`, `docs/`, `.github/`, `infra/`, `AGENTS.md`) cần Planner + người.
3. **Phạm vi task**: task file ghi `allowed_paths`; hook Claude `PreToolUse` (Edit / Write / Bash rm) đọc `TASK_SCOPE` và chặn ngoài phạm vi (exit 2); Codex chạy `codex exec --sandbox workspace-write` trong worktree của task; CI kiểm diff ngoài `allowed_paths` → nhãn `out-of-scope` cần duyệt.
4. **Worktree**: mỗi task một worktree (`claude --worktree T0607`, Codex worktree); `.claude/worktrees/` và `.codex/worktrees` gitignore; `.worktreeinclude` sao chép `.env`.
5. **Hợp đồng**: đổi API chỉ qua PR nhãn `contract`; frontend không bịa endpoint (ADR-0006).
6. **Dependency**: thêm gói = PR có nhãn `deps-approved` (CI kiểm diff lockfile).
7. **Test trước khi báo xong**: PR template bắt dán lệnh + kết quả; CI là trọng tài; agent không được tắt test / bỏ qua lint.
8. **Handoff**: cuối phiên agent ghi `docs/tasks/items/<id>.md` mục "Kết quả / Còn lại / Lệnh để tiếp tục"; `W1-status.md` cập nhật; phiên sau đọc task file + `git log` nhánh.
9. **Cấm** (enforce bằng mục 2–7, phần còn lại review): mở rộng phạm vi, thêm dependency không duyệt, abstraction thừa, thiết kế lại màn đã duyệt, đổi hợp đồng âm thầm, refactor module khác, báo xong không có test.

## Hệ quả
Task init tạo: `AGENTS.md`, `CLAUDE.md`, `.claude/{rules,hooks,settings.json}`, `.codex/setup.sh`, `.github/CODEOWNERS`, PR template, workflow `scope-check`. Nội dung đề xuất ở `docs/tasks/initialization/blueprint.md` phụ lục A. Xem lại khi Claude Code / Codex đổi cách đọc file hướng dẫn (theo dõi changelog mỗi quý).

## Tham chiếu
agents.md, OpenAI Codex docs (agents-md, worktrees, non-interactive, sandbox), Claude Code docs (memory, hooks, settings / permissions, skills, worktrees), GitHub CODEOWNERS / rulesets / environments — `research-references.md` §D.
