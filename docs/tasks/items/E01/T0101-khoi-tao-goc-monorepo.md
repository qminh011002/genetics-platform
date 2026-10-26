---
id: T0101
title: Khởi tạo gốc monorepo: pnpm 12 + catalog, Turborepo 2, uv workspace, husky / commitlint / lint-staged
epic: E01
status: ready
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
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
