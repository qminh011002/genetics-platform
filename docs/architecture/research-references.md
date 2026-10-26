# Nguồn nghiên cứu đã xác minh (PLAN-002)

> Mọi nguồn dưới đây được truy cập **26/10/2026** từ trang chính thức / primary source (tài liệu framework, npm / PyPI registry, Microsoft Learn, MDN BCD 8.1.7, WebKit, Chrome Developers, web.dev, GitHub docs). Phiên bản là "bản ổn định mới nhất hiển thị hôm đó". Mục "Không xác minh được" liệt kê những điều **không** tìm thấy trong nguồn chính thức — tài liệu kiến trúc không dựa vào chúng.

## A. Backend

| Chủ đề | Nguồn | Phiên bản / ngày | Điểm dùng |
|---|---|---|---|
| FastAPI | https://fastapi.tiangolo.com/release-notes/ · /advanced/events/ · /tutorial/dependencies/dependencies-with-yield/ · /deployment/server-workers/ · /tutorial/background-tasks/ · /advanced/path-operation-advanced-configuration/ · /tutorial/handling-errors/ | 0.162.0 (2026-10-23) | lifespan; yield dependency exit chạy sau response; `fastapi run --workers`; `generate_unique_id_function`; không có problem+json |
| SQLAlchemy | https://www.sqlalchemy.org/ · https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html · /core/pooling.html · /core/selectable.html · /orm/session_events.html · /orm/declarative_tables.html · https://docs.sqlalchemy.org/en/21/changelog/migration_21.html | 2.1.6 (2026-10-21); 2.0.55 legacy | async_sessionmaker, expire_on_commit=False, pool 5+10, with_for_update, after_begin, 2.1 đổi mặc định psycopg 3 / greenlet extra / autoflush |
| Alembic | https://alembic.sqlalchemy.org/en/latest/changelog.html · /autogenerate.html · /cookbook.html · /branches.html · /tutorial.html | 1.20.1 (2026-10-21) | autogenerate không phát hiện view / trigger / policy; alembic_utils; replaceable object; head-check |
| Pydantic | https://pydantic.dev/docs/validation/latest/ (changelog, concepts/models, standard types, strict_mode, performance) | 2.14.1 (2026-10-11) | from_attributes, Decimal → chuỗi JSON mặc định, strict |
| PostgreSQL | https://www.postgresql.org/support/versioning/ · /docs/16/ddl-rowsecurity.html · /docs/16/sql-createpolicy.html · /docs/16/sql-set.html · /docs/16/functions-admin.html · /docs/16/ddl-generated-columns.html · /docs/16/functions-uuid.html · /docs/18/functions-uuid.html · /docs/16/datatype-datetime.html · /docs/current/app-pgdump.html · /app-pgrestore.html · /continuous-archiving.html | 18.6 / 17.11 / 16.15 | RLS (FORCE, sub-select leak, LEAKPROOF), SET LOCAL / set_config, generated columns, uuidv7 chỉ PG18, timestamptz UTC, backup |
| pg_uuidv7 | https://github.com/fboulnois/pg_uuidv7 | PG 13–18 | tuỳ chọn |
| Job nền | https://arq-docs.helpmanual.io/ · https://pypi.org/project/arq/ · https://pypi.org/project/celery/ · https://pypi.org/project/taskiq/ · https://taskiq-python.github.io/guide/scheduling-tasks.html · https://dramatiq.io/ · https://pypi.org/project/saq/ · https://pypi.org/project/procrastinate/ · https://procrastinate.readthedocs.io/en/stable/ (connector, cron) | arq 0.28 "maintenance only"; Procrastinate 3.10.0 (2026-09-23); SAQ 0.26.4; Taskiq 0.13.0; Dramatiq 2.2.1; Celery 5.6.3 | ADR-0005 |
| import-linter / tach | https://import-linter.readthedocs.io/en/stable/ (+ contract_types/layers/) · https://pypi.org/project/import-linter/ · https://docs.gauge.sh/ · https://pypi.org/project/tach/ | 2.15 (2026-09-04); tach 0.35.3 beta | contract layers / forbidden / independence / acyclic siblings |
| Test | https://pytest-asyncio.readthedocs.io/ · https://testcontainers-python.readthedocs.io/en/latest/modules/postgres/README.html · https://schemathesis.readthedocs.io/en/stable/ (tutorials/pytest, reference/python) · https://www.python-httpx.org/advanced/transports/ | pytest-asyncio 1.4.1; testcontainers 4.15.0; schemathesis 4.32.5; httpx ASGITransport | from_asgi; LifespanManager cần thiết |
| uv / ruff / mypy / pyright / pre-commit | https://docs.astral.sh/uv/ (workspaces, sync, docker, github, python-versions) · https://docs.astral.sh/ruff/ · https://mypy.readthedocs.io/en/stable/command_line.html · https://github.com/microsoft/pyright/blob/main/docs/configuration.md · https://pre-commit.com/ | uv 0.13.5; ruff 0.17.2; mypy 2.4.0; pre-commit 4.7.0 | `uv sync --locked`; strict flags |
| Entra ID | https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens · /access-token-claims-reference · /v2-protocols-oidc · /refresh-tokens · /configurable-token-lifetimes | cập nhật 2026 | aud / iss / JWKS 24 h; azp chỉ v2; RT SPA 24 h |
| JWT | https://pyjwt.readthedocs.io/en/stable/usage.html · https://pypi.org/project/PyJWT/ · https://pypi.org/project/python-jose/ | PyJWT 2.15.1; python-jose 3.5.0 (gap 2021–2025) | PyJWKClient |
| PDF / QR | https://doc.courtbouillon.org/weasyprint/stable/first_steps.html · https://pypi.org/project/weasyprint/ · https://pypi.org/project/segno/ | WeasyPrint 70.0; segno 1.6.6 | Pango deps |
| Log / quan sát | https://www.structlog.org/en/stable/ (contextvars) · https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html · https://docs.sentry.io/platforms/python/integrations/fastapi/ · https://sentry.io/pricing/ · https://develop.sentry.dev/self-hosted/ | structlog 26.1.0; OTel FastAPI 0.66b1 (beta); sentry-sdk 2.73.0 | |

