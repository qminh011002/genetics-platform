# Setup guide · Khởi tạo repo (các bước tái lập được, KHÔNG chạy trong PLAN-002)

> Thứ tự bắt buộc; mỗi bước có lệnh kiểm. Chạy trên máy dev Linux / WSL / macOS với Docker. Phiên bản theo `blueprint.md` §3; thay `<org>` bằng tổ chức GitHub. Mỗi bước nên là một commit riêng (Conventional Commits, scope `init`).

## 0. Điều kiện

- Node 22 LTS (`fnm` / `nvm`, `.nvmrc`), pnpm 12 (`corepack enable && corepack prepare pnpm@12 --activate` hoặc cài độc lập), uv 0.13 (`curl -LsSf https://astral.sh/uv/install.sh | sh`), Python 3.13 (uv tự tải), Docker ≥ 26 + Compose v2, git ≥ 2.40, Claude Code ≥ 2.1.277, Codex CLI.
- Quyết định đã chốt: web-first PWA, Procrastinate, VM nội bộ, Base UI, PostgreSQL 18, Python 3.13, GitHub Free.
- Tài khoản: GitHub repo `<org>/genetics_platform` (private), quyền tạo ruleset; Entra ID: 3 app registration (xem bước 8) — có thể làm sau với token giả.

Kiểm: `node -v && pnpm -v && uv --version && docker compose version`.

## 1. Gốc monorepo

```bash
git init -b main   # repo hiện chưa có commit; giữ docs/ hiện có
printf 'v22\n' > .nvmrc; printf '3.13\n' > .python-version
pnpm init   # rồi sửa package.json: "private": true, "packageManager": "pnpm@12.x.y", scripts (blueprint §2)
cat > pnpm-workspace.yaml <<'Y'
packages: ['apps/*', 'packages/*', 'services/backend']
catalog:
  react: 19.3.x
  react-dom: 19.3.x
  '@tanstack/react-query': 5.x
  zod: 4.x
  msw: 2.x
Y
pnpm add -Dw turbo@2 prettier prettier-plugin-tailwindcss eslint@10 typescript @commitlint/cli @commitlint/config-conventional husky lint-staged dependency-cruiser
npx husky init; echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg; echo 'pnpm lint-staged' > .husky/pre-commit
cat > turbo.json <<'J'
{ "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {}, "typecheck": { "dependsOn": ["^build"] }, "test": { "dependsOn": ["^build"] },
    "generate": { "cache": false }, "dev": { "cache": false, "persistent": true } } }
J
cat > pyproject.toml <<'T'
[tool.uv.workspace]
members = ["services/backend", "tools/legacy_import"]
[tool.ruff]
line-length = 100
target-version = "py313"
T
```

`.gitignore` thêm: `node_modules`, `.venv`, `dist`, `.turbo`, `.env`, `.claude/worktrees/`, `.codex/worktrees/`, `coverage`, `playwright-report`, `test-results`. `.gitattributes`: `* text=auto eol=lf`; `contracts/openapi/openapi.json linguist-generated` ; `packages/api-client/src/generated/** linguist-generated`.

Kiểm: `pnpm install` không lỗi; `git status` sạch sau commit.

## 2. Design tokens

```bash
mkdir -p packages/design-tokens/src packages/design-tokens/scripts
# package.json: name @genetics/design-tokens, "build": "tsx scripts/build.ts", exports ./web.css, ./tokens
```

`tokens.json` lấy từ `design-system.md` §11 (mở rộng đủ §3–5). `scripts/build.ts` sinh: `dist/web.css` (`@theme { --color-primary: … }` + `:root { --primary: … }` biến shadcn) và `dist/tokens.ts`. Test snapshot 2 file sinh.

**2b. `packages/ui`** — `pnpm dlx shadcn@4 init --monorepo -b base` tạo `packages/ui` + `components.json`; style `new-york`, `cssVariables: true`; `src/lib/cn.ts`; thêm `src/business/` (BatchCode, StrainBadge, StatusBadge, Can, EmptyState, ErrorState, NoAccess) viết tay theo `design-system.md`. Mỗi app có `components.json` với alias `ui` → `@genetics/ui/components`. Kiểm: `pnpm --filter @genetics/ui build typecheck`.

Kiểm: `pnpm --filter @genetics/design-tokens build && test -f packages/design-tokens/dist/web.css`.

## 3. Backend

```bash
mkdir -p services/backend && cd services/backend
uv init --package --name genetics-platform-backend --python 3.13   # tạo pyproject, src/genetics
uv add fastapi uvicorn[standard] "sqlalchemy[asyncio]>=2.1" "psycopg[binary]" alembic alembic-utils pydantic pydantic-settings procrastinate "PyJWT[crypto]" structlog sentry-sdk weasyprint segno jinja2 python-multipart httpx
uv add --dev pytest pytest-asyncio pytest-cov "testcontainers[postgres]" schemathesis asgi-lifespan ruff mypy import-linter pip-audit
```

