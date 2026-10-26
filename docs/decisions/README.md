# Architecture Decision Records

Mẫu: Bối cảnh · Động lực quyết định · Phương án · Đánh đổi · Quyết định đề xuất · Hệ quả · Tham chiếu · Trạng thái. Trạng thái **Proposed** cho tới khi người có thẩm quyền (Genetics Manager / người duyệt kỹ thuật) ghi "Accepted" kèm ngày và tên vai trò. Không agent nào được tự đổi sang Accepted.

| ADR | Quyết định | Trạng thái | Chặn |
|---|---|---|---|
| [0001](0001-repo-layout-and-monorepo-tooling.md) | Bố cục monorepo, pnpm + Turborepo + uv | Proposed | E01 |
| [0002](0002-backend-modular-monolith-clean-architecture.md) | Backend: modular monolith + clean architecture, import-linter | Proposed | E01, E06 |
| [0003](0003-persistence-sqlalchemy-psycopg-alembic.md) | SQLAlchemy 2.1 + psycopg 3, Alembic + alembic_utils, PostgreSQL 18, Python 3.13 | **Accepted** 26/10/2026 | E05 |
| [0004](0004-auth-entra-rbac-rls.md) | Entra ID OIDC v2, RBAC dữ liệu, Postgres RLS 3 lớp | Proposed | E02 |
| [0005](0005-background-jobs-procrastinate.md) | Job nền trên PostgreSQL (Procrastinate), bỏ Redis | **Accepted** 26/10/2026 | E03 |
| [0006](0006-contract-first-openapi-orval.md) | Contract-first: OpenAPI commit, SDK + mock bằng orval, oasdiff, schemathesis | Proposed | E03, E04 |
| [0007](0007-error-format-problem-json.md) | Lỗi RFC 9457 problem+json với `code` ổn định | Proposed | E03 |
| [0008](0008-web-feature-based-architecture.md) | Web: feature-based + luật import bằng eslint-plugin-boundaries | Proposed | E04 |
| [0009](0009-web-ui-shadcn-tokens-no-shared-ui-package.md) | shadcn/ui (Base UI) trong `packages/ui` dùng chung, design-tokens, visual regression bằng Playwright | **Accepted** 26/10/2026 | E04 |
| [0010](0010-mobile-expo-vs-web-first-pwa.md) | Mobile: **web-first PWA** (Vite + React + shadcn + vite-plugin-pwa) | **Accepted** 26/10/2026 | E04 |
| [0011](0011-mobile-offline-outbox.md) | Offline: outbox IndexedDB, idempotency, server thắng | Proposed | E04 |
| [0012](0012-infrastructure-compose-single-server.md) | Compose trên VM nội bộ, deploy từ CI, backup | **Accepted** 26/10/2026 | E01 |
| [0013](0013-quality-gates.md) | Quality gate Init / Harden | Proposed | E01 |
| [0014](0014-ai-agent-collaboration-workflow.md) | AGENTS.md / CLAUDE.md, sở hữu, worktree, hook, PR gate | Proposed | E01 |
| [0015](0015-file-storage.md) | Lưu file: interface + ổ server, SharePoint / MinIO sau (D4) | Proposed | E03 |
| [0016](0016-common-data-model-mb-sb.md) | Model chung Maintenance + Selective (D2) | Proposed | E05, E06, E15 |

Quyết định chương trình (không phải kiến trúc) D1, D5–D8 và DN-x vẫn theo `docs/migration/06-risks-unknowns-decisions.md`.
