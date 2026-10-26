# Chuẩn chất lượng và quality gate

> Áp dụng cho cả ba app và các package dùng chung. Mỗi gate ghi: **kiểm gì, công cụ, chạy ở đâu, bắt buộc từ giai đoạn nào** (`Init` = ngay khi khởi tạo repo, W1; `Harden` = trước go-live, W4). Quyết định nền: ADR-0013. Nguyên tắc: quy tắc nào không kiểm được bằng tool thì nằm trong checklist review PR và CODEOWNERS, không phải "tự nhớ".

## 1. Đánh giá kiến trúc theo tiêu chí well-architected

| Tiêu chí | Cách kiến trúc đáp ứng | Bằng chứng kiểm được |
|---|---|---|
| Maintainability | Module theo nghiệp vụ, 4 lớp rõ, luật import bằng tool, tài liệu sinh từ code (OpenAPI) | import-linter, boundaries, diff OpenAPI |
| Modularity | 13 module backend sở hữu bảng riêng, 19 feature web, feature mobile; giao tiếp qua `public.py` / `index.ts` | contract `independence`, test ownership bảng |
| Reliability | Transaction một use case, idempotency, outbox, FK / CHECK / UNIQUE, healthcheck, backup + restore drill | test integration rollback, e2e offline, restore log |
| Security | Entra OIDC, RBAC dữ liệu + RLS, audit trigger, CSP, secret ngoài repo, 404 cho tài nguyên bị ẩn | test RLS theo vai trò, gitleaks, schemathesis |
| Performance | Dữ liệu nhỏ; index theo truy vấn; view thường; ngân sách bundle | `size-limit`, `EXPLAIN` khi review migration index, SLO §7 |
| Scalability | API stateless (scale replicas), DB một node đủ; tiêu chí nâng cấp rõ (§7) | số đo SLO |
| Testability | Domain thuần; fake port; testcontainers; MSW sinh từ spec | coverage domain ≥ 90 % |
| Observability | log JSON + trace_id, Sentry, `/readyz`, Uptime Kuma | smoke sau deploy |
| Operational simplicity | Compose, không Redis / broker / K8s, deploy một lệnh | runbook |
| Cost | Server hiện có, SaaS free tier | §10 infrastructure |
| Onboarding | `AGENTS.md` ≤ 200 dòng + tài liệu kiến trúc có ví dụ luồng; `pnpm dev` một lệnh | setup-guide chạy được trên máy trống (acceptance-checklist) |

## 2. Gate theo tầng

### 2.1 Static analysis, format, type

| Gate | Công cụ | Phạm vi | Chạy | Từ |
|---|---|---|---|---|
| Format | ruff format; Prettier (+ tailwind plugin) | backend; web, mobile, packages | pre-commit, CI | Init |
| Lint | ruff (rules `E,F,B,UP,ASYNC,S` chọn lọc, `DTZ` cho domain); ESLint 10 flat (typescript-eslint, react-hooks recommended-latest, jsx-a11y, boundaries, i18next, `no-restricted-syntax` cho `fetch(`/hex) | như trên | pre-commit, CI | Init |
| Type | mypy `--strict` cho `domain`, `application`; chuẩn cho còn lại; `tsc --noEmit` strict mọi package TS | | CI | Init |
| Ranh giới kiến trúc | import-linter (`layers`, `forbidden`, `independence`, `acyclic siblings`); eslint-plugin-boundaries policies; dependency-cruiser `no-circular` | backend; web, mobile | CI (và pre-commit cho backend) | Init |
| Quy ước commit | commitlint `config-conventional` + scope = module / app; id task trong body | | commit-msg hook, CI | Init |
| Secret | gitleaks | repo | pre-commit, CI | Init |
| Bảo mật phụ thuộc | `pnpm audit --audit-level high`, `pip-audit`, Dependabot (pnpm, uv, docker, actions) | | CI weekly + PR | Init (audit), Harden (fail CI on high) |

### 2.2 Test

