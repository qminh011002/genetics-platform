# AGENTS.md · Genetics Data Platform

Hướng dẫn cho mọi agent (Codex, Claude Code, Copilot) và người mới. File này là nguồn duy nhất; `CLAUDE.md` chỉ import nó. Giữ dưới 200 dòng.

## Dự án
Thay bộ app AppSheet của R&D Genetics (Entobel, nuôi ruồi lính đen) bằng: web React (máy tính, Executive / Manager / Admin), PWA web-first (điện thoại khu nuôi, Worker / Executive, offline-first), backend FastAPI + PostgreSQL 18. Nguồn sự thật kiến trúc: `docs/architecture/overview.md`. Quyết định: `docs/decisions/README.md`.

## Bản đồ repo và chủ sở hữu
| Thư mục | Chủ | Tài liệu |
|---|---|---|
| `services/backend/` | Codex | `docs/architecture/backend.md`, `services/backend/AGENTS.md` |
| `apps/web/` | Claude (web) | `docs/architecture/web.md`, `apps/web/AGENTS.md` |
| `apps/mobile/` | Claude (mobile) | `docs/architecture/mobile.md`, `apps/mobile/AGENTS.md` |
| `contracts/openapi/` | sinh từ backend; không sửa tay | `docs/architecture/api-standards.md` §16 |
| `packages/api-client/` | sinh bằng orval; Claude web chạy script | `api-standards.md` §17 |
| `packages/ui/`, `packages/shared/`, `packages/design-tokens/` | Claude Planner (PR nhãn `shared`) | `docs/design/design-system.md` |
| `infra/`, `.github/`, `docs/`, `.claude/`, `.codex/`, `AGENTS.md` | Claude Planner + người | `docs/architecture/infrastructure.md`, `quality-standards.md` |

## Lệnh
```
pnpm install --frozen-lockfile && uv sync --locked   # cài
pnpm build:tokens && pnpm generate                   # token, OpenAPI → SDK
pnpm dev | pnpm build | pnpm lint | pnpm typecheck | pnpm test | pnpm test:e2e | pnpm contract:check
pnpm run ci                                          # mọi gate như CI — chạy trước khi mở PR
docker compose -f infra/compose.yaml --profile dev up -d postgres
```
Chi tiết: `docs/getting-started.md`. Deploy: `docs/ops/deploy-vm.md` (chủ dự án làm).

## Thứ tự đọc trước khi làm task
1. Task file trong `docs/tasks/items/` (bối cảnh, phạm vi, tiêu chí, `allowed_paths`).
2. Mục tài liệu kiến trúc mà task trỏ tới (không đọc cả file nếu task chỉ trỏ một mục).
3. Backend: `backend.md` → `api-standards.md`. Web: `web.md` → `design-system.md` → `api-standards.md`. Mobile: `mobile.md` → `web.md` §5 (luật import) → `api-standards.md` §9.
4. Board wireframe nêu trong task (`docs/genetics-platform-wireframes/screens/<Board>.html`).

## Luật chung (có tool kiểm; xem `docs/architecture/quality-standards.md` §6)
- Một task = một PR, ≤ 2 ngày, chỉ sửa trong `allowed_paths` của task. Thiếu gì → đặt `status: blocked`, ghi câu hỏi + phương án đề xuất vào task file, dừng.
- Không thêm dependency (`pnpm add`, `uv add`) nếu task không ghi rõ; version JS chỉ trong `pnpm-workspace.yaml` `catalog:`.
- Không sửa file sinh (`contracts/openapi/*.json`, `packages/api-client/src/generated/**`, `packages/design-tokens/dist/**`). Đổi API = đổi code backend + `pnpm generate` + commit cả hai; breaking → nhãn `api-breaking`.
- Frontend không gọi `fetch` tay, không bịa endpoint: chỉ dùng hook từ `@genetics/api-client`; endpoint chưa có → blocked.
- Không thiết kế lại màn: UI theo đúng board wireframe; không tạo component ngoài danh sách `design-system.md` §6 (thêm = sửa tài liệu cùng PR); không hex / px tuỳ ý.
- Luật nghiệp vụ (gate, công thức, quyền, mã) chỉ lấy từ tài liệu / ADR; không tự chốt.
- Test trước khi báo xong: `pnpm run ci` xanh; dán kết quả vào PR. Không tắt test, không `# noqa` / `eslint-disable` không lý do.
- Cấm: commit secret hoặc `.env`; dữ liệu production ở local; sửa migration đã merge; `git push --force`; refactor ngoài phạm vi.

## Commit, nhánh, PR
- Chỉ hai nhánh dev, không tạo nhánh / worktree riêng mỗi task; mỗi task là một hoặc vài commit có id task:
  - Claude (web, docs, `packages/`): `web/dev` ở thư mục repo chính.
  - Codex (backend): `backend/dev` ở worktree `../gp-backend` (`git worktree add ../gp-backend backend/dev`). Xong stub hoặc hiện thực endpoint → merge `backend/dev` vào `web/dev`; Claude chạy `pnpm generate` sau merge. Trước khi làm tiếp, Codex merge `web/dev` vào `backend/dev`.
- Conventional Commits có id task: `feat(reference): list strains (T0502)`.
- PR theo `.github/pull_request_template.md`; squash merge; CI xanh + 1 review người.
- Cuối phiên: cập nhật task file (Kết quả / Còn lại / Lệnh tiếp) và `docs/tasks/W1-status.md`.

## Mẫu tham chiếu
Sau khi T0502 / T0504 / T0505 merge, các PR đó là mẫu cho endpoint, màn web, màn mobile mới (xem `docs/tasks/initialization/blueprint.md` §6).