## B. Kiến trúc (literature)

| Nguồn | URL | Dùng |
|---|---|---|
| Architecture Patterns with Python (Cosmic Python) ch. 2, 4, 6, epilogue | https://www.cosmicpython.com/book/ | khi nào không cần repository / service layer / UoW; "adopt bit by bit" |
| Cockburn, Hexagonal Architecture (2005) | https://alistair.cockburn.us/hexagonal-architecture/ | port / adapter |
| Martin, The Clean Architecture (2012) | https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html | dependency rule; "circles are schematic" |
| Fowler, MonolithFirst (2015) | https://martinfowler.com/bliki/MonolithFirst.html | monolith có module trước |
| Brown, Modular Monoliths (GOTO 2018) | https://gotopia.tech/sessions/515/modular-monoliths | |
| Grzybek, modular-monolith-with-ddd | https://github.com/kgrzybek/modular-monolith-with-ddd | test kiến trúc bằng tool (NetArchTest ≈ import-linter) |
| RFC 9457 Problem Details | https://www.rfc-editor.org/rfc/rfc9457 | ADR-0007 |

## C. Web

| Chủ đề | Nguồn | Phiên bản | Điểm dùng |
|---|---|---|---|
| React | https://react.dev/blog/2026/09/09/react-19-3 · /blog/2025/10/07/react-compiler-1 · /learn/react-compiler/installation · /learn/creating-a-react-app · /learn/build-a-react-app-from-scratch | 19.3.1; Compiler 1.0.0 | Compiler với plugin-react ≥ 6 qua `@rolldown/plugin-babel` |
| Vite / PWA plugin | https://vite.dev/blog/announcing-vite8 · /guide/build · https://vite-pwa-org.netlify.app/guide/ · https://github.com/vite-pwa/vite-plugin-pwa/releases | Vite 8.3.5; vite-plugin-pwa 2.0.0 | Rolldown; Node ≥ 22.12 |
| TanStack Router | https://tanstack.com/router/latest/docs/framework/react/ (routing/file-based-routing, guide/search-params, guide/authenticated-routes, guide/code-splitting, guide/external-data-loading, guide/data-loading) | 1.170.46 | zod 4 trực tiếp; beforeLoad + redirect; ensureQueryData / useSuspenseQuery |
| TanStack Query | https://tanstack.com/query/latest/docs/framework/react/guides/ (query-keys, important-defaults, infinite-queries, suspense, invalidations-from-mutations) · (semi-official) https://tkdodo.eu/blog/effective-react-query-keys | 5.105.0 | key factory per feature |
| TanStack Table / Virtual | https://tanstack.com/table/latest/docs/ (overview, guide/migrating, guide/pagination, guide/sorting) · https://tanstack.com/virtual/latest/docs/introduction | Table **9.3.1**; Virtual 3.14.23 | v9 API đổi |
| shadcn/ui | https://ui.shadcn.com/docs (changelog, changelog/2026-07-base-ui-default, components-json, tailwind-v4, theming, monorepo, registry, cli) | CLI 4.22.1 | Base UI mặc định; `-b radix`; monorepo `packages/ui` |
| Tailwind | https://tailwindcss.com/docs/theme · https://tailwindcss.com/blog | 4.3.3 | `@theme`, `@theme inline` |
| NativeWind / Reusables | https://www.nativewind.dev/ · https://www.nativewind.dev/v5 · https://github.com/founded-labs/react-native-reusables | NativeWind 4.2.7 (TW3); 5.0.0-rc.0 (TW4, không production) | design-tokens hai định dạng |
| Form | https://github.com/react-hook-form/resolvers · https://zod.dev/v4 · https://zod.dev/v4/changelog | resolvers 6.0.0; RHF 7.91.0; zod 4.6.7 | `.default` → `z.input/z.output` |
| Client OpenAPI | https://orval.dev/ (guides/react-query, msw, zod, reference/configuration/output) · https://openapi-ts.dev/ (introduction, cli, openapi-fetch, middleware-auth, openapi-react-query) · https://heyapi.dev/openapi-ts/ (get-started, plugins/tanstack-query, plugins/msw, migrating) | orval 8.45.0; openapi-typescript 7.13.0 / openapi-fetch 0.17.0; hey-api 0.99.0 | ADR-0006 |
| MSAL | https://learn.microsoft.com/en-us/entra/msal/javascript/browser/about-msal-browser · /entra/identity-platform/scenario-spa-sign-in · /msal-js-initializing-client-applications · https://github.com/AzureAD/microsoft-authentication-library-for-js (lib/msal-browser/docs: initialization, caching, browser-specific-guidance, login-user, redirect-bridge; lib/msal-react/README) | msal-browser 5.26.0; msal-react 5.7.3 | redirect; cache; bridge page v5 |
| Kiến trúc frontend | https://feature-sliced.design/docs/ (get-started/overview, reference/layers, reference/public-api) · https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md · https://github.com/javierbrea/eslint-plugin-boundaries · https://www.jsboundaries.dev/docs/overview/ · https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md · https://github.com/sverweij/dependency-cruiser | boundaries 7.3.0; eslint 10.13.0; import-x 4.17.1; dependency-cruiser 18.7.0 | ADR-0008 |
| Test | https://vitest.dev/blog/vitest-5 · /guide/browser/ · https://mswjs.io/docs/migrations/2.x-to-3.x · https://playwright.dev/docs/ (test-snapshots, docker, accessibility-testing, test-components, release-notes, ci, test-sharding, trace-viewer-intro, test-webserver) · https://github.com/bvaughn/react-error-boundary | Vitest 5.0.5; MSW 3.0.3; Playwright 1.64.1; axe-playwright 4.14.0; react-error-boundary 6.1.6 | CT cũ bỏ; snapshot theo OS |
| i18n | https://www.i18next.com/ (principles/namespaces, translation-function/plurals) · https://react.i18next.com/latest/using-with-hooks · MDN Intl.NumberFormat (+ chạy thử Node 24 / ICU 78: `vi-VN` → `1.234.567,891`; PluralRules `vi` → `other`) | i18next 26.5.11; react-i18next 17.1.9 | |
| Storybook | https://storybook.js.org/blog/storybook-10/ · /docs/writing-tests/visual-testing · /docs/writing-tests/integrations/vitest-addon | 10.6.4 | để sau |

