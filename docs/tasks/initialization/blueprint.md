# Initialization Blueprint (PLAN-002 → PLAN-003)

> Mô tả **trạng thái đích của repo sau khi khởi tạo** (mốc M1 "nền tảng", epic E01–E04 một phần) để PLAN-003 tách thành task. Không thực thi trong PLAN-002. Mọi phiên bản theo `research-references.md` (26/10/2026); chốt chính xác trong lockfile lúc làm.
> Quyết định đã chốt 26/10/2026: mobile **web-first PWA**, Procrastinate, VM nội bộ, Base UI, PostgreSQL 18, Python 3.13, GitHub Free. Các OQ còn lại dùng mặc định của `open-questions.md`.

## 1. Mục tiêu khởi tạo (Definition of Done của blueprint)

1. `git clone` → `pnpm install && uv sync --locked` → `pnpm dev` chạy được 3 app + Postgres (Compose) trên máy trống, theo `setup-guide.md`.
2. CI xanh với mọi gate **Init** của `quality-standards.md` §4 trên PR rỗng.
3. Đăng nhập Entra thật trên web và mobile (staging) hoặc token giả ở local; `GET /me` trả vai trò.
4. Một lát dọc mẫu chạy hết: `GET /strains` (backend domain → API → OpenAPI → SDK orval → web page `/strains` → mobile list) với test ở mọi tầng — làm "mẫu tham chiếu" cho agent.
5. Tài liệu agent (`AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`, CODEOWNERS, PR template) có hiệu lực.

## 2. Cấu trúc repo đích (chi tiết hơn `overview.md` §5)

```
genetics_platform/
├─ AGENTS.md  CLAUDE.md  README.md  LICENSE(?)  .editorconfig  .gitignore  .gitattributes  .nvmrc(22)  .python-version(3.13)
├─ package.json            # scripts: dev, build, lint, typecheck, test, generate, format; packageManager pnpm@12.x
├─ pnpm-workspace.yaml     # packages: apps/*, packages/*, services/backend (package.json bọc); catalog: react, react-dom, @tanstack/*, zod, msw, …
├─ turbo.json              # tasks: build (dependsOn ^build, outputs dist/**), lint, typecheck, test, generate (cache false), dev (persistent)
├─ pyproject.toml          # [tool.uv.workspace] members = ["services/backend", "tools/legacy_import"]; ruff/mypy chung
├─ uv.lock
├─ .pre-commit-config.yaml # ruff, ruff-format, lint-imports, gitleaks, prettier (lint-staged thay thế cho JS), commitlint
├─ commitlint.config.js
├─ .claude/
│  ├─ settings.json        # permissions allow: pnpm/uv/git read; deny: rm -rf, curl ngoài allowlist; hooks: PreToolUse scope-guard
│  ├─ rules/{backend,web,mobile,shared,docs}.md   # frontmatter paths:
│  ├─ hooks/scope-guard.sh
│  └─ skills/{run-ci-locally,new-endpoint,new-screen}/SKILL.md
├─ .codex/setup.sh         # cài deps trong worktree Codex (pnpm install, uv sync)
├─ .github/
│  ├─ workflows/ci.yml  release.yml  dependency-review.yml  nightly.yml
│  ├─ CODEOWNERS  pull_request_template.md  dependabot.yml  ISSUE_TEMPLATE/task.md
├─ apps/web/               (web.md §4)
├─ apps/mobile/            (mobile.md §4; Vite + React, cấu trúc như web)
├─ services/backend/       (backend.md §5) + package.json bọc uv + Dockerfile
├─ contracts/openapi/openapi.json  + spectral.yaml
├─ packages/ui/            components.json (base-ui), src/components/** (shadcn CLI), src/business/** (BatchCode, StrainBadge, StatusBadge, Can, Empty/Error/NoAccess), src/lib/cn
├─ packages/api-client/    orval.config.ts, src/mutator.ts, src/generated/**, src/mocks/**, package.json (exports)
├─ packages/shared/        src/{format,codes,permissions,enums,forms,glossary}/
├─ packages/design-tokens/ tokens.json, scripts/build.ts → dist/{web.css,tokens.ts}
├─ tools/legacy_import/    pyproject.toml (uv member), src/legacy_import/ (rỗng ở init)
├─ infra/compose.yaml  compose.dev.yaml  nginx/  backup/  .env.example
└─ docs/ (như hiện tại) + docs/ops/ + docs/data/
```

## 3. Package và dependency ban đầu (catalog)

