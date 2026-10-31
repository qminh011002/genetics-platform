# W1 status · Nền tảng (web + backend)

> Một chỗ duy nhất để xem trạng thái và phát việc cho agent. Cập nhật mỗi PR; trạng thái ở đây và frontmatter task file phải khớp.
> Trạng thái: `todo` → `ready` → `in_progress` → `in_review` → `done` · `blocked` (chờ thông tin) · `deferred` (chủ dự án hoãn).
> Cập nhật: 2026-10-31 · Done 8 / 39 · Ready 4 · Deferred 8.

## Hoãn có chủ đích
- **2026-10-28:** mobile hoãn (T0207, T0404–T0407, T0505). T0108 chỉ còn Dockerfile web; T0506 không chờ mobile.
- **2026-10-29:** T0205 (Entra ID) và T0110 (GitHub ruleset) hoãn tới khi dev web + backend xong; auth local dùng `AUTH_MODE=dev`. T0206 tiêu chí 3 (Entra staging) chờ T0205.

## Agent và nhánh

| Agent | Nhánh | Thư mục | Phạm vi |
|---|---|---|---|
| Claude Code | `web/dev` | repo chính | `apps/web/`, `packages/`, `docs/`, `infra/`, `.github/`, `scripts/` |
| Codex | `backend/dev` | worktree `../gp-backend` (`git worktree add ../gp-backend backend/dev`) | `services/backend/`, `contracts/openapi/` (sinh) |

Phát việc: dán `docs/tasks/prompts/start-task.md` (thay `TASK_ID`) cho đúng agent; làm dở → `prompts/resume-task.md`.

## Làm được ngay

| Agent | Task (theo thứ tự ưu tiên) |
|---|---|
| Codex | **T0303** (đường găng) → T0304 · T0201 · T0107 |
| Claude | (chờ T0305 → T0306) |

Đường găng: T0303 → T0305 → T0306 → T0401 → T0402 → T0504 (web) · T0201 → T0202 → T0203 → T0502 (backend).

## Tất cả task