| Gate | Công cụ | Bắt buộc | Chạy | Từ |
|---|---|---|---|---|
| Unit backend | pytest (domain, application với fake port) | mọi gate / transition / code / KPI / DQ / edit policy; coverage domain ≥ 90 % | CI | Init (khung), W2 (ngưỡng) |
| KPI parity | pytest + Postgres: `kpi.py` = view SQL trên `fixtures/legacy`; so với KPI AppSheet, khác biệt phải nằm trong danh sách đã phân loại | | CI | W3 |
| Integration backend | testcontainers Postgres 16: repository, RLS 4 vai trò, trigger audit, migration up → down → up, `alembic check` | | CI | Init (migration), W2 (RLS) |
| API | httpx `ASGITransport` + `LifespanManager`: mã HTTP, `code`, phân trang, idempotency, `If-Match` | mỗi endpoint ghi | CI | Init |
| Contract | Spectral lint; schemathesis `from_asgi` không 5xx; `oasdiff breaking`; diff `contracts/` + `generated/` | | CI | Init |
| Unit / component web | Vitest 5 + Testing Library + MSW (handler sinh từ orval) | form (lỗi trường, lý do, 412), nút chốt (bật / tắt / blockers), DataTable | CI | Init (khung), W2 |
| Unit / component mobile | Vitest 5 + Testing Library + MSW (cùng stack web); unit sync engine với fake timers | | CI | Init (khung), W2 |
| E2E | Playwright 1.64 trong image pin `mcr.microsoft.com/playwright:v1.64.1-noble`, backend thật qua Compose profile `test` + seed; shard 2; trace on-first-retry | web: đăng nhập (token giả env test), tạo batch → nhập → chốt → batch mới; import có lỗi; Manager không thấy nút chốt. mobile: quét (nhập tay) → thu trứng → offline 3 bản ghi → online không trùng | CI (nightly + PR nhãn `e2e`) | W2 |
| Visual regression | Playwright `toHaveScreenshot` (gallery component + màn chính), baseline sinh trong Docker, `maxDiffPixelRatio 0.01` | | CI (PR chạm UI) | W2 |
| Accessibility | `@axe-core/playwright` tag wcag2a / 2aa / 21aa trên route smoke; jsx-a11y lint | 0 violation `serious` / `critical` | CI | W2 |
| PWA | Playwright: SW `ready`, mở offline sau lần tải đầu, manifest hợp lệ (schema), precache phủ chunk | | CI | W2 |
| Thiết bị thật | checklist `mobile.md` §12 | | thủ công mỗi bản phát hành | W4 |
| Hiệu năng | `size-limit` (web ≤ 250 KB gzip ban đầu, mobile ≤ 350 KB); API p95 < 300 ms cho `GET /batches/{id}` trên seed (pytest-benchmark báo, không fail) | | CI | Harden |

### 2.3 Review PR (CODEOWNERS + checklist)

| Vùng | Owner bắt buộc duyệt | Thêm người nắm nghiệp vụ |
|---|---|---|
| `services/backend/**` | Codex làm, **người** duyệt (reviewer con người) | KPI, gate, sinh mã, RBAC / RLS, migrate dữ liệu |
| `apps/web/**` | Claude web làm, người duyệt | màn có luật nghiệp vụ |
| `apps/mobile/**` | Claude mobile làm, người duyệt | offline, quét |
| `contracts/**`, `packages/api-client/**` | Codex (spec) + Claude web (generate); nhãn `contract` | Planner duyệt mã lỗi / quyền mới |
| `packages/shared/**`, `packages/design-tokens/**` | Planner | |
| `docs/architecture/**`, `docs/decisions/**`, `AGENTS.md`, `CLAUDE.md`, `.github/**`, `infra/**` | Planner + người | |

Checklist PR (template `.github/pull_request_template.md`): task id; phạm vi "Làm / Không làm"; cách kiểm; ảnh UI + tên board wireframe; migration có / không downgrade; API đổi? (`oasdiff` kết quả); rủi ro; "Không tạo component / abstraction mới ngoài danh sách" (tick).

Thứ tự review: đúng tiêu chí chấp nhận → đúng luật tài liệu → test đủ lỗi / quyền → kiến trúc (lớp, boundaries) → đặt tên.

## 3. Gate bắt buộc khi merge vào `main` (ruleset GitHub)

