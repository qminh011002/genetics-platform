# Kiến trúc toàn hệ thống · Genetics Data Platform

> Trạng thái: bản 1.1 · 26/10/2026 (PLAN-002) · nguồn sự thật cho mọi tài liệu khác trong `docs/`. Các quyết định lâu dài nằm trong `docs/decisions/` (ADR, trạng thái **Proposed** cho tới khi được duyệt).
> Khi một tài liệu con mâu thuẫn với file này, file này thắng; sửa file con hoặc ghi ADR (xem `docs/tasks/workflow.md`).

## 1. Bối cảnh

Genetics Data Platform là hệ thống dữ liệu của nhóm R&D Genetics (Entobel) để theo dõi ruồi lính đen (BSF) qua nhiều thế hệ. Hiện hệ thống chạy trên **AppSheet**:

| App AppSheet | Trạng thái | Quy mô | Việc |
|---|---|---|---|
| Maintenance Breeding (MB) | Đang rollout, go-live AppSheet dự kiến 04/01/2027 | ~44 bảng, 651 cột, 101 view | Giữ dòng TMA, TME, REF qua F0…F7: Egg → Neonate → Larvae / Nursery → Pupae → Egg thế hệ kế |
| Project Management (PM) | Đang dùng | 11 bảng, 169 cột, 69 view | Dự án, task, deadline Early / On time / Late, duyệt task, chat, file, report |
| Selective Breeding (SB) | Đang thiết kế, chạy bằng Excel và giấy | ERD 22 bảng | Chọn lọc scheme MSA, MSB, MSC (G0…G4), line SEL / CTR / BK, dữ liệu cấp cá thể |

Dữ liệu hiện nằm trong các workbook (mỗi bảng một sheet). `cloud_to_db.py` mỗi giờ kéo dữ liệu qua AppSheet API vào một PostgreSQL warehouse để Metabase vẽ dashboard. Dữ liệu PM không vào warehouse.

**Dự án này thay toàn bộ AppSheet bằng một hệ thống mới**: một database vận hành duy nhất, logic nằm trong code có test, không còn ETL, không còn Metabase.

### 1.1 Mục tiêu

1. **Một nguồn sự thật.** PostgreSQL là database vận hành. App ghi thẳng vào đó trong transaction. Không có bản sao, không có độ trễ dashboard.
2. **Logic có test.** Mọi luật (sinh mã, điều kiện chốt, chuyển giai đoạn, KPI, data quality) nằm trong code Python, có unit test chạy bằng dữ liệu lịch sử.
3. **Không mất dữ liệu ở khu nuôi.** App điện thoại nhập được khi mạng yếu hoặc mất mạng, tự gửi lại, không trùng.
4. **Sửa lỗi của AppSheet thay vì chép lại.** Danh sách lỗi ở mục 9.
5. **Maintenance và Selective dùng chung một nền.** Một bảng `batch`, một bảng lineage, một bộ KPI có version.
6. **Quyền là dữ liệu.** Vai trò là bộ quyền Admin sửa được. Thêm vai trò không cần sửa code.
7. **Mọi công việc có chỗ.** Task, việc định kỳ sinh từ protocol và việc hệ thống nhắc nằm chung một danh sách, tự xong khi đủ bản ghi.

### 1.2 Không làm (v1)

- Không làm app native trên store. Điện thoại dùng PWA web-first (xem `mobile.md`, ADR-0010); đường lên native sau này là Capacitor.
- Không làm dark mode.
- Không tích hợp cân điện tử trực tiếp. Dữ liệu cân Ohaus vào bằng import file.
- Không làm BI tự do kiểu Metabase. Dashboard và phân tích là màn hình cố định trong app, có export.
- Không multi-tenant. Một tổ chức, khoảng 10 người dùng lúc đầu (4 Worker, 2 Executive, 1 Manager, 1 Admin).

### 1.3 Quy mô dữ liệu

Rất nhỏ với PostgreSQL. Dữ liệu lịch sử đã chuẩn bị (Data Migration.xlsx): `emerge_sexing` 16.542 dòng, `neonate_harvest` 1.010, `egg_collection` 486, các bảng khác dưới 200 dòng. Không cần partition, sharding hay cache phân tán. Ưu tiên **đúng** và **đơn giản** hơn hiệu năng.

## 2. Người dùng, nền tảng và vai trò

Một tài khoản Microsoft (@entobel.com), hai nền tảng: **web máy tính** và **app điện thoại (PWA)**. Vai trò quyết định được vào nền tảng nào.

| Vai trò | Web | App | Nhập liệu | Quản lý |
|---|---|---|---|---|
| Worker | Không (thấy màn hướng dẫn dùng app) | Có | Egg production, Neonate (thu, cân), ổ trứng Selective | Nhận và cập nhật task được giao |
| Executive | Có | Có | Mọi form, gồm sexing, larvae, nursery, pupae | Chốt giai đoạn, import, giao task, dự án, dòng giống, generation, protocol, KPI, chọn lọc, bỏ qua lỗi DQ |
| Manager | Có | Không | Không (chỉ xem) | Xem mọi dự án kể cả Confidential, duyệt task, xem report của mọi người |
| Admin | Có | Không | Không | User, vai trò, quyền riêng, mở lại batch, cấu hình hệ thống |

