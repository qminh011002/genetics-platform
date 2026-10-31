---
id: T0109
title: Kích hoạt file hướng dẫn agent và quy trình: AGENTS.md theo app, .claude/rules, hooks scope-guard, settings, .codex/setup.sh, CODEOWNERS, PR template
epic: E01
status: in_review
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
- PR: [#14](https://github.com/qminh011002/genetics-platform/pull/14)
- Ghi chú (2026-10-31, Claude Code 2.1.316, codex-cli 0.166.0, pnpm 12.15.0):
  - `CODEOWNERS`: handle `@qminh011002` (collaborator duy nhất của repo). Sửa dòng cuối gộp 4 pattern trên một dòng — GitHub báo `Invalid owner on line 11` (`gh api repos/qminh011002/genetics-platform/codeowners/errors`); tách mỗi pattern một dòng.
  - `pnpm ci` ở pnpm 12 là lệnh clean install có sẵn (xoá `node_modules` rồi cài lại), **không** chạy script `ci`. Đổi thành `pnpm run ci` trong skill `/run-ci-locally`, `AGENTS.md`, `CLAUDE.md`, PR template. Không đổi nội dung luật.
  - Không sửa `scope-guard.sh` / `.codex/setup.sh`: cả hai chạy đúng.

### Log kiểm thử
Tiêu chí 1 — hook, đưa JSON PreToolUse vào script:
```
scope='services/backend/**'               file=apps/web/x.ts                 exit=2
  stderr: scope-guard: 'apps/web/x.ts' nằm ngoài TASK_SCOPE (services/backend/**). Nếu thật sự cần, đặt task 'blocked' và nêu lý do trong task file.
scope='services/backend/**'               file=services/backend/src/a.py     exit=0
scope='services/backend/**,contracts/**'  file=contracts/openapi/openapi.json exit=0
scope='.github/CODEOWNERS'                file=.github/CODEOWNERS            exit=0
scope='.claude/**'                        file=.claude/hooks/scope-guard.sh  exit=0
scope='' (chưa đặt)                       file=apps/web/x.ts                 exit=0 + cảnh báo
```
Tiêu chí 1 — phiên Claude Code thật: `TASK_SCOPE='services/backend/**' claude -p "Use the Write tool … create apps/web/x.ts" --permission-mode acceptEdits` →
```
PreToolUse:Write hook error: ["$CLAUDE_PROJECT_DIR"/.claude/hooks/scope-guard.sh]: scope-guard: 'apps/web/x.ts' nằm ngoài TASK_SCOPE (services/backend/**). …
$ ls apps/web/x.ts → No such file or directory
```
Tiêu chí 2 — worktree Codex `../gp-backend` (`backend/dev`, chưa có `node_modules` / `.venv`):
```
$ ./.codex/setup.sh            → exit 0
  pnpm install --frozen-lockfile ✓ · uv sync --locked ✓ · build:tokens ✓ (dist/web.css, dist/tokens.ts)
  pnpm generate: "No projects matched the filters" (chưa có @genetics/api-client — `|| true`, đúng thiết kế)
  setup done: v24.17.0 pnpm 12.15.0 uv uv 0.13.5
$ codex exec --sandbox workspace-write "Run exactly … pnpm -v && uv --version"
  sandbox: workspace-write [workdir, /tmp, $TMPDIR]
  /usr/bin/zsh -lc 'pnpm -v && uv --version' succeeded: 12.15.0 · uv 0.13.5
```
Tiêu chí 3 — PR template: PR của task này mở bằng template, đủ mục (Task, Phạm vi, Thay đổi, Cách kiểm, UI, Migration, API, Dependency, Rủi ro, Checklist). CODEOWNERS: `gh api "repos/qminh011002/genetics-platform/codeowners/errors?ref=web/dev"` → `{"errors":[]}`.

`pnpm run ci` (repo chính, `web/dev`):
```
format:check ✓ · check:catalog ✓ · lint 4/4 ✓ · typecheck 6/6 ✓
test: design-tokens 56 ✓ · ui 46 ✓ · shared 49 ✓ · backend 8 passed, 16 errors
  16 errors = test integration cần Docker (testcontainers: DockerException … No such file or directory); máy này không có Docker — không liên quan thay đổi của task, CI GitHub có Docker.
contract:check ✓ (không diff) · build 4/4 ✓   (chạy riêng vì chuỗi && dừng ở test)
```

## Còn lại
- Ngoài `allowed_paths`, vẫn ghi `pnpm ci`: `docs/getting-started.md`, `docs/tasks/prompts/start-task.md`, `docs/tasks/prompts/resume-task.md`, `docs/tasks/initialization/blueprint.md` — cần một task docs (Planner) đổi sang `pnpm run ci`.
- Repo chỉ có một người: GitHub không yêu cầu tác giả PR tự review với tư cách code owner; khi có thêm reviewer, thêm handle theo vùng. Bắt buộc review code owner nằm ở ruleset (T0110, đang hoãn).
- ADR-0014 §3 nói hook chặn cả `Bash rm`; hook hiện chỉ gắn `Edit|Write|MultiEdit` (`NotebookEdit` cũng chưa gắn). Không đổi vì task cấm đổi luật mà không sửa ADR.

## Lệnh để tiếp tục
- Review + merge PR; sau merge: `gh api repos/qminh011002/genetics-platform/codeowners/errors` phải trả `{"errors":[]}`.
