# Acceptance checklist · khởi tạo (M1 "nền tảng" — phần init)

> Mọi mục phải kiểm được bằng lệnh hoặc quan sát ghi rõ. Người duyệt đánh dấu kèm ngày. Mục có (*) là gate CI bắt buộc theo `quality-standards.md` §4 Init.

## A. Repo và công cụ

- [ ] (*) `pnpm install --frozen-lockfile` và `uv sync --locked` thành công trên máy trống theo `setup-guide.md` §0–1; mọi lệnh trong `docs/getting-started.md` §2–5 tồn tại và chạy được.
- [ ] (*) `pnpm lint && pnpm typecheck && pnpm test && pnpm build` xanh ở root (Turborepo).
- [ ] `pnpm-workspace.yaml` có `catalog:`; không package nào ghi version React / TanStack / zod / msw ngoài catalog (script kiểm).
- [ ] (*) pre-commit / husky chạy ruff, lint-imports, prettier, gitleaks, commitlint; commit sai format bị từ chối.
- [ ] `.gitattributes` đánh dấu file sinh; `.gitignore` có `.env`, worktrees.

## B. Backend

- [ ] (*) `uv run lint-imports` xanh với contract layers / forbidden / independence / acyclic.
- [ ] (*) `uv run mypy src` xanh (strict cho domain / application).
- [ ] (*) `uv run pytest`: app khởi động; `/healthz` 200; `/readyz` 200 khi DB + bảng job sẵn sàng; migration up → down → up trên testcontainers; `alembic check` không sinh thay đổi.
- [ ] PostgreSQL 18; 4 schema + 3 role DB tồn tại sau migration; `uuidv7()` dùng làm default; `app_rw` không phải owner bảng; `FORCE ROW LEVEL SECURITY` trên bảng mẫu.
- [ ] Seed: 4 vai trò `is_system`, danh mục quyền, 13 `form_def`, user hệ thống.
- [ ] Handler lỗi trả `application/problem+json` với `code`, `trace_id` cho 404 / 422 / 500 (test API).
- [ ] `set_config('app.*')` được đặt mỗi transaction (test integration đọc `current_setting`).
- [ ] Idempotency: POST mẫu với `id` client gửi 2 lần → 201 rồi 200; khác payload → 409.
- [ ] Procrastinate worker chạy (`genetics worker`), job mẫu `ping` thực thi, cron mẫu đăng ký (hoặc arq nếu OQ-2 từ chối).
- [ ] `uv run genetics export-openapi` tạo spec; `operationId` theo mẫu; Spectral xanh.
- [ ] Dockerfile build; container chạy non-root; `alembic upgrade head` trong entrypoint.

## C. Hợp đồng và SDK

- [ ] (*) CI diff `contracts/openapi/openapi.json` và `packages/api-client/src/generated/**` = 0 sau generate.
- [ ] (*) `oasdiff breaking` chạy trong CI; PR thử đổi tên trường → fail trừ nhãn.
- [ ] (*) schemathesis `from_asgi` chạy trên spec khung, không 5xx.
- [ ] Mock MSW sinh từ spec dùng được trong Vitest (ghi kết quả OQ-10: MSW 2 hay 3).

## D. Web

- [ ] (*) ESLint boundaries policies có hiệu lực: test cố ý import `features/a/components/x` từ `features/b` → lỗi; `fetch(` ngoài `lib/api.ts` → lỗi; hex trong className → lỗi.
- [ ] (*) `dependency-cruiser` no-circular xanh.
- [ ] `packages/ui`: `components.json` cố định (style new-york, base-ui, cssVariables); `src/components` chỉ có file do CLI sinh (đã sửa theo token); `src/business` có 7 component chung; web và mobile `globals.css` import token và dùng `@genetics/ui`.
- [ ] AppShell với sidebar theo quyền từ `/me/permissions` (mock); route guard `beforeLoad` chuyển `/login`; Worker → `/worker`.
- [ ] Trạng thái UI mẫu (skeleton / empty / error / no access) có trong gallery.
- [ ] (*) Vitest + Testing Library + MSW chạy; Playwright smoke + axe (0 serious / critical) + 1 ảnh visual baseline trong Docker image pin.
- [ ] `size-limit` báo cáo kích thước (chưa fail).

## E. Mobile

