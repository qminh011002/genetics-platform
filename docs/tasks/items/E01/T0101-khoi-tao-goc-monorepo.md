---
id: T0101
title: Khởi tạo gốc monorepo: pnpm 12 + catalog, Turborepo 2, uv workspace, husky / commitlint / lint-staged
epic: E01
status: in_review
area: infra
type: chore
priority: P0
size: M
depends_on: []
decisions: [ADR-0001]
wireframes: []
owner: planner
allowed_paths:
  - "package.json"
  - "pnpm-workspace.yaml"
  - "turbo.json"
  - "pyproject.toml"
  - ".nvmrc"
  - ".python-version"
  - ".editorconfig"
  - ".gitignore"
  - ".gitattributes"
  - ".husky/**"
  - ".pre-commit-config.yaml"
  - "commitlint.config.js"
  - "prettier.config.js"
  - "eslint.config.base.js"
  - "tools/legacy_import/pyproject.toml"
  - "tools/legacy_import/src/**"
  - "scripts/**"
---

## Bối cảnh
Repo chưa có commit; thư mục `apps/ services/ packages/ contracts/` trống. Cần gốc monorepo để mọi task khác chạy song song. Nguồn: `setup-guide.md` §1, `blueprint.md` §2–3, ADR-0001.

## Phạm vi
Làm:
- `package.json` gốc (`private`, `packageManager: pnpm@12.x`, scripts `dev build build:tokens generate lint typecheck test test:e2e test:visual contract:check ci format`)
- `pnpm-workspace.yaml` với `packages` và `catalog:` (react, react-dom, @tanstack/*, zod, msw, vite, vitest, typescript…)
- `turbo.json` theo blueprint §2
- `pyproject.toml` gốc với `[tool.uv.workspace]` members `services/backend`, `tools/legacy_import` (thư mục stub có `pyproject.toml` tối thiểu), ruff / mypy chung
- `.nvmrc` 22, `.python-version` 3.13, `.editorconfig`, `.gitignore`, `.gitattributes` (file sinh `linguist-generated`)
- husky `commit-msg` (commitlint config-conventional) + `pre-commit` (lint-staged: prettier, eslint; `pre-commit` python: ruff, lint-imports, gitleaks qua `.pre-commit-config.yaml`)
- Prettier + plugin tailwind config gốc; ESLint 10 flat config gốc chia sẻ (`eslint.config.base.js`)

Không làm:
- Không tạo nội dung app (các task sau)
- Không bật Turborepo Python experimental
- Không thêm dependency ngoài danh sách blueprint §3

## Tiêu chí chấp nhận
1. Cho máy trống có Node 22, pnpm 12, uv 0.13 · Khi chạy `pnpm install --frozen-lockfile && uv sync --locked` · Thì thành công, `pnpm -r exec echo ok` liệt kê các workspace hiện có
2. Khi commit message `update stuff` · Thì husky từ chối; `feat(init): add workspace (T0101)` được nhận
3. Khi chạy `pnpm lint typecheck test build` trên repo còn trống · Thì turbo chạy xong không lỗi (không có task → skip)
4. Khi `git status` sau commit · Thì không có `node_modules`, `.venv`, `.turbo` bị theo dõi

## Ghi chú kỹ thuật
- Dùng `uv init --bare` cho `tools/legacy_import` để workspace hợp lệ ngay
- `catalog:` là nơi duy nhất ghi version thư viện dùng chung; test script `scripts/check-catalog.mjs` báo package nào ghi version riêng

## Kiểm thử bắt buộc
- Smoke: CI job `setup` (T0105) chạy cài đặt trên runner

## Câu hỏi
- (trống — các điểm cần người quyết định ghi ở "Ghi chú" bên dưới)

## Kết quả (điền khi xong)
- PR: chưa mở — máy chưa có `gh` CLI và repo chưa có remote. Nhánh `infra/T0101-khoi-tao-goc-monorepo` (1 commit baseline `chore(init)` trên `main` + 1 commit task). Lệnh mở PR khi có remote: xem "Lệnh để tiếp tục".
- Ghi chú:
  - Đã tạo: `package.json` (pnpm@12.15.0, scripts theo phạm vi + `format:check`, `check:catalog`, `prepare: husky`), `pnpm-workspace.yaml` (60 mục catalog theo blueprint §3, version lấy từ registry 26/10/2026), `turbo.json`, `pyproject.toml` (uv workspace + ruff/mypy chung), `.nvmrc`=22, `.python-version`=3.13, `.editorconfig`, `.gitignore`, `.gitattributes`, `.husky/{commit-msg,pre-commit}`, `.pre-commit-config.yaml` (ruff v0.17.2, gitleaks v8.30.1, lint-imports local), `commitlint.config.js`, `prettier.config.js`, `eslint.config.base.js`, `tools/legacy_import` (uv init --bare), `scripts/check-catalog.mjs`, `pnpm-lock.yaml`, `uv.lock`.
  - **Ngoài `allowed_paths` (cần để `uv sync --locked` chạy):** `services/backend/pyproject.toml` stub (`uv init --bare`). uv từ chối workspace có member thiếu `pyproject.toml` (kể cả khi dùng glob). T0301 sửa/thay file này (không `uv init` lại). `pnpm-lock.yaml`, `uv.lock` là lockfile sinh bởi lệnh cài.
  - **`pnpm ci` bị pnpm hiểu là lệnh cài sẵn (`pnpm install --frozen-lockfile`)**, không chạy script root. Dùng **`pnpm run ci`**. Đề xuất: sửa `AGENTS.md`, `CLAUDE.md`, `.claude/skills/run-ci-locally/SKILL.md`, `docs/getting-started.md` thành `pnpm run ci` (ngoài phạm vi T0101 → T0109).
  - Dependency gốc ngoài danh sách blueprint §3: `@eslint/js` (gói chính thức của ESLint, cần cho `js.configs.recommended`). Không có `eslint-comments` plugin nên "disable phải có lý do" chưa có tool kiểm (chỉ `reportUnusedDisableDirectives: error`).
  - `eslint.config.base.js` gồm: js + typescript-eslint recommended, react-hooks `recommended-latest`, jsx-a11y, i18next `no-literal-string` (jsx), `no-restricted-syntax` cấm `fetch(` và màu hex; ignore file sinh. App import rồi nối boundaries riêng.
  - Prettier: file sinh / lockfile bỏ qua bằng `overrides.requirePragma`; `.claude/`, `.codex/` loại khỏi glob script (override theo thư mục dot không khớp).
  - Pre-commit Python chạy qua `uvx pre-commit run` nếu chưa cài `pre-commit` (lần đầu tải ruff/gitleaks ~1–2 phút); không có uv → bỏ qua kèm cảnh báo, CI vẫn chạy.
  - `.gitignore` giữ dòng `*/genetics-platform-wireframes` có sẵn → `docs/genetics-platform-wireframes/` KHÔNG được commit (agent đọc wireframe cần có bản local). Chưa đổi vì là quyết định có trước; cần người xác nhận.
  - Kiểm tiêu chí (26/10/2026, Node 24.17 / pnpm 12.15.0 / uv 0.13.5 — máy dev chưa có Node 22):
    1. `pnpm install --frozen-lockfile && uv sync --locked` ✅. `pnpm -r exec echo ok` → "No projects matched" (chưa có package con; `pnpm -wr exec echo ok` → ok).
    2. `git commit -m "update stuff"` → husky/commitlint từ chối (type-empty, subject-empty) ✅; `feat(init): …(T0101)` được nhận ✅ (commit của task này).
    3. `pnpm lint typecheck test build` → turbo "0 tasks, No tasks were executed", exit 0 ✅. `pnpm run ci` exit 0 ✅ (format:check, check:catalog OK 60 mục, turbo 4 task rỗng, contract:check bỏ qua vì chưa có package).
    4. `git status` sau commit sạch; `node_modules`, `.venv`, `.turbo` không được theo dõi ✅.
    - Thêm: `eslint --config eslint.config.base.js` trên file mẫu báo đúng 2 lỗi hex + fetch ✅; `pnpm format` không đụng `pnpm-lock.yaml`, `.claude/settings.json` ✅.
- Còn lại:
  - Push nhánh + mở PR (chưa có remote/gh). Nhãn: `shared`? không — chỉ `infra`; không `contract`, không `visual-change`; cân nhắc `deps-approved` vì có `@eslint/js` ngoài danh sách.
  - Người quyết: giữ hay bỏ ignore `*/genetics-platform-wireframes`; đổi tài liệu `pnpm ci` → `pnpm run ci` (T0109).
- Lệnh để tiếp tục:
  ```
  git checkout infra/T0101-khoi-tao-goc-monorepo
  pnpm install --frozen-lockfile && uv sync --locked && pnpm run ci
  git push -u origin main && git push -u origin infra/T0101-khoi-tao-goc-monorepo
  gh pr create --title "feat(init): bootstrap monorepo root (T0101)" --body-file .github/pull_request_template.md --label infra
  ```
