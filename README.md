# Genetics Data Platform

Monorepo thay thế bộ app AppSheet của R&D Genetics (Entobel): web React + TypeScript (máy tính), mobile PWA web-first (điện thoại khu nuôi), backend FastAPI + PostgreSQL 18.

| Muốn | Đọc |
|---|---|
| Chạy / build / test trên máy dev | `docs/getting-started.md` |
| Deploy lên VM công ty | `docs/ops/deploy-vm.md` |
| Hiểu kiến trúc | `docs/architecture/overview.md` (nguồn sự thật) → `backend.md`, `web.md`, `mobile.md`, `api-standards.md`, `infrastructure.md`, `quality-standards.md` |
| Quyết định đã chốt / đang mở | `docs/decisions/README.md`, `docs/architecture/open-questions.md` |
| Thiết kế UI | `docs/design/design-system.md`, `docs/genetics-platform-wireframes/` |
| Kế hoạch migrate (PLAN-001) | `docs/migration/README.md` |
| Khởi tạo repo (PLAN-002 → PLAN-003) | `docs/tasks/initialization/` |
| Cách làm việc theo wave, theo dõi task, tạo task mới | `docs/tasks/W1-status.md` |
| Phát việc cho agent, prompt khởi động | `docs/tasks/W1-status.md`, `docs/tasks/prompts/` |
| Cách làm task, PR, ADR | `docs/tasks/workflow.md`, `AGENTS.md` |

Cấu trúc: `apps/web`, `apps/mobile`, `services/backend`, `contracts/openapi`, `packages/{ui,api-client,shared,design-tokens}`, `tools/legacy_import`, `infra/`, `docs/`.