- Vai trò **Project Leader** của tài liệu AppSheet đã bỏ, việc của nó gộp vào Executive. Cần lại thì tạo vai trò mới trên màn Vai trò & quyền.
- 4 vai trò trên là **bộ quyền mặc định** (`is_system = true`): sửa được, không xoá được. Admin thêm vai trò mới (ví dụ QC) bằng cách nhân bản và sửa quyền.
- Quyền riêng từng người: thêm hoặc bớt một quyền, có hạn, có lý do, có thể giới hạn một batch.
- Luật không đổi theo vai trò: batch đã chốt khoá với mọi người; sửa, xoá bản ghi người khác bắt buộc lý do; mọi thay đổi quyền ghi lịch sử.

Chi tiết RBAC ở `backend.md` §12 và `api-standards.md` §6; ADR-0004.

## 3. Sơ đồ hệ thống

```
                 Microsoft Entra ID (OIDC, MSAL)
                        │ access token (JWT)
          ┌─────────────┴──────────────┐
          │                            │
 ┌────────▼─────────┐        ┌─────────▼─────────┐
 │ Web (React, TS,  │        │ Mobile PWA (React,│
 │ Vite, shadcn/ui) │        │ Vite, shadcn/ui)  │
 │ máy tính         │        │ điện thoại        │
 └────────┬─────────┘        └─────────┬─────────┘
          │  HTTPS /api/v1  (JSON, OpenAPI)        │  + outbox offline (IndexedDB)
          └─────────────┬──────────────┘
                 ┌──────▼───────┐        ┌───────────────┐
                 │ Nginx (TLS)  │        │ File storage  │
                 └──────┬───────┘        │ (nhãn, report,│
                 ┌──────▼───────┐        │ ảnh, import)  │
                 │ API FastAPI  ├────────►               │
                 │ (Python 3.13)│        └───────▲───────┘
                 └──────┬───────┘                │
         SQL + RLS      │ enqueue job (cùng transaction)  │
          ┌─────────────▼──────────┐   ┌─────────┴───────┐
          │ PostgreSQL 18          │◄──┤ Worker          │
          │ core / audit /         │   │ (Procrastinate) │
          │ analytics / auth       │   │ nhãn PDF, report│
          │ + hàng đợi job         │   │ import, job đêm │
          └────────────────────────┘   └─────────────────┘
```

Không còn: AppSheet API → `cloud_to_db.py` → warehouse → Metabase, link Metabase public, quickchart.io. Không có Redis: hàng đợi job nằm trong PostgreSQL (ADR-0005).

## 4. Công nghệ

| Lớp | Chọn | Thay cho (AppSheet) | Tài liệu |
|---|---|---|---|
| Web | React 19 + TypeScript + Vite 8 · shadcn/ui CLI 4 (Base UI mặc định, Tailwind 4) · TanStack Router, Query, Table v9 · react-hook-form + zod 4 · Recharts · MSAL 5 | Deck / Detail / Form / Dashboard view | `web.md`, ADR-0008, ADR-0009 |
| Mobile | **Web-first PWA** (quyết định 26/10/2026): Vite 8 + React 19 + TanStack Router, dùng chung `packages/ui` (shadcn, Base UI, Tailwind 4) với web · `vite-plugin-pwa` (Workbox) · IndexedDB outbox · `barcode-detector`. Đường native sau này: Capacitor | App AppSheet trên điện thoại, bảng `scanner` | `mobile.md`, ADR-0010, ADR-0011 |
| API | Python 3.13 · FastAPI · Pydantic 2 · SQLAlchemy 2.1 (async, psycopg 3) · Alembic (+ alembic_utils) | App formula, Valid_If, action | `backend.md`, ADR-0002, ADR-0003 |
| Job nền | **Procrastinate** (hàng đợi trên PostgreSQL, có cron) — thay arq + Redis của bản 1.0 vì arq ở chế độ maintenance-only và bỏ được Redis | Bot | `backend.md` §13, ADR-0005 |
| Đăng nhập | Microsoft Entra ID (OIDC, token v2). MSAL redirect flow ở client, PyJWT + JWKS ở FastAPI | Sign-in AppSheet, `USEREMAIL()` | `api-standards.md` §5, ADR-0004 |
| Phân quyền | Bảng `auth.role`, `role_permission`, `user_permission`, `user_scope` + Postgres RLS | Cột role + 4 cờ view/add/edit/delete | `backend.md` §12, ADR-0004 |
| Hợp đồng API | OpenAPI sinh từ FastAPI, commit ở `contracts/openapi/`; SDK + hook + mock MSW + zod sinh bằng orval; `oasdiff` kiểm breaking; schemathesis | — | `api-standards.md` §16–20, ADR-0006, ADR-0007 |
| PDF · QR | Jinja2 HTML → WeasyPrint 70 · segno (QR sinh offline) | Template docx, quickchart.io | `backend.md` |
| Database | PostgreSQL **18**, 4 schema: `core`, `audit`, `analytics`, `auth` (+ `legacy` tạm khi migrate) | Workbook + warehouse | mục 6, ADR-0003 |
| Dashboard · export | Màn hình trong app, đọc view `analytics.*` qua API; CSV / Excel / JSON | Metabase, Export Hub | `web.md` |
| Triển khai | Docker Compose · Nginx + TLS · `pg_dump -Fc` hằng đêm + restore drill hằng tháng (PITR tuỳ chọn) | — | `infrastructure.md`, ADR-0012 |
| Chất lượng | Gate theo tầng: ruff / ESLint / mypy / tsc, import-linter / boundaries, pytest / Vitest / Playwright, visual + axe, contract | — | `quality-standards.md`, ADR-0013 |
| Monorepo | pnpm 12 workspaces + `catalog:` · Turborepo 2 · uv 0.13 workspace · GitHub Actions | — | ADR-0001 |