- Tạo cấu trúc `backend.md` §5 với module rỗng (`identity`, `reference`, …) chỉ có `__init__.py` + `public.py` trống.
- `.importlinter`: contract `layers` cho mỗi module (`api > application > domain`, `infrastructure` chỉ import `domain|application`), `forbidden` domain → `fastapi|sqlalchemy|pydantic|httpx`, `independence` giữa `genetics.modules.*` trừ `public`, `acyclic siblings` trên `genetics.modules`.
- `alembic init -t async alembic`; `env.py` đọc `MIGRATION_DATABASE_URL`, `include_schemas`, đăng ký `alembic_utils` entities. Migration `0001_schemas` (4 schema + 3 role + extension `pgcrypto` nếu cần), `0002_auth` (bảng + seed), `0003_core_reference`, `0004_audit_trigger`, `0005_idempotency`.
- `bootstrap/app.py`: lifespan (engine, Procrastinate app), router `/api/v1`, problem handler, `/healthz`, `/readyz`, `generate_unique_id_function`.
- `genetics` CLI (typer hoặc argparse): `export-openapi`, `worker`, `seed-dev`.
- `package.json` bọc: `{"name":"@genetics/backend","private":true,"scripts":{"lint":"uv run ruff check . && uv run lint-imports","typecheck":"uv run mypy src","test":"uv run pytest","build":"uv build","export-openapi":"uv run genetics export-openapi > ../../contracts/openapi/openapi.json"}}`.
- `Dockerfile` theo `infrastructure.md` §4.

Kiểm: `uv run pytest` (test khung: app khởi động, `/healthz` 200, migration up/down/up trên testcontainers), `uv run lint-imports`, `uv run mypy src`, `pnpm --filter @genetics/backend export-openapi && test -s contracts/openapi/openapi.json`.

## 4. Hợp đồng và SDK

```bash
mkdir -p contracts/openapi packages/api-client/src
cd packages/api-client && pnpm init   # name @genetics/api-client; deps: @tanstack/react-query (peer), zod, msw (dev), @faker-js/faker (dev), orval (dev)
```

`orval.config.ts` (ADR-0006), `src/mutator.ts` (fetch + token provider + problem+json → `ApiError`), script `generate: orval`, `exports` cho `./generated/*` và `./mocks`. `contracts/openapi/spectral.yaml` (`extends: spectral:oas` + rule operationId pattern, problem schema cho 4xx).

Kiểm: `pnpm generate` → `git diff --exit-code contracts packages/api-client/src/generated`; `pnpm dlx @stoplight/spectral-cli lint contracts/openapi/openapi.json`; test MSW: `setupServer(...getAllHandlers())` trả 200 cho `/healthz` mock (OQ-10: thử với msw 3, nếu lỗi pin 2).

## 5. Shared

`packages/shared`: `format` (`formatNumber`, `formatInt`, `formatDate` theo `Asia/Ho_Chi_Minh`), `codes` (mã lỗi, blocker), `permissions` (mã quyền, `can()` helper), `enums` (nhãn + token trạng thái từ `design-system.md` §3.2), `forms` (zod rỗng + 1 mẫu `egg_collection`), `glossary`. Test Vitest cho format (`0,0291`, `11.140`).

Kiểm: `pnpm --filter @genetics/shared test`.

## 6. Web

```bash
pnpm create vite@latest apps/web --template react-ts   # rồi đổi name @genetics/web
cd apps/web && pnpm add react@catalog: react-dom@catalog: @tanstack/react-router @tanstack/react-query@catalog: @tanstack/react-table @tanstack/react-virtual react-hook-form @hookform/resolvers zod@catalog: @azure/msal-browser @azure/msal-react i18next react-i18next date-fns date-fns-tz recharts sonner cmdk lucide-react @genetics/api-client@workspace:* @genetics/shared@workspace:* @genetics/design-tokens@workspace:*
pnpm add -D @tanstack/router-plugin tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/user-event jsdom msw@catalog: @playwright/test @axe-core/playwright eslint-plugin-boundaries eslint-plugin-jsx-a11y eslint-plugin-react-hooks eslint-plugin-i18next typescript-eslint @rolldown/plugin-babel babel-plugin-react-compiler@1.0.0 size-limit
# shadcn đã init ở bước 2b (monorepo); app chỉ cần components.json trỏ @genetics/ui, rồi:
pnpm dlx shadcn@4 add button input select dialog sheet tabs table badge card alert toast switch checkbox radio-group command calendar progress avatar skeleton tooltip dropdown-menu   # CLI cài vào packages/ui
```

Tạo cấu trúc `web.md` §4; `globals.css` import `@genetics/design-tokens/web.css`; `eslint.config.js` với boundaries policies §5; `routes/__root.tsx`, `_app.tsx` (AppShell + guard), `login`, `worker`, `home` placeholder; `lib/api.ts` cung cấp token cho mutator; `testing/` với MSW; `e2e/` smoke + axe; `gallery/` route dev.

Kiểm: `pnpm --filter @genetics/web lint typecheck test build`; `pnpm --filter @genetics/web exec playwright test` (smoke đăng nhập giả).