## D. Monorepo, CI/CD, agent

| Chủ đề | Nguồn | Phiên bản | Điểm dùng |
|---|---|---|---|
| pnpm | https://pnpm.io/ (pnpm-workspace_yaml, catalogs, filtering, lockfile, cli/audit, cli/deploy, cli/run, docker) · https://github.com/pnpm/pnpm/releases · https://pnpm.io/blog/releases/12.0 | 12.15.0 (Rust); lockfile 9.0 (có thể 2 document) | catalog; deploy |
| Turborepo | https://turborepo.dev/docs (reference/configuration, reference/run, core-concepts/remote-caching, crafting-your-repository/using-environment-variables, guides/tools/python, guides/multi-language) · https://github.com/vercel/turborepo/releases | 2.11.10 | Python workspaces experimental |
| Nx | https://cdn.jsdelivr.net/npm/@nxlv/python/package.json | plugin cộng đồng 23.3.1 | loại |
| uv | (xem A) + https://docs.astral.sh/uv/guides/integration/docker/ · /github/ · /dependabot/ · /renovate/ | 0.13.5 | |
| GitHub | https://github.com/actions/setup-node · https://github.com/astral-sh/setup-uv · https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax · …/about-protected-branches · …/about-rulesets · …/about-code-owners · …/manage-environments · …/oidc-in-azure · https://docs.github.com/en/code-security/ (dependabot supported-ecosystems, dependabot-options-reference, secret-scanning, push-protection) | setup-node v7; setup-uv v10 | paths filter → check pending; cooldown 3 ngày |
| Renovate / audit / gitleaks | https://docs.renovatebot.com/modules/manager/pep621/ · /npm/ · https://pypi.org/project/pip-audit/ · https://github.com/gitleaks/gitleaks | pip-audit 2.10.1; gitleaks 8.30.1 (feature-complete) | |
| Git worktree / agent | https://git-scm.com/docs/git-worktree · https://code.claude.com/docs/en/ (worktrees, common-workflows, memory, hooks, settings, permissions, skills) · https://learn.chatgpt.com/docs/ (environments/git-worktrees, local-environment, agent-approvals-security, agent-configuration/agents-md, non-interactive-mode) · https://agents.md/ · https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions | git 2.56; Claude Code ≥ 2.1.277 (đọc AGENTS.md) | ADR-0014 |
| Conventional Commits / commitlint | https://www.conventionalcommits.org/en/v1.0.0/ · https://commitlint.js.org/ | commitlint 21.2.4 | |
| Docker | https://docs.docker.com/compose/intro/compose-application-model/ · /reference/compose-file/ (version-and-name, services) · https://hub.docker.com/_/postgres · /_/redis · /_/nginx · https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files · https://github.com/containrrr/watchtower (archived 2025-12-17) | Compose spec; postgres 16.15 / 18 (PGDATA đổi) | |
| Backup | PostgreSQL pg_dump / pg_restore / continuous-archiving · https://pgbackrest.org/ · https://github.com/wal-g/wal-g | pgBackRest 2.60.0; WAL-G 3.0.9 | |
| Quan sát | https://opentelemetry.io/docs/collector/ · https://grafana.com/docs/opentelemetry/docker-lgtm/ · https://github.com/louislam/uptime-kuma | | để sau |
| Contract | https://github.com/oasdiff/oasdiff · https://github.com/OpenAPITools/openapi-diff · https://github.com/stoplightio/spectral · https://docs.pact.io/ | oasdiff 1.34.1 | ADR-0006 |
| Lighthouse | https://github.com/GoogleChrome/lighthouse/releases/tag/v12.0.0 · https://github.com/GoogleChrome/lighthouse-ci | 12.0 bỏ PWA category; LHCI 0.15.1 | không dùng cho PWA |
| Chromatic | https://www.chromatic.com/pricing | free 5.000 snapshot | để sau |