| ID | Task | Agent | P | Size | Phụ thuộc | Trạng thái | PR |
|---|---|---|---|---|---|---|---|
| T0101 | [Khởi tạo gốc monorepo](items/E01/T0101-khoi-tao-goc-monorepo.md) | Claude | P0 | M | — | done | đã merge `main` |
| T0102 | [Package design-tokens](items/E01/T0102-package-design-tokens.md) | Claude | P0 | M | T0101 | done | đã merge `main` |
| T0103 | [Package ui](items/E01/T0103-package-ui.md) | Claude | P0 | L | T0101, T0102 | done | [#6](https://github.com/qminh011002/genetics-platform/pull/6) |
| T0104 | [Package shared](items/E01/T0104-package-shared.md) | Claude | P0 | M | T0101 | done | đã merge `main` |
| T0105 | [CI](items/E01/T0105-ci.md) | Claude | P0 | L | T0101 | done | [#1](https://github.com/qminh011002/genetics-platform/pull/1) |
| T0106 | [Infra](items/E01/T0106-infra.md) | Claude | P0 | L | T0101 | done | đã merge `main` |
| T0107 | [Dockerfile backend](items/E01/T0107-dockerfile-backend-api-worker-cung-image-uv-multi-.md) | Codex | P0 | S | T0301 | ready | |
| T0108 | [Dockerfile web](items/E01/T0108-dockerfile-web-va-mobile-pnpm-fetch-build-nginx-st.md) | Claude | P0 | S | T0401 | todo | |
| T0109 | [Kích hoạt file hướng dẫn agent và quy trình](items/E01/T0109-kich-hoat-file-huong-dan-agent-va-quy-trinh.md) | Claude | P0 | S | T0101 | in_review | |
| T0110 | [Thiết lập GitHub](items/E01/T0110-thiet-lap-github.md) | Chủ dự án | P0 | S | T0105 | deferred | |
| T0201 | [Schema auth](items/E02/T0201-schema-auth.md) | Codex | P0 | L | T0302 | ready | |
| T0202 | [Xác thực](items/E02/T0202-xac-thuc.md) | Codex | P0 | M | T0201, T0303 | todo | |
| T0203 | [Phân quyền ở API](items/E02/T0203-phan-quyen-o-api.md) | Codex | P0 | M | T0202 | todo | |
| T0204 | [RLS](items/E02/T0204-rls.md) | Codex | P0 | M | T0201, T0304 | todo | |
| T0205 | [Entra ID](items/E02/T0205-entra-id.md) | Chủ dự án / IT | P0 | S | — | deferred | |
| T0206 | [Web auth](items/E02/T0206-web-auth.md) | Claude | P0 | M | T0401, T0202, T0203 | todo | |
| T0207 | [Mobile auth](items/E02/T0207-mobile-auth.md) | Claude | P0 | M | T0404, T0202 | deferred | |
| T0301 | [Backend skeleton](items/E03/T0301-backend-skeleton.md) | Codex | P0 | L | T0101 | done | đã merge `main` |
| T0302 | [Migrations nền](items/E03/T0302-migrations-nen.md) | Codex | P0 | M | T0301 | done | [#5](https://github.com/qminh011002/genetics-platform/pull/5) |
| T0303 | [problem+json, mã lỗi, pagination, If-Match](items/E03/T0303-loi-problem-json-danh-muc-ma-loi-pagination-cursor.md) | Codex | P0 | M | T0301, T0104 | ready | |
| T0304 | [Session / UnitOfWork, Procrastinate worker](items/E03/T0304-session-unitofwork-voi-set-config-app-procrastinat.md) | Codex | P0 | L | T0302 | ready | |
| T0305 | [Hợp đồng OpenAPI](items/E03/T0305-hop-ong.md) | Codex | P0 | M | T0303 | todo | |
| T0306 | [Package api-client](items/E03/T0306-package-api-client.md) | Claude | P0 | M | T0305, T0104 | todo | |
| T0307 | [Harness test backend](items/E03/T0307-harness-test-backend.md) | Codex | P0 | S | T0302, T0303 | todo | |
| T0308 | [FileStorage + attachment](items/E03/T0308-filestorage-port-localdiskstorage-bang-attachment-.md) | Codex | P1 | M | T0304, T0203 | todo | |
| T0401 | [Web skeleton](items/E04/T0401-web-skeleton.md) | Claude | P0 | L | T0101, T0102, T0103, T0104, T0306 | todo | |
| T0402 | [Web common components đợt 1](items/E04/T0402-web-common-components-ot-1.md) | Claude | P0 | L | T0401 | todo | |
| T0403 | [Web kiểm thử UI](items/E04/T0403-web-kiem-thu-ui.md) | Claude | P0 | M | T0401, T0402, T0206 | todo | |
| T0404 | [Mobile skeleton](items/E04/T0404-mobile-skeleton.md) | Claude | P0 | L | T0101–T0104, T0306 | deferred | |
| T0405 | [Mobile offline khung](items/E04/T0405-mobile-offline-khung.md) | Claude | P0 | L | T0404, T0306 | deferred | |
| T0406 | [Mobile PWA](items/E04/T0406-mobile-pwa.md) | Claude | P0 | M | T0404, T0405 | deferred | |
| T0407 | [Mobile scanner adapter](items/E04/T0407-mobile-scanner-adapter.md) | Claude | P1 | M | T0404 | deferred | |
| T0501 | [Migration tham chiếu](items/E05/T0501-migration-tham-chieu.md) | Codex | P0 | M | T0302, T0201 | todo | |
| T0502 | [Strains API](items/E05/T0502-strains-api.md) | Codex | P0 | M | T0501, T0203, T0303, T0305 | todo | |
| T0503 | [Lệnh seed-dev](items/E05/T0503-lenh-seed-dev.md) | Codex | P0 | S | T0501, T0201 | todo | |
| T0504 | [Web /strains](items/E05/T0504-web-strains.md) | Claude | P0 | M | T0401, T0402, T0403, T0502 | todo | |
| T0505 | [Mobile reference store](items/E05/T0505-mobile-reference-store.md) | Claude | P0 | S | T0404, T0405, T0502 | deferred | |
| T0506 | [Nghiệm thu init](items/E05/T0506-nghiem-thu-init.md) | Claude | P0 | S | T0502, T0503, T0504, T0106, T0107, T0108, T0109, T0204, T0206, T0403 | todo | |
| T0599 | [Lập kế hoạch wave W2](items/E05/T0599-lap-ke-hoach-wave-w2.md) | Claude | P0 | L | T0506 | todo | |
