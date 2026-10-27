# Board · Wave W1 (nền tảng) · 39 task

> Cách phát việc song song cho nhiều agent: `docs/tasks/agent-dispatch.md`. Prompt khởi động: `docs/tasks/prompts/start-task.md`.

> Cập nhật mỗi PR. Trạng thái: todo → ready → in_progress → in_review → done (blocked). Owner: Planner = Claude Planner, Codex, Web = Claude (web), Mobile = Claude (mobile), Human = chủ dự án / IT.

Tổng: 39 task (38 làm + 1 lập kế hoạch wave kế) · E01: 10 · E02: 7 · E03: 8 · E04: 7 · E05: 6 · P0: 36 · ước lượng: S×9 + M×19 + L×10 ≈ 43.5 ngày công

| ID | Task | Epic | Owner | P | Size | Phụ thuộc | Trạng thái | PR |
|---|---|---|---|---|---|---|---|---|
| T0101 | [Khởi tạo gốc monorepo](items/E01/T0101-khoi-tao-goc-monorepo.md) | E01 | Claude Planner | P0 | M | — | in_review | nhánh `infra/T0101-khoi-tao-goc-monorepo` (chưa push) |
| T0102 | [Package design-tokens](items/E01/T0102-package-design-tokens.md) | E01 | Claude Planner | P0 | M | T0101 | in_review | nhánh `shared/T0102-package-design-tokens` (chưa push) |
| T0103 | [Package ui](items/E01/T0103-package-ui.md) | E01 | Claude (web) | P0 | L | T0101, T0102 | todo | |
| T0104 | [Package shared](items/E01/T0104-package-shared.md) | E01 | Claude (web) | P0 | M | T0101 | in_review | nhánh `shared/T0104-package-shared` (chưa push) |
| T0105 | [CI](items/E01/T0105-ci.md) | E01 | Claude Planner | P0 | L | T0101 | in_review | #1 (`infra/T0105-ci`) |
| T0106 | [Infra](items/E01/T0106-infra.md) | E01 | Claude Planner | P0 | L | T0101 | in_review | nhánh `infra/T0106-infra` (chưa push) |
| T0107 | [Dockerfile backend (api + worker cùng image, uv multi-stage, WeasyPrin](items/E01/T0107-dockerfile-backend-api-worker-cung-image-uv-multi-.md) | E01 | Codex | P0 | S | T0301 | todo | |
| T0108 | [Dockerfile web và mobile (pnpm fetch + build + nginx static)](items/E01/T0108-dockerfile-web-va-mobile-pnpm-fetch-build-nginx-st.md) | E01 | Claude (web) | P0 | S | T0401, T0404 | todo | |
| T0109 | [Kích hoạt file hướng dẫn agent và quy trình](items/E01/T0109-kich-hoat-file-huong-dan-agent-va-quy-trinh.md) | E01 | Claude Planner | P0 | S | T0101 | todo | |
| T0110 | [Thiết lập GitHub](items/E01/T0110-thiet-lap-github.md) | E01 | Chủ dự án / IT | P0 | S | T0105 | todo | |
| T0301 | [Backend skeleton](items/E03/T0301-backend-skeleton.md) | E03 | Codex | P0 | L | T0101 | in_review | nhánh `backend/T0301-backend-skeleton` (chưa push) |
| T0302 | [Migrations nền](items/E03/T0302-migrations-nen.md) | E03 | Codex | P0 | M | T0301 | in_review | [PR #5](https://github.com/qminh011002/genetics-platform/pull/5) draft; CI xanh, 16 test migration PG18; chờ Docker + review |
| T0303 | [Lỗi problem+json + danh mục mã lỗi, pagination cursor/offset, If-Match](items/E03/T0303-loi-problem-json-danh-muc-ma-loi-pagination-cursor.md) | E03 | Codex | P0 | M | T0301, T0104 | todo | |
| T0304 | [Session / UnitOfWork với set_config(app.*), Procrastinate app + worker](items/E03/T0304-session-unitofwork-voi-set-config-app-procrastinat.md) | E03 | Codex | P0 | L | T0302 | todo | |
| T0305 | [Hợp đồng](items/E03/T0305-hop-ong.md) | E03 | Codex | P0 | M | T0303 | todo | |
| T0306 | [Package api-client](items/E03/T0306-package-api-client.md) | E03 | Claude (web) | P0 | M | T0305, T0104 | todo | |
| T0307 | [Harness test backend](items/E03/T0307-harness-test-backend.md) | E03 | Codex | P0 | S | T0302, T0303 | todo | |
| T0308 | [FileStorage port + LocalDiskStorage, bảng attachment, POST /attachment](items/E03/T0308-filestorage-port-localdiskstorage-bang-attachment-.md) | E03 | Codex | P1 | M | T0304, T0203 | todo | |
| T0201 | [Schema auth](items/E02/T0201-schema-auth.md) | E02 | Codex | P0 | L | T0302 | todo | |
| T0202 | [Xác thực](items/E02/T0202-xac-thuc.md) | E02 | Codex | P0 | M | T0201, T0303 | todo | |
| T0203 | [Phân quyền ở API](items/E02/T0203-phan-quyen-o-api.md) | E02 | Codex | P0 | M | T0202 | todo | |
| T0204 | [RLS](items/E02/T0204-rls.md) | E02 | Codex | P0 | M | T0201, T0304 | todo | |
| T0205 | [Entra ID](items/E02/T0205-entra-id.md) | E02 | Chủ dự án / IT | P0 | S | — | ready | |
| T0206 | [Web auth](items/E02/T0206-web-auth.md) | E02 | Claude (web) | P0 | M | T0401, T0202, T0203 | todo | |
| T0207 | [Mobile auth](items/E02/T0207-mobile-auth.md) | E02 | Claude (mobile) | P0 | M | T0404, T0202 | todo | |
| T0401 | [Web skeleton](items/E04/T0401-web-skeleton.md) | E04 | Claude (web) | P0 | L | T0101, T0102, T0103, T0104, T0306 | todo | |
| T0402 | [Web common components đợt 1](items/E04/T0402-web-common-components-ot-1.md) | E04 | Claude (web) | P0 | L | T0401 | todo | |
| T0403 | [Web kiểm thử UI](items/E04/T0403-web-kiem-thu-ui.md) | E04 | Claude (web) | P0 | M | T0401, T0402, T0206 | todo | |
| T0404 | [Mobile skeleton](items/E04/T0404-mobile-skeleton.md) | E04 | Claude (mobile) | P0 | L | T0101, T0102, T0103, T0104, T0306 | todo | |
| T0405 | [Mobile offline khung](items/E04/T0405-mobile-offline-khung.md) | E04 | Claude (mobile) | P0 | L | T0404, T0306 | todo | |
| T0406 | [Mobile PWA](items/E04/T0406-mobile-pwa.md) | E04 | Claude (mobile) | P0 | M | T0404, T0405 | todo | |
| T0407 | [Mobile scanner adapter](items/E04/T0407-mobile-scanner-adapter.md) | E04 | Claude (mobile) | P1 | M | T0404 | todo | |
| T0501 | [Migration tham chiếu](items/E05/T0501-migration-tham-chieu.md) | E05 | Codex | P0 | M | T0302, T0201 | todo | |
| T0502 | [Strains API](items/E05/T0502-strains-api.md) | E05 | Codex | P0 | M | T0501, T0203, T0303, T0305 | todo | |
| T0503 | [Lệnh seed-dev](items/E05/T0503-lenh-seed-dev.md) | E05 | Codex | P0 | S | T0501, T0201 | todo | |
| T0504 | [Web /strains](items/E05/T0504-web-strains.md) | E05 | Claude (web) | P0 | M | T0401, T0402, T0403, T0502 | todo | |
| T0505 | [Mobile reference store](items/E05/T0505-mobile-reference-store.md) | E05 | Claude (mobile) | P0 | S | T0404, T0405, T0502 | todo | |
| T0506 | [Nghiệm thu init](items/E05/T0506-nghiem-thu-init.md) | E05 | Claude Planner | P0 | S | T0502, T0503, T0504, T0505, T0106, T0107, T0108, T0109, T0110, T0204, T0206, T0207, T0403, T0406 | todo | |
| T0599 | [Lập kế hoạch wave W2](items/E05/T0599-lap-ke-hoach-wave-w2.md) | E05 | Claude Planner | P0 | L | T0506 | todo | |

## Thứ tự gợi ý theo owner (song song)

| Ngày | Planner | Codex | Claude web | Claude mobile | Human |
|---|---|---|---|---|---|
| 1 | T0101 → T0102 | (chờ T0101) đọc tài liệu; chuẩn bị T0301 trên nhánh | đọc tài liệu | đọc tài liệu | T0205 gửi IT; T0110 sau T0105 |
| 2–3 | T0106, T0105 | T0301 → T0302 | T0104 → T0103 | (chờ T0103) | |
| 4–6 | T0109 | T0303 → T0307 → T0304 | T0306 → T0401 | T0404 | |
| 7–9 | review | T0305 → T0201 → T0202 | T0402 → T0206 | T0405 → T0207 | |
| 10–12 | review | T0203 → T0204 → T0107 → T0501 | T0403 → T0108 | T0406 → T0407 | |
| 13–15 | T0506 chuẩn bị | T0502 → T0503 → T0308 | T0504 | T0505 | |
| 16 | T0506 | | | | duyệt |
| 17–18 | **T0599 lập kế hoạch W2** → board W2, dispatch W2 | | | | duyệt danh sách W2 |

Đường găng: T0101 → T0301 → T0302 → T0303 → T0305 → T0306 → T0401 → T0402 → T0504 (web) và T0304 → T0201 → T0202 → T0203 → T0502 (backend).