## E. Mobile PWA

| Chủ đề | Nguồn | Phiên bản | Điểm dùng |
|---|---|---|---|
| Expo | https://docs.expo.dev/versions/latest/ · https://expo.dev/changelog/sdk-58 · https://docs.expo.dev/more/expo-cli/ · /guides/publishing-websites/ · /guides/progressive-web-apps/ · /versions/latest/config/app/ · /router/reference/static-rendering/ · /router/reference/async-routes/ · /router/introduction/ · /router/reference/typed-routes/ · /router/basics/common-navigation-patterns/ · /router/reference/platform-specific-modules/ · /guides/customizing-metro/ · /workflow/web/ · SDK pages: camera, imagepicker, securestore, sqlite, notifications, font, haptics | SDK 58 (2026-10-15), expo 58.0.19 | không manifest / SW; `web.output single`; cảnh báo SW; safe-area CSS env |
| React Native Web | https://necolas.github.io/react-native-web/docs/ (lists, react-native-compatibility, browser-compatibility, platform, multi-platform) | 0.21.4 | FlatList "not optimized" |
| NativeWind / Reusables | (xem C) | | |
| iOS / WebKit | https://webkit.org/blog/13878/ (Web Push 16.4) · /blog/10218/ (ITP 7 ngày, Home Screen exempt) · /blog/14403/ (storage policy Safari 17) · /blog/14445/ · /blog/16574/ (18.4 Wake Lock, Declarative Push) · /blog/15865/ · https://webkit.org/?p=16993 (iOS 26 web app mặc định) · https://bugs.webkit.org/show_bug.cgi?id=185448, 215884, 254545, 249967, 243075, 280970 · Apple: ConfiguringWebApplications, MetaTags | | ma trận §9 mobile.md |
| Android / Chrome | https://web.dev/articles/install-criteria · https://developer.chrome.com/blog/update-install-criteria · /blog/background-sync · /docs/capabilities/periodic-background-sync · /docs/capabilities/shape-detection · /docs/capabilities/web-apis/wake-lock · /docs/capabilities/web-apis/badging-api · /blog/richer-install-ui-desktop · https://web.dev/articles/manifest-updates · /articles/webapks · Chrome Status 4757990523535360 | | |
| Workbox / SW | https://developer.chrome.com/docs/workbox/ (the-ways-of-workbox, modules/workbox-cli, reference/workbox-build, handling-service-worker-updates, modules/workbox-strategies) | 7.4.1 | injectManifest trên dist |
| Offline | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria · https://web.dev/learn/pwa/offline-data · /articles/offline-ux-design-guidelines · https://github.com/jakearchibald/idb · https://dexie.org/ | idb 8.0.4; Dexie 4.4.7 | |
| QR | https://github.com/zxing-js/library · https://github.com/zxing-js/browser · https://github.com/mebjas/html5-qrcode · https://github.com/Sec-ant/barcode-detector · MDN MediaTrackConstraints | zxing 0.23.0 (maintenance); html5-qrcode 2.3.8 (maintenance); barcode-detector 3.2.3 | ponyfill |
| Alternatives | https://capacitorjs.com/docs · /docs/web/progressive-web-apps | Capacitor 8.5.3 | ADR-0010 |
| Baseline / thị phần | https://web.dev/baseline · https://gs.statcounter.com/ios-version-market-share/mobile-tablet/worldwide · https://developer.apple.com/support/app-store/ · https://support.google.com/googleplay/answer/113412 | | |
| MDN BCD | https://unpkg.com/@mdn/browser-compat-data@8.1.7 | 2026-10-22 | ma trận tương thích |