| Nhóm | Gói (dòng phiên bản) |
|---|---|
| React | react 19.3, react-dom 19.3, babel-plugin-react-compiler 1.0 (pin), @rolldown/plugin-babel |
| Build | vite 8, @vitejs/plugin-react 6, typescript 5.x, vitest 5, @testing-library/react 16, msw 2.x (pin, OQ-10), @playwright/test 1.64, @axe-core/playwright 4.14 |
| Router / data | @tanstack/react-router 1.x + plugin, @tanstack/react-query 5, @tanstack/react-table 9, @tanstack/react-virtual 3 |
| UI | tailwindcss 4.3, shadcn 4 (dlx), @base-ui-components/react (theo CLI), lucide-react, cn, tw-animate-css, class-variance-authority, sonner, cmdk, recharts |
| Form | react-hook-form 7, @hookform/resolvers 6, zod 4 |
| Auth | @azure/msal-browser 5, @azure/msal-react 5 |
| i18n / date | i18next 26, react-i18next 17, date-fns 4, date-fns-tz |
| Codegen | orval 8 |
| Lint | eslint 10, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, eslint-plugin-boundaries 7, eslint-plugin-i18next, dependency-cruiser 18, prettier 3 + prettier-plugin-tailwindcss, @commitlint/cli 21 + config-conventional, lint-staged, husky 9 |
| Mobile | như web + vite-plugin-pwa 2 (workbox-build / workbox-window 7.4 kéo theo), idb 8, barcode-detector 3 |
| Backend | fastapi 0.162, uvicorn[standard], sqlalchemy[asyncio] 2.1, psycopg[binary] 3, alembic 1.20, alembic-utils, pydantic 2.14, pydantic-settings, procrastinate 3, PyJWT[crypto] 2.15, structlog 26, sentry-sdk 2.73, weasyprint 70, segno 1.6, jinja2, python-multipart, openpyxl (import xlsx), httpx; dev: pytest, pytest-asyncio 1.4, pytest-cov, testcontainers[postgres] 4.15, schemathesis 4, asgi-lifespan, ruff 0.17, mypy 2.4, import-linter 2.15, pip-audit |
| Infra | postgres:18, nginx:1.27-alpine, python:3.13-slim, node:22, ghcr.io/astral-sh/uv:0.13, mcr.microsoft.com/playwright:v1.64.1-noble, louislam/uptime-kuma:2 |

Thêm gói ngoài danh sách = PR nhãn `deps-approved` (ADR-0014).

## 4. Workflow CI (`ci.yml`) — job luôn chạy, lọc nội bộ

| Job | Bước | Gate |
|---|---|---|
| `setup` | checkout (fetch-depth 0), setup-node 22 + pnpm cache, setup-uv 0.13 + cache, `pnpm install --frozen-lockfile`, `uv sync --locked` | |
| `lint` | `turbo run lint typecheck --affected`; `uv run ruff check . && ruff format --check`; `uv run lint-imports`; `uv run mypy`; commitlint PR title; gitleaks | Init |
| `contract` | `uv run genetics export-openapi` → diff `contracts/`; `pnpm --filter @genetics/api-client generate` → diff generated; spectral; `oasdiff breaking origin/main..HEAD` (fail trừ nhãn) | Init |
| `test-backend` | services: postgres không cần (testcontainers dùng Docker của runner); `uv run pytest -m "not e2e" --cov`; migration up/down/up; schemathesis | Init |
| `test-web` | `turbo run test --filter=@genetics/web...` (Vitest + MSW) | Init |
| `test-mobile` | `turbo run test --filter=@genetics/mobile...` | Init |
| `build` | `turbo run build`; docker build 3 image (không push trên PR) | Init |
| `e2e` (nightly + nhãn `e2e`) | `docker compose --profile test up --wait`; Playwright trong container pin, shard 2, blob report + merge; visual + axe + PWA | W2 |
| `deps-review` | fail nếu lockfile đổi mà không có nhãn `deps-approved`; `pnpm audit`, `pip-audit` (warn ở Init, fail-high ở Harden) | Init / Harden |
| `scope-check` | diff path vs `allowed_paths` trong task file được tham chiếu bởi PR body → nhãn `out-of-scope` | Init |

`release.yml`: on push `main` → build + push image `sha-<sha>`; on tag `v*` → push `vX.Y.Z`. Không có job deploy: chủ dự án chạy `infra/deploy.sh <tag>` trên VM (`docs/ops/deploy-vm.md`).

## 5. Seed và dữ liệu khởi tạo

- Migration seed: 4 vai trò, danh mục quyền (`backend.md` §12 / overview), `form_def` 13 mã, user hệ thống, KPI v1 (chờ F-0002; ở init là placeholder có `version 0` đánh dấu `draft`).
- Seed dev: strains TMA / TME / REF, generations F0–F7, 10 cage, 10 room, 1 Executive, 1 Worker, 1 Manager, 1 Admin (email giả `@example.test`), 3 batch mẫu.
- Fixture legacy: từ F-0004 (W0), nằm `services/backend/tests/fixtures/legacy/` (ẩn danh).