Phiên bản cụ thể xác minh ngày 26/10/2026 (xem `research-references.md`); chốt lúc khởi tạo repo, ghi vào lockfile. Tài liệu chỉ nêu dòng phiên bản.

## 5. Cấu trúc repo (monorepo)

```
genetics_platform/
├─ AGENTS.md                   # hướng dẫn chung cho mọi agent (nguồn duy nhất); CLAUDE.md chỉ `@AGENTS.md` + phần riêng Claude
├─ CLAUDE.md
├─ .claude/                    # rules/ (theo path), hooks/ (scope guard), settings.json (permissions), skills/
├─ .codex/                     # setup script cho worktree Codex
├─ .github/                    # workflows/, CODEOWNERS, pull_request_template.md, dependabot.yml
├─ apps/
│  ├─ web/                     # @genetics/web · genetics_platforms_web · Claude (web) · xem web.md
│  └─ mobile/                  # @genetics/mobile · genetics_platform_mobile · Claude (mobile) · PWA web-first · xem mobile.md
├─ services/
│  └─ backend/                 # genetics-platform-backend (package `genetics`) · Codex · xem backend.md
│     ├─ src/genetics/         # bootstrap, shared_kernel, modules/<13 module>, jobs, templates
│     ├─ alembic/
│     ├─ tests/
│     └─ pyproject.toml · uv.lock · .importlinter
├─ contracts/
│  └─ openapi/openapi.json     # hợp đồng API, sinh từ backend, commit; nguồn cho SDK
├─ packages/
│  ├─ ui/                      # @genetics/ui · shadcn primitives (Base UI, Tailwind 4) + component nghiệp vụ dùng chung web + mobile
│  ├─ api-client/              # @genetics/api-client · orval: hook TanStack Query, mock MSW, zod (không sửa tay)
│  ├─ shared/                  # @genetics/shared · format vi-VN, mã quyền, mã lỗi, nhãn enum, schema zod form, glossary
│  └─ design-tokens/           # @genetics/design-tokens · tokens.json → web.css (Tailwind 4 @theme + biến shadcn), tokens.ts
├─ tools/
│  └─ legacy_import/           # Python (uv workspace member) · đọc AppSheet API + warehouse cũ + Excel → schema legacy → core
├─ infra/
│  ├─ compose.yaml             # postgres · api · worker · web · mobile · nginx (+ profile dev / test)
│  ├─ nginx/
│  └─ backup/
├─ docs/                       # architecture/, decisions/ (ADR), design/, migration/ (PLAN-001), tasks/, data/, ops/
├─ package.json · pnpm-workspace.yaml (+ catalog) · turbo.json
└─ pyproject.toml · uv.lock    # uv workspace: services/backend, tools/legacy_import
```

- JavaScript: **pnpm 12 workspaces + Turborepo 2** (task graph, cache, `--affected`). Python: **uv workspace** (một `uv.lock` ở root). Backend có `package.json` tối thiểu với script `lint / test / build` gọi `uv run` để Turborepo điều phối cả hai ngôn ngữ (không dùng chế độ Python thử nghiệm của Turborepo). ADR-0001.
- `packages/api-client` sinh từ `contracts/openapi/openapi.json` (xuất từ backend, commit). CI báo lỗi nếu spec hoặc client chưa sinh lại.
- Web và mobile **dùng chung** `packages/ui` (primitive shadcn + component nghiệp vụ chung), token, API client, hook dữ liệu, schema form, format, mã quyền, glossary. Mỗi app giữ component bố cục riêng (`components/common` web, `components/mobile` mobile).
- Thư mục `apps/`, `services/`, `packages/`, `contracts/` đã tạo sẵn trong repo (trống) và được giữ đúng tên.

### 5.1 Đội phát triển và quyền sở hữu