## F. Không xác minh được (không dùng làm căn cứ)

1. FastAPI chính thức về RFC 9457 — không có (tự viết handler).
2. Alembic hướng dẫn CI; autogenerate policy RLS — không có.
3. `pg_uuidv7` trên cloud managed — không rõ.
4. Celery asyncio / Celery 6; Taskiq Postgres broker; SAQ driver Postgres.
5. Turborepo "khi nào đáng dùng"; Nx Python first-party; Codex CLI worktree; uv + pnpm coexistence; Playwright với docker-compose; Percy pricing.
6. openapi-typescript xử lý `operationId`; hey-api zod chi tiết / pricing; orval mock trên MSW 3; eslint-plugin-boundaries tuyên bố ESLint 10; MSAL cho standalone PWA; Storybook với Vitest 5; zod 4 ngày stable.
7. Expo: lịch sử bỏ Workbox; `web.output` mặc định SDK 58 (mâu thuẫn giữa config ref và release note); expo-sqlite web persistence; NativeWind 4 với SDK 58; reusables web; Expo Router tabs trên web.
8. iOS torch (không có BCD); Chrome prompt tự động còn cần `fetch` handler sau 2023; `clients.claim()` trong Workbox docs.
9. "Tránh generic repository" không có câu tường minh trong các nguồn kiến trúc; chỉ suy từ Cosmic Python về chi phí lớp gián tiếp.