> Hoãn từ 2026-10-28 (chủ dự án: làm web + backend trước). Không chặn nghiệm thu init; chạy khi mobile mở lại.

- [ ] `vite-plugin-pwa` cấu hình `injectManifest`, `registerType: prompt`; `src/sw/sw.ts` có route theo `mobile.md` §7.2.
- [ ] `manifest.json` hợp lệ (name, short_name ≤ 12, icons 192 / 512 / maskable, display standalone, start_url, scope, theme_color); `index.html` có meta Apple + `viewport-fit=cover`.
- [ ] Service worker: precache shell + mọi chunk JS (`dist/assets/**`); `/auth-redirect.html` NetworkOnly; API NetworkOnly; "Có bản mới" không tự reload khi đang nhập.
- [ ] (*) Playwright profile điện thoại: tải lần đầu → offline → mở lại được shell; `navigator.serviceWorker.ready`.
- [ ] Outbox khung: lưu item vào IndexedDB khi offline, gửi khi `online`, backoff; unit test sync engine với fake timers.
- [ ] `src/platform/*` là nơi duy nhất dùng API trình duyệt (ESLint `no-restricted-globals` xanh).
- [ ] MSAL redirect flow với bridge page hoạt động ở staging (hoặc token giả local).

## F. Hạ tầng

- [ ] (*) `docker compose -f infra/compose.yaml config` hợp lệ; `postgres:18` với volume đúng `PGDATA`; mọi service có `healthcheck`; `--profile dev up --wait` xanh; `curl -f /readyz`.
- [ ] `infra/.env.example` có mọi biến; không `.env` trong git; gitleaks xanh toàn lịch sử.
- [ ] Nginx: SPA fallback, `/api` proxy, CSP, `no-store` cho bridge (kiểm bằng `curl -I`).
- [ ] Backup script chạy tay tạo file `.dump`; `pg_restore` vào DB tạm thành công (ghi `docs/ops/restore-log.md` lần 1).
- [ ] `release.yml` push image `sha-*` và `v*` lên GHCR; `infra/deploy.sh` chạy thử thành công trên stack staging của VM theo `docs/ops/deploy-vm.md` (backup trước, migrate, smoke).

## G. Agent và quy trình

- [ ] `AGENTS.md` ≤ 200 dòng; `CLAUDE.md` = `@AGENTS.md` + phần riêng; `AGENTS.md` mỗi app ≤ 60 dòng; `.claude/rules/*` có `paths:`.
- [ ] Hook scope-guard: Edit ngoài `TASK_SCOPE` bị chặn (exit 2) — kiểm thủ công có log.
- [ ] `.claude/settings.json` deny lệnh nguy hiểm (`rm -rf`, `git push --force`, `curl` ngoài allowlist).
- [ ] `.codex/setup.sh` chạy được trong worktree Codex; `codex exec --sandbox workspace-write` hoàn thành lệnh mẫu.
- [ ] CODEOWNERS, PR template, Dependabot (pnpm, uv, docker, actions; group minor/patch), (ruleset `main` hoãn cùng T0110) ruleset `main` với required checks luôn báo trạng thái (PR chỉ sửa `docs/` vẫn có check xanh).
- [ ] `docs/tasks/W1-status.md` tồn tại và khớp frontmatter task file.

## H. Lát dọc mẫu Strains

- [ ] Backend: domain `Strain`, use case, router, migration; test unit + API + RLS (không áp) + schemathesis.
- [ ] OpenAPI có `reference_list_strains`, `reference_create_strain`; SDK có `useReferenceListStrains`.
- [ ] Web `/strains` dùng `DataTable`, `Can('strain.create')`, i18n, trạng thái đủ; Vitest + e2e + visual.
- [ ] (hoãn) Mobile: `reference` store có strains; màn mẫu hiển thị offline sau khi đã online một lần.
- [ ] PR của lát dọc đi qua đủ gate và review; được ghi là "mẫu tham chiếu" trong `AGENTS.md`.

## I. Tài liệu

- [ ] Mọi ADR 0001–0016 có trạng thái cập nhật (Accepted / Proposed / Rejected) và tên vai trò duyệt.
- [ ] `open-questions.md` cập nhật câu trả lời; `overview.md` phản ánh quyết định cuối (mobile, job nền, DB version).