- Required status checks (luôn chạy, không dùng `paths:` ở mức workflow để tránh check pending): `lint`, `typecheck`, `test-backend`, `test-web`, `test-mobile`, `contract`, `build`. Job dùng `turbo run --affected` / `dorny/paths-filter` để **bỏ qua nội bộ** nhưng vẫn báo success.
- Required review: ≥ 1 người; CODEOWNERS cho vùng dùng chung (GitHub Free: ruleset hoạt động trên repo private; Environment reviewer không có → production deploy thủ công từ tag).
- Linear history, squash merge, branch up to date.
- `main` luôn deploy được staging (deploy tự động sau merge).

## 4. Init vs Harden

| Giai đoạn | Bắt buộc |
|---|---|
| **Init (W1, acceptance-checklist)** | format, lint, type, boundaries, commitlint, gitleaks, unit khung, API test khung, migration up/down/up, contract diff + Spectral + schemathesis khung, build 3 app, Compose up + healthcheck, `.env.example`, PR template, CODEOWNERS, ruleset |
| **W2–W3** | ngưỡng coverage domain, RLS test, component test, e2e đường chính, visual + axe, PWA test, KPI parity |
| **Harden (W4)** | audit fail-on-high, size-limit fail, benchmark báo cáo, backup + restore drill ghi log, Sentry + Uptime Kuma, runbook, checklist thiết bị thật, diễn tập rollback migration trên staging |

## 5. Definition of Done (bổ sung `workflow.md` §6)

- Mọi gate §2 của tầng liên quan xanh; không tắt test / `# noqa` / `eslint-disable` không lý do (lint cấm disable không có comment).
- Thay đổi API → `contracts/` + `generated/` sinh lại cùng PR; mã lỗi / quyền / form_code mới vào tài liệu + `packages/shared`.
- UI → đối chiếu wireframe, ảnh trong PR, không component trùng.
- Migration → downgrade được (hoặc lý do), đã chạy up/down/up trong CI, ghi thời gian ước tính.
- Tài liệu kiến trúc cập nhật nếu hành vi khác tài liệu; ADR mới nếu là quyết định lâu dài.

## 6. Quy tắc enforce cho agent (tool-first)

| Quy tắc | Enforce bằng |
|---|---|
| Không sửa ngoài phạm vi sở hữu | CODEOWNERS + ruleset; Claude Code hook `PreToolUse` (Edit / Write) từ chối đường dẫn ngoài `allowed_paths` của task (script `.claude/hooks/scope-guard.sh` đọc `TASK_SCOPE`); Codex sandbox `workspace-write` + `.codex` setup giới hạn cwd |
| Không thêm dependency không duyệt | CI: diff `pnpm-lock.yaml` / `uv.lock` → job `deps-review` yêu cầu nhãn `deps-approved`; `pnpm-workspace.yaml` `catalog:` là nguồn version duy nhất |
| Không sửa file sinh / hợp đồng tay | CI diff sau generate |
| Không đổi API âm thầm | `oasdiff breaking` + nhãn |
| Không thiết kế lại màn | checklist + visual regression (ảnh đổi phải được duyệt) |
| Không claim xong khi chưa test | PR template yêu cầu dán kết quả lệnh test; CI là nguồn sự thật |
| Không refactor module khác | boundaries + diff path ngoài scope → hook / review |

## 7. SLO và ngưỡng nâng cấp hạ tầng

| Số đo | Mục tiêu | Khi vượt → làm gì |
|---|---|---|
| `GET /batches/{id}` p95 (staging, seed) | < 300 ms | Xem `EXPLAIN`, thêm index; chưa cần cache |
| Dashboard `GET /analytics/dashboard` p95 | < 1 s | Chuyển view sang materialized + refresh sau commit |
| Job nền chờ trong hàng đợi | < 60 s (nhãn), < 10 phút (report) | Thêm worker replica (cùng máy) |
| Lỗi 5xx | < 0,1 % request / tuần | Sentry alert |
| Sẵn sàng | 99 % giờ làm việc (07:00–18:00) | Uptime Kuma |
| Kết nối DB dùng | < 70 % pool (5 + 10) | Tăng pool hoặc PgBouncer |
| Dung lượng DB | < 5 GB | Vẫn một node; xem partition chỉ khi > 50 GB |
| Khi cần ≥ 2 máy API hoặc ≥ 50 user đồng thời | — | Khi đó mới cân nhắc Redis / cache / K8s (ADR mới) |