| Agent / người | Sở hữu (được sửa không cần duyệt thêm) | Chỉ đọc / cần PR nhãn `shared` |
|---|---|---|
| Codex (backend) | `services/backend/**`, `tools/legacy_import/**`, `contracts/openapi/**` (qua export), `infra/` phần Dockerfile backend | `packages/**`, `apps/**`, `docs/architecture/**` |
| Claude (web) | `apps/web/**`, `packages/api-client/**` (chạy generate), `packages/shared/**` phần web dùng chung với mobile khi có review chéo | `services/**`, `apps/mobile/**` |
| Claude (mobile) | `apps/mobile/**` | `apps/web/**`, `services/**` |
| Claude Planner | `docs/**`, `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `.github/**`, `infra/**`, `packages/design-tokens/**`, `packages/shared/**`, `packages/ui/**` (chủ; Claude web / mobile sửa qua PR nhãn `shared`) | code app |
| Người (Genetics / IT) | duyệt ADR, PR; vận hành staging / production; secret | — |

Chi tiết quy trình, hook và gate cho agent: `quality-standards.md` §6, ADR-0014, `docs/tasks/initialization/blueprint.md`.

## 6. Mô hình dữ liệu

Database PostgreSQL 18, khoảng 45 bảng và 10 view, chia 4 schema:

| Schema | Nội dung |
|---|---|
| `core` | Dữ liệu vận hành: tham chiếu, batch, lineage, đo lường, Selective, PM, việc & lịch, user |
| `auth` | `role`, `permission`, `role_permission`, `user_permission`, `user_scope`, hàm `auth.has_perm()` cho RLS |
| `audit` | `audit_log` ghi mọi INSERT / UPDATE / DELETE bằng trigger, kèm giá trị cũ / mới |
| `analytics` | View KPI theo giai đoạn. Dashboard, phân tích và export đọc từ đây (role DB chỉ SELECT) |

### 6.1 Khái niệm lõi

- **Batch** là một nhóm cá thể ở một giai đoạn. Một bảng `core.batch` cho cả Maintenance và Selective: `program` (maintenance | selective), `stage` (egg | neonate | nursery | larvae | pupae), `strain`, `scheme` (MSA/MSB/MSC), `line` (SEL/CTR/BK), `generation`, `container`, `protocol`, `status` (open | closed | reopened).
- **Lineage** là `core.batch_transfer` (n–n): batch nào chuyển sang batch nào, bao nhiêu con / bao nhiêu gam, `match_status`. Thay cột `*_ref` một cha của AppSheet. Pupae gộp nhiều cage, Selective gộp nhiều neonate vào một crate đều biểu diễn được.
- **Đo lường** là các bảng sự kiện con của batch: `egg_collection`, `egg_clutch`, `individual` (emerge & sexing), `neonate_harvest`, `sample_weighing`, `larvae_observation`, `nursery_observation`, `pupae_observation`, `larva_weight`, `drying_record`.
- **Bảng 1:1** của batch: `breeding_setup` (population_size, số đực / cái), `rearing_condition` (diet, stock_density, feed_moisture, total_wet_feed_kg).
- **KPI không lưu thành cột.** Mỗi KPI có định nghĩa trong `core.kpi_definition` (code, đơn vị, công thức, version), được tính bằng view `analytics.v_*_kpi`. Sửa bản ghi con là KPI đúng ngay.
- **Đơn vị nằm trong tên cột**: `_mg`, `_g`, `_kg`. Tỉ lệ lưu dạng 0–1.
- **Protocol có version** (`protocol.params` jsonb): tham số SOP (mật độ, số mẫu, khung giờ thu, ngưỡng hợp lệ), lịch việc định kỳ (`routine_template`).

### 6.2 Danh sách bảng

| Nhóm | Bảng |
|---|---|
| Tham chiếu | `strain`, `scheme`, `line`, `generation`, `container` (room / cage / crate), `diet`, `protocol`, `protocol_version`, `kpi_definition`, `form_def` |
| Batch | `batch`, `batch_transfer`, `breeding_setup`, `rearing_condition`, `batch_reopen`, `batch_assignment` |
| Đo lường | `egg_collection`, `egg_clutch`, `individual`, `neonate_harvest`, `sample_weighing`, `larvae_observation`, `nursery_observation`, `pupae_observation`, `feeding_record`, `larva_weight`, `drying_record` |
| Selective | `selection_run`, `selection_result` |
| Chất lượng · import | `dq_issue`, `import_batch` |
| Việc & lịch | `routine_template`, `routine_occurrence` |
| Project Management | `project`, `project_member`, `task`, `task_assignee`, `message`, `message_recipient`, `report` |
| Dùng chung | `app_user`, `attachment` (owner_table + owner_id), `label_print`, `notification`, `idempotency_key` |
| Phân quyền | `auth.role`, `auth.permission`, `auth.role_permission`, `auth.user_permission`, `auth.user_scope` |
| Audit | `audit.audit_log` |
| View | `analytics.v_egg_kpi`, `v_neonate_kpi`, `v_larvae_kpi`, `v_nursery_kpi`, `v_pupae_kpi`, view hỗ trợ (`v_neonate_harvest_sum`, `v_parent_egg_sum`…), `v_routine_on_time` |

Cột chi tiết từng bảng nằm trong blueprint (tab Database) và được hiện thực bằng migration Alembic. Migration là nguồn sự thật cuối cùng của schema. Các bảng `feeding_record`, `label_print`, `notification`, `idempotency_key` và việc tách `protocol` / `protocol_version` là phần bổ sung so với blueprint, mô tả ở `backend.md` §6.1.

### 6.3 Quy ước database

- PK: `uuid` (`gen_random_uuid()`), trừ `audit_log` (`bigint identity`) và bảng mã (`permission.code`, `form_def.code`).
- Mọi FK `ON DELETE RESTRICT` (đúng luật AppSheet "chỉ xoá cha khi không còn con"). Trừ bảng nối thuần tuý (`role_permission`) dùng `CASCADE`.
- Xoá mềm bằng `deleted_at` cho batch và bản ghi đo lường. Bảng tham chiếu đang được dùng không xoá, chỉ `is_active = false`.
- Mọi bảng nghiệp vụ có `created_at`, `created_by`, `updated_at`, `updated_by`, `version` (int, khoá lạc quan).
- `legacy_row_id text` trên bảng nhận dữ liệu AppSheet, để đối chiếu khi migrate.
- Ràng buộc nằm ở DB khi diễn đạt được: `CHECK` (khối lượng > 0, end_date ≥ start_date, ẩm 0–1), `UNIQUE` (mã, `(batch_id, ngày, seq)`), FK.
- Thời gian: `timestamptz` lưu UTC. Ngày nghiệp vụ (`date`) theo giờ Việt Nam (`Asia/Ho_Chi_Minh`).

## 7. Luồng nghiệp vụ chính

### 7.1 Vòng đời Maintenance Breeding

```
Egg production ──chốt──► Neonate (F+1) ──chốt, chọn nhánh──► Larvae (đóng nhánh, thí nghiệm diet / FCR)
                                                        └──► Nursery ──chốt──► Pupae ──chốt──► Egg production (thế hệ kế)
```

Generation chỉ tăng ở bước Egg → Neonate. Nursery, Pupae và Egg kế tiếp dùng lại generation đó.

### 7.2 Điều kiện chốt (gate) — giữ đúng AppSheet, không qua duyệt

| Giai đoạn | Mở nhập form con khi | Nút Chốt bật khi | Sau khi chốt (một transaction) |
|---|---|---|---|
| Egg production | `population_size > 0`, batch open | Có ≥ 1 sexing, ≥ 1 thu trứng, ≥ 1 cân ổ; không còn cá thể `pending` | Đóng batch, tạo batch Neonate F+1, ghi `batch_transfer`, yêu cầu in nhãn |
| Neonate | batch open | Có thu neonate và cân mẫu | Đóng batch, Executive chọn nhánh Larvae và / hoặc Nursery (mỗi loại tối đa 1) |
| Larvae | Đã đặt điều kiện thí nghiệm (diet, mật độ, thức ăn ướt, ẩm) | Có quan sát larvae | Đóng nhánh, không tạo batch mới |
| Nursery | Đã đặt 4 điều kiện | batch open | Tạo batch Pupae |
| Pupae | Đã đặt điều kiện thí nghiệm | Có mẫu pupae | Tạo batch Egg production thế hệ kế, yêu cầu in nhãn |

- Executive bấm Chốt **trên web**. Worker và Manager không thấy nút (quyền `stage.close`).
- Lỗi DQ mức `error` chưa xử lý chặn chốt.
- Chốt nhầm: Admin **mở lại** có lý do, mở trong 48 giờ rồi tự khoá lại, ghi `batch_reopen` và audit. Batch con đã tạo giữ nguyên.
- Cùng transaction chốt: huỷ các việc định kỳ chưa làm của batch, chuyển task nhập liệu đang mở sang Cancelled (lý do "batch đã chốt"), sinh lịch cho batch mới.

### 7.3 Sinh mã

Mã là thứ người dùng, nhãn QR và file Excel đều dùng. Mã sinh **ở server, trong transaction**, có `UNIQUE`.

| Đối tượng | Mẫu | Ví dụ |
|---|---|---|
| generation | `{strain}_F{n}` (Selective: `{strain}_G{n}`) | `TMA_F4`, `MSB_G3` |
| container | `MC{nn}` (phòng), `BC{nn}` (lồng), crate theo quy ước Selective; luôn 2 chữ số | `MC06`, `BC01` |
| batch | `{generation}_{container}`; không có container thì `{generation}` | `TMA_F4_BC01`, `TMA_F4` |
| cá thể (sexing) | `{batch}_BB.{n}` | `TMA_F0_BC01_BB.1` |
| sự kiện con | không cần mã hiển thị; khoá là `uuid`, `UNIQUE (batch_id, ngày, seq)` với `seq` cấp trong transaction | — |

Generation lấy từ khoá ngoại tới `generation.generation_no`, **không bao giờ cắt chuỗi mã** (lỗi `MID(egg_id, 6, 2)` của AppSheet).

### 7.4 Việc và lịch (Task ⇄ Breeding)

Mọi công việc nằm chung danh sách "Việc của tôi", chia 4 loại:

| Loại | Nguồn | Xong khi |
|---|---|---|
| Định kỳ tự sinh | `routine_template` của protocol × batch đang mở; job đêm sinh `routine_occurrence` cho ngày hôm sau, batch mới mở thì sinh ngay | Đủ `target_qty` bản ghi của form trong khung giờ. Trễ khi quá `due_at + tolerance_min` |
| Nhắc tự động | Hệ thống tạo khi đủ điều kiện hoặc có sự kiện: chốt giai đoạn, đặt điều kiện, in nhãn, lỗi DQ | Điều kiện được xử lý |
| Task nhập liệu (`task.kind = data`) | Executive giao: form + batch + mục tiêu | Đếm từ bản ghi; đủ mục tiêu thì tự Completed (hoặc Under review nếu bật review) |
| Task thường (`task.kind = general`) | Executive giao: checklist, ảnh | Người làm gửi kiểm tra, người giao Hoàn thành hoặc Trả lại |

`done_qty` được cập nhật **trong cùng transaction** với bản ghi đo lường. Xoá bản ghi trong 24 giờ làm việc mở lại. Chỉ giao được cho người có quyền nhập form đó.

### 7.5 Data quality

Chạy khi lưu form, khi import và mỗi đêm. Lỗi nặng (`error`) chặn chốt; cảnh báo (`warning`) thành badge và vào `dq_issue`.

| Nhóm | Ví dụ |
|---|---|
| Bắt buộc | Giữ Required / Min của AppSheet: `egg_mass ≥ 1`, `egg_clutch_mass ≥ 0,01`, `moisture ≥ 0,01` |
| Khoảng hợp lệ theo protocol | indv egg 0,020–0,035 mg; indv neonate 0,015–0,032 mg; moisture 0–1 |
| Trùng | Cùng batch + cùng thời điểm + cùng khối lượng |
| Thứ tự ngày | Ngày quan sát trong `[start_date, end_date]`; emergence ≥ ngày bắt đầu batch |
| Cha hợp lệ | Batch cha tồn tại, cùng strain; generation +1 ở bước Egg → Neonate |
| Khớp hand-off | Số chuyển đi so với nhận về → `match_status` |
| Bất thường | Lệch > 3σ so với batch cùng stage và strain → cảnh báo |
| Hoàn tất | Không chốt khi còn cá thể `pending` |

Executive bỏ qua được một lỗi, bắt buộc lý do.

### 7.6 Luật sửa và xoá

- Bản ghi của mình: sửa / xoá trong **24 giờ**, khi batch còn open, trên điện thoại hoặc web.
- Bản ghi người khác: chỉ trên web, theo quyền, **bắt buộc lý do**.
- Batch đã chốt: khoá với mọi người cho tới khi Admin mở lại.
- Mọi thay đổi ghi `audit.audit_log` (cũ / mới, ai, lúc nào, lý do). AppSheet chỉ ghi Add / Delete / Import.

## 8. Mối quan tâm xuyên suốt

| Chủ đề | Cách làm | Ở đâu |
|---|---|---|
| Xác thực | Entra ID OIDC; mỗi nền tảng một app registration (web, mobile) để API biết request đến từ đâu | `api-standards.md` §5 |
| Phân quyền | 3 lớp: API (`require(perm, scope)`), Postgres RLS (`auth.has_perm()`), UI ẩn nút theo `/me/permissions` | `backend.md` §12 |
| Audit | Trigger `audit.audit_log` trên mọi bảng `core`; lý do sửa đi qua `set_config('app.reason')` | `backend.md` §7.3, §8 |
| Offline | Mobile ghi vào outbox IndexedDB với `id` do client sinh; API idempotent | `mobile.md` §6, `api-standards.md` §9 |
| Đồng thời | Khoá lạc quan bằng `version` / `If-Match` | `api-standards.md` §8 |
| Ngôn ngữ | Giao diện tiếng Việt, có tiếng Anh; số kiểu vi-VN (`0,0291`, `11.140`), ngày `dd/mm/yyyy` | `design-system.md` §7 |
| Giờ | Lưu UTC, hiển thị và tính "ngày" theo `Asia/Ho_Chi_Minh` | `api-standards.md` §4 |
| Quan sát | Log JSON có `trace_id`, lỗi gửi Sentry, `/healthz`, `/readyz` | `backend.md` §14, `infrastructure.md` §8 |
| Bí mật | Chỉ trong biến môi trường của server hoặc vault; không trong repo, không trong OneDrive | mục 10 |

## 9. Lỗi của AppSheet được sửa

| Mức | Vấn đề | Cách xử lý ở hệ thống mới |
|---|---|---|
| Cao | Mật khẩu SSH, DB và AppSheet API key nằm dạng chữ thường trong file trên OneDrive | Đổi toàn bộ; secret chỉ trên server; user DB riêng cho app; role chỉ SELECT cho `analytics` |
| Cao | `hatching_rate` trong tài liệu là nghịch đảo của ERD / Excel | Một định nghĩa trong `kpi_definition` + test bằng dữ liệu lịch sử |
| Cao | Pupae `survival_rate` sai thứ nguyên | Dùng công thức Excel: `((P + PP) / sample_weight × total_biomass) / stock_density` |
| Cao | `emergence_rate`, `female_ratio` đếm cả dòng sexing rỗng tạo sẵn để in nhãn | Chỉ đếm cá thể có `emergence_date` / `sex`; không chốt khi còn `pending` |
| Cao | Không có transaction khi chuyển giai đoạn / xoá | Một endpoint, một transaction |
| TB | Trùng mã (hậu tố = COUNT + 1) | `seq` cấp trong transaction + `UNIQUE` |
| TB | Parse generation bằng cắt chuỗi | FK tới `generation` |
| TB | Dòng dõi chỉ một cha | `batch_transfer` n–n |
| TB | Dashboard Metabase public, mã batch gửi ra quickchart.io | Dashboard trong app có đăng nhập; QR sinh ở server |
| TB | Đơn vị không thống nhất (kg / g / mg, ×1000) | Data dictionary; đơn vị trong tên cột |
| TB | PM lưu người bằng chuỗi tên nối " & " | Bảng nối `project_member`, `task_assignee`, `message_recipient` |
| Thấp | Validation import chỉ kiểm tra thiếu giá trị | DQ đầy đủ, preview lỗi trước khi ghi |
| Thấp | Mã phòng / lồng không đều padding (MC1, MC10, MC06) | Format cố định khi tạo, chuẩn hoá khi migrate |
| Thấp | Tài liệu lệch app | Tài liệu API sinh từ code (OpenAPI), KPI có docstring |

## 10. Môi trường và triển khai

| Môi trường | Mục đích | Dữ liệu |
|---|---|---|
| `local` | Dev, Docker Compose | Seed + dữ liệu test từ Data Migration.xlsx |
| `staging` | Test nghiệm thu với user, chạy song song AppSheet | Bản sao dữ liệu đã ẩn danh hoặc dữ liệu thật nếu được duyệt |
| `production` | Vận hành | Thật |

- Docker Compose: `postgres`, `api`, `worker` (Procrastinate, cùng image), `web` (static qua Nginx), `mobile` (static PWA qua Nginx), `nginx` (TLS). Không có Redis (ADR-0005).
- Backup: `pg_dump -Fc` hằng đêm + rsync ra ngoài máy; **restore drill mỗi tháng** ghi vào `docs/ops/restore-log.md`; PITR bằng pgBackRest nếu RPO < 24 giờ được yêu cầu.
- Migration DB chạy tự động khi deploy (`alembic upgrade head` trong entrypoint), có bước rollback được kiểm tra ở staging.
- CI: lint, type check, boundaries, test, build, sinh lại OpenAPI + client và kiểm diff, migration up → down → up trên Postgres thật, contract (Spectral, schemathesis, oasdiff).
- Chi tiết: `infrastructure.md`.

## 11. Chiến lược migrate từ AppSheet

1. **Đọc dữ liệu cũ** vào schema `legacy` (giữ nguyên cột): MB từ warehouse Postgres hiện có; PM qua AppSheet API (PM không có trong warehouse).
2. **Biến đổi** sang `core`: Row ID → `uuid` + `legacy_row_id`; `*_ref` → FK và `batch_transfer`; chuẩn hoá mã phòng / lồng; chuỗi tên người → FK `app_user`; dòng sexing rỗng → `individual.status = pending`.
3. **Tính lại KPI** bằng view mới và so với giá trị AppSheet. Mọi khác biệt phân loại theo 5 nhóm của Rollout Plan: Match / Logic Difference / Source Gap / User Error / Defect.
4. **Chạy song song** trên staging, user nhập trên app mới.
5. **Cutover**: khoá AppSheet chỉ đọc, chạy import lần cuối, tắt cron ETL và Metabase, đổi mật khẩu cũ.

| Bảng AppSheet | Bảng mới |
|---|---|
| strains · generations · cages · rooms | `strain` · `generation` · `container` |
| egg_production | `batch` (stage = egg) + `breeding_setup` |
| egg_collection | `egg_collection` |
| egg_weighing | `egg_clutch` (type = sampling) |
| emerge_sexing | `individual` |
| neonate_harvesting | `batch` (stage = neonate) + `batch_transfer` |
| neonate_harvest · neonate_weighing | `neonate_harvest` · `sample_weighing` (date + time → `harvested_at`) |
| larvae_growing · nursery · pupae_growing | `batch` + `rearing_condition` + `batch_transfer` |
| larvae · nursery · pupae_observation | `*_observation` (thêm `replicate_no`) |
| db_log | `audit.audit_log` |
| users | `app_user` + `auth.*` (4 cờ → quyền riêng) |
| projects · tasks · chat · files · pm_reports · dashboard_filter | `project` · `task` · `project_member` · `task_assignee` · `message` · `message_recipient` · `attachment` · `report` (dashboard_filter thành tham số truy vấn) |
| master_controls · home · scanner · temp · import_wizard · *_import | Bỏ (workaround của AppSheet) |

## 12. Lộ trình

| Giai đoạn | Nội dung | Xong khi |
|---|---|---|
| 0 · Chốt logic | Data dictionary, bộ KPI có version, chuẩn mã; xác nhận các công thức ⚠ trên app thật với Executive phụ trách | Tài liệu KPI được ký, có bộ dữ liệu test từ Data Migration.xlsx |
| 1 · Nền tảng | Repo, Compose, Postgres + Alembic, Entra SSO, RBAC + RLS, audit trigger, master data, design system | Đăng nhập được, CRUD master data, mọi thay đổi vào audit |
| 2 · Maintenance Breeding | Batch, đo lường, gate, chốt, mở lại, quét QR, nhãn PDF, import có preview, lịch việc định kỳ, PWA offline | Chạy trọn Egg → Neonate → Nursery → Pupae → Egg và nhánh Larvae bằng dữ liệu test |
| 3 · Migrate dữ liệu MB | Nạp legacy, biến đổi, tính lại KPI, đối chiếu | 100% khác biệt được phân loại |
| 4 · Dashboard và cutover | Dashboard 5 giai đoạn, phân tích KPI, export; chạy song song; khoá AppSheet | Số trên app khớp dashboard cũ, user nhập trên app mới |
| 5 · Project Management | Dữ liệu PM qua API, bảng nối, task nhập liệu gắn batch | Project, task, chat, file, report đủ và đúng quyền |
| 6 · Selective Breeding | Model chung từ ERD đã sửa lỗi; import cân Ohaus; selection run | Một thế hệ MSB chạy hết vòng, có selection index và lineage |

## 13. Quyết định còn mở

Mỗi mục là một ADR cần chốt trước khi làm phần liên quan. Cột "Mặc định" là giả định để không chặn việc; đổi thì cập nhật tài liệu.

| # | Quyết định | Mặc định trong tài liệu | Chặn |
|---|---|---|---|
| D1 | Thời điểm: go-live AppSheet rồi cutover sau hypercare (05/02/2027), hay dừng rollout AppSheet | Go-live AppSheet theo kế hoạch, cutover sau | Giai đoạn 4 |
| D2 | Model chung MB + SB, hay port 1:1 rồi gộp | Model chung | Giai đoạn 1 |
| D3 | Nơi chạy: server Genetics nội bộ hay Azure | Server nội bộ, Docker Compose, truy cập qua HTTPS | Giai đoạn 1 |
| D4 | Lưu file: SharePoint (Graph API) hay MinIO / ổ server | Interface `FileStorage`, bản đầu dùng ổ server | Giai đoạn 2 |
| D5 | Task nhập liệu tự Completed hay tự sang Under review | Tự Completed; bật `review` thì sang Under review | Giai đoạn 2 |
| D6 | Lịch việc định kỳ của từng protocol (ngày, khung giờ, số mẫu, dung sai) | Dùng ví dụ trong blueprint, Executive nhập lại | Giai đoạn 2 |
| D7 | Công thức cuối: female ratio, emergence, hatching, pupae survival, pupation, effective clutch | Theo ERD / Excel (mục 9) | Giai đoạn 0 |
| D8 | Thiết bị điện thoại mục tiêu (Android / iOS, phiên bản) | Android Chrome hiện hành, iOS Safari 16.4+ | Giai đoạn 2 |

## 14. Bảng thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| Batch | Nhóm cá thể ở một giai đoạn, có mã như `TMA_F4_BC01` |
| Stage | Giai đoạn: egg, neonate, nursery, larvae, pupae |
| Strain · dòng | TMA, TME, REF (Maintenance); MSA, MSB, MSC là scheme của Selective |
| Line | SEL (chọn lọc), CTR (đối chứng), BK (dự phòng) |
| Generation | Thế hệ: F0…F7 (Maintenance), G0…G4 (Selective) |
| Container | Phòng (MC), lồng (BC), crate |
| Gate | Điều kiện để mở form con hoặc bật nút Chốt |
| Chốt (close) | Đóng batch và tạo batch kế trong một transaction |
| Lineage | Quan hệ batch cha → con qua `batch_transfer` |
| Emerge & sexing | Ghi từng cá thể nở: ngày nở, giới tính, khối lượng |
| Clutch | Ổ trứng; `sampling` để cân, `incubated` để ấp |
| FCR | Hệ số chuyển hoá thức ăn (wet / dry) |
| DQ | Data quality: luật kiểm tra dữ liệu |
| Routine | Việc định kỳ sinh từ protocol |
| PWA | Web app cài được lên màn hình điện thoại |
| Outbox | Hàng đợi bản ghi chờ gửi trên điện thoại |

## 15. Tài liệu liên quan

- `docs/architecture/backend.md` — Modular Monolith + Clean Architecture cho FastAPI
- `docs/architecture/web.md` — React feature-based, shadcn/ui
- `docs/architecture/mobile.md` — PWA cho khu nuôi (Expo hoặc web-first), offline, ma trận tương thích
- `docs/architecture/api-standards.md` — quy ước API và contract-first
- `docs/architecture/infrastructure.md` — Compose, deploy, backup, quan sát
- `docs/architecture/quality-standards.md` — quality gate, SLO, enforce cho agent
- `docs/architecture/research-references.md` — nguồn đã xác minh (ngày truy cập)
- `docs/architecture/open-questions.md` — câu hỏi kiến trúc còn mở
- `docs/decisions/` — ADR-0001 … ADR-0016
- `docs/tasks/initialization/` — blueprint, setup-guide, dependency-map, acceptance-checklist (PLAN-002 → PLAN-003)
- `docs/getting-started.md` — chạy / build / test trên máy dev · `docs/ops/deploy-vm.md` — deploy lên VM công ty
- `docs/migration/` — PLAN-001 (inventory, traceability, backlog, waves, risks)
- `docs/design/design-system.md` — token, component, tham chiếu UI
- `docs/tasks/workflow.md` — cách chia và làm task
- Genetics Platform Wireframes (`docs/genetics-platform-wireframes/`, 346 màn) và Blueprint — tham chiếu UI và hiện trạng AppSheet