## 6. Lát dọc mẫu "Strains" (task init cuối)

Backend: `reference` module (domain `Strain`, use case `ListStrains`, `CreateStrain` với quyền `strain.create`), migration, RLS không bật (tham chiếu), test unit + API + schemathesis → OpenAPI → orval → web `/strains` page với `DataTable`, `Can` (từ `@genetics/ui`), test Vitest + e2e + visual; mobile `reference` store (IndexedDB) + màn chọn dòng dùng `MListRow`, mở được offline. Mục đích: mọi agent có ví dụ "đúng chuẩn" để sao chép mẫu.

## 7. Phụ lục A · Nội dung đề xuất cho file hướng dẫn agent

### A.1 `AGENTS.md` (gốc, ≤ 200 dòng) — dàn ý

1. Dự án là gì (3 câu) + link `docs/architecture/overview.md`.
2. Bản đồ repo (bảng thư mục → chủ sở hữu → tài liệu).
3. Lệnh (chi tiết `docs/getting-started.md`): `pnpm install`, `uv sync --locked`, `pnpm build:tokens`, `pnpm generate`, `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm ci`, `docker compose --profile dev up`.
4. Thứ tự đọc bắt buộc theo vùng (backend: overview → backend → api-standards; web: overview → web → design-system → api-standards; mobile: overview → mobile → api-standards §9).
5. Luật chung: một task một PR ≤ 2 ngày; chỉ sửa trong `allowed_paths`; không thêm dependency; không sửa file sinh; không đổi hợp đồng ngoài PR `contract`; không thiết kế lại màn; test trước khi báo xong; thiếu thông tin → `blocked` + câu hỏi (`workflow.md` §9).
6. Quy ước commit / nhánh / PR (`workflow.md` §7).
7. Cấm tuyệt đối: commit secret, dữ liệu production ở local, tắt test, sửa migration đã merge.
8. Handoff: cập nhật task file + `W1-status.md`.

### A.2 `CLAUDE.md` (gốc)

```
@AGENTS.md

# Riêng cho Claude Code
- Rules theo path ở .claude/rules/. Hook scope-guard chặn Edit/Write ngoài TASK_SCOPE (đặt trong task file).
- Dùng worktree cho mỗi task: `claude --worktree <task-id>`.
- Skill: /run-ci-locally trước khi mở PR; /new-endpoint, /new-screen là mẫu.
- Không chạy `pnpm add` / `uv add` nếu task không ghi rõ dependency được duyệt.
```

### A.3 `services/backend/AGENTS.md`, `apps/web/AGENTS.md`, `apps/mobile/AGENTS.md` (≤ 60 dòng mỗi file)

Lệnh riêng của app, cấu trúc thư mục rút gọn, link tài liệu kiến trúc của app, checklist cuối tài liệu đó, vùng cấm (ví dụ web: không sửa `packages/api-client/src/generated`).

### A.4 `.claude/rules/backend.md` (frontmatter `paths: ["services/backend/**"]`)

Tóm tắt `backend.md` §3 (nguyên tắc), §4 (luật import), §17 (checklist) dưới 80 dòng. Tương tự `web.md`, `mobile.md`, `shared.md` (`packages/**`, `contracts/**`: chỉ sửa qua generate).

### A.5 `.claude/hooks/scope-guard.sh` (PreToolUse: Edit|Write|MultiEdit)

Đọc `TASK_SCOPE` (danh sách glob, ví dụ `services/backend/src/genetics/modules/reference/**`); nếu đường dẫn đích không khớp → in lý do, `exit 2`. Nếu `TASK_SCOPE` chưa đặt → cho phép nhưng in cảnh báo.

### A.6 `.github/CODEOWNERS`

```
/services/backend/            @<codex-reviewer-human>
/apps/web/                    @<web-reviewer-human>
/apps/mobile/                 @<mobile-reviewer-human>
/contracts/ /packages/ /docs/ /infra/ /.github/ /AGENTS.md /CLAUDE.md /.claude/   @<planner-reviewer-human>
```

### A.7 `.github/pull_request_template.md`

Task id · Phạm vi (Làm / Không làm) · Thay đổi · Cách kiểm (dán lệnh + kết quả) · Ảnh UI + tên board · Migration (downgrade? thời gian) · API đổi? (oasdiff) · Dependency mới? (nhãn) · Rủi ro · Checklist: không component / abstraction ngoài danh sách, không sửa file sinh, tài liệu cập nhật.