## 7. Mobile (web-first PWA)

```bash
pnpm create vite@latest apps/mobile --template react-ts   # name @genetics/mobile
cd apps/mobile && pnpm add react@catalog: react-dom@catalog: @tanstack/react-router @tanstack/react-query@catalog: react-hook-form @hookform/resolvers zod@catalog: @azure/msal-browser @azure/msal-react i18next react-i18next date-fns date-fns-tz idb barcode-detector @genetics/ui@workspace:* @genetics/api-client@workspace:* @genetics/shared@workspace:* @genetics/design-tokens@workspace:*
pnpm add -D vite-plugin-pwa @tanstack/router-plugin tailwindcss @tailwindcss/vite vitest @testing-library/react jsdom msw@catalog: @playwright/test @axe-core/playwright eslint-plugin-boundaries @rolldown/plugin-babel babel-plugin-react-compiler@1.0.0 size-limit
```

`vite.config.ts`: `VitePWA({ strategies: 'injectManifest', srcDir: 'src/sw', filename: 'sw.ts', registerType: 'prompt', manifest: {...} })`; `index.html` meta Apple + `viewport-fit=cover`; `public/auth-redirect.html`; cấu trúc `mobile.md` §4; `src/platform/*`; `src/offline/*` khung; `components/mobile` (BottomTabBar, PhoneTile, MListRow, NumberField, SegmentedControl); CSP trong nginx (bước 9).

Kiểm: `pnpm --filter @genetics/mobile build` tạo `dist/sw.js` và `dist/manifest.webmanifest`; Playwright profile `iPhone 15` mở offline sau lần tải đầu; `no-restricted-globals` xanh.

## 8. Entra ID (có thể song song, cần IT)

1. App registration **API** `genetics-platform-api`: expose scope `access_as_user`, `requestedAccessTokenVersion: 2`, Application ID URI `api://genetics-platform-api`.
2. App **web** (SPA, redirect `https://<staging>/auth-redirect.html`, `http://localhost:5173/auth-redirect.html`), **mobile** (SPA, redirect của mobile). Cấp quyền delegated tới scope API; admin consent.
3. Backend env: `ENTRA_TENANT_ID`, `ENTRA_API_CLIENT_ID`, `ENTRA_WEB_CLIENT_ID`, `ENTRA_MOBILE_CLIENT_ID`. Local không có Entra: `AUTH_MODE=dev` nhận header `X-Dev-User` (chỉ khi `ENV=local`, test cấm ở staging).

Kiểm: đăng nhập web staging → `GET /me` có `platform: web`; token web gọi endpoint app → 403 `platform_not_allowed`.

## 9. Infra

`infra/compose.yaml` (postgres:18 với volume `/var/lib/postgresql`, api, worker, web, mobile, nginx; profile `dev` thêm `pgadmin`; profile `test`; profile `ops` thêm Uptime Kuma), `infra/compose.prod.yaml` (TLS, image từ GHCR theo `IMAGE_TAG`), `infra/deploy.sh` (theo `docs/ops/deploy-vm.md` §3), `infra/.env.example`, `infra/nginx/default.conf.template` (SPA fallback, `/api` proxy, no-store cho bridge, CSP), `infra/backup/backup.sh` + cron container, `docs/ops/restore-log.md` mẫu.

Kiểm: `docker compose -f infra/compose.yaml --profile dev up --wait` → `curl -f localhost/readyz`; `docker compose config` hợp lệ.

## 10. Agent và GitHub

Tạo `AGENTS.md`, `CLAUDE.md`, `.claude/{settings.json,rules,hooks,skills}`, `.codex/setup.sh`, `.github/{workflows,CODEOWNERS,pull_request_template.md,dependabot.yml}` theo `blueprint.md` §4, §7. Ruleset `main`: required checks (`lint`, `contract`, `test-backend`, `test-web`, `test-mobile`, `build`, `scope-check`), ≥ 1 review, linear, squash. GitHub Free và deploy thủ công: `release.yml` chỉ build + push image (`sha-*`, `v*`); không workflow deploy; `infra/deploy.sh` + `docs/ops/deploy-vm.md` là quy trình deploy. Root `package.json` phải có đủ script của `docs/getting-started.md` (`dev`, `build`, `build:tokens`, `generate`, `lint`, `typecheck`, `test`, `test:e2e`, `test:visual`, `contract:check`, `ci`).

Kiểm: PR rỗng → mọi check xanh; thử Edit ngoài `TASK_SCOPE` trong Claude → bị chặn; `codex exec --sandbox workspace-write "echo ok"` chạy trong worktree.

## 11. Lát dọc mẫu Strains (blueprint §6)

Làm theo thứ tự: migration + domain + use case + router + test backend → export OpenAPI → generate → web page + test + e2e + visual → mobile list. Đây là task cuối của init và là "mẫu vàng" để PLAN-003 tham chiếu.

Kiểm: `acceptance-checklist.md` toàn bộ xanh.
