# PLAN-001 · 3 · Master feature backlog

> Danh sách **feature** (không phải task) phủ toàn bộ phạm vi migrate đã kiểm chứng. Mỗi feature sau này tách thành task theo `docs/tasks/workflow.md` §4 (một task = một PR ≤ 2 ngày).
> Epic `E00…E15` lấy từ `workflow.md` §3. Wave `W0…W6` xem `05-waves.md`. Dependency xem `04-dependency-map.md`.
>
> **Nguồn gốc** (theo nhãn trên wireframe và blueprint): `AS` có sẵn trong AppSheet (giữ luật) · `AS+` AppSheet + mở rộng hoặc sửa lỗi · `New` không có trong AppSheet, có trong wireframe / kiến trúc / khuyến nghị review · `SB` Selective Breeding (chỉ ERD + Excel).
> **Nền**: `API` backend · `DB` migration / view · `Web` React · `Mob` PWA web-first · `Data` migrate dữ liệu · `Infra` · `Doc` tài liệu / quyết định.
> **Ưu tiên** (theo `workflow.md` §4.2): `P0` chặn go-live hệ mới cho MB · `P1` cần cho go-live · `P2` sau go-live được.
> **Nguồn** trỏ về `01-inventory.md` (INV), board wireframe, mục tài liệu kiến trúc, quyết định D / DN.

Không có feature nào ở đây **bịa thêm chức năng AppSheet**: mọi dòng `AS` / `AS+` trỏ về INV hoặc board wireframe có nhãn tương ứng; dòng `New` trỏ về wireframe `[Mới]`, blueprint hoặc khuyến nghị trong Data System & Operation Review.

## Tổng hợp

| Epic | Tên | Wave | Số feature | P0 | P1 | P2 |
|---|---|---|---|---|---|---|
| E00 | Chốt logic nghiệp vụ | W0 | 7 | 6 | 1 | 0 |
| E01 | Nền tảng repo & hạ tầng | W1 | 7 | 5 | 2 | 0 |
| E02 | Đăng nhập & phân quyền | W1 | 9 | 7 | 2 | 0 |
| E03 | Xuyên suốt (API, audit, job, file, thông báo) | W1 | 10 | 8 | 2 | 0 |
| E04 | Design system & khung app | W1 | 9 | 7 | 2 | 0 |
| E05 | Dữ liệu tham chiếu | W1 | 8 | 6 | 2 | 0 |
| E06 | Breeding lõi (MB) | W2 | 26 | 23 | 3 | 0 |
| E07 | Data quality | W2 | 4 | 3 | 1 | 0 |
| E08 | Nhãn & quét QR | W2 | 3 | 3 | 0 | 0 |
| E09 | Import | W2 | 4 | 2 | 2 | 0 |
| E10 | Việc & lịch | W2 | 5 | 1 | 3 | 1 |
| E11 | Phân tích & dashboard | W3 | 6 | 3 | 2 | 1 |
| E12 | Migrate dữ liệu MB | W3 | 7 | 6 | 1 | 0 |
| E13 | Cutover & vận hành | W4 | 5 | 5 | 0 | 0 |
| E14 | Project Management | W5 | 10 | 0 | 9 | 1 |
| E15 | Selective Breeding | W6 | 9 | 0 | 7 | 2 |
| **Tổng** | | | **129** | 85 | 39 | 5 |

(P0 / P1 / P2 tính cho go-live hệ mới thay AppSheet MB; E14 / E15 là P1 / P2 vì PM vẫn chạy được trên AppSheet tới khi migrate, SB chưa có app.)

---

## E00 · Chốt logic nghiệp vụ (W0)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0001 | Data dictionary MB: mọi cột đo lường, đơn vị (mg / g / kg), kiểu, khoảng hợp lệ, fallback | AS+ | Doc | P0 | — | INV-14…17, INV-69, INV-70; Appendix I Data Fields; Review #4 | Một bảng cột → đơn vị → nguồn AppSheet → cột mới; chốt `avg_baby_mass` ×1000, `total_dry_feed` kg / g, replicate | Executive phụ trách ký; đưa vào `docs/data/data-dictionary.md` |
| F-0002 | Bộ định nghĩa KPI v1 có version (female_ratio, emergence, mating, hatching, larvae survival / wet / dry FCR, nursery feeding / survival, pupae pupation / survival, duration) | AS+ | Doc | P0 | F-0005 | INV-60…72; blueprint "Công thức chỉ số"; `backend.md` §5.5; D7 | Mỗi KPI: code, công thức, đơn vị, cách xử lý chia 0, khác biệt so AppSheet | Tài liệu ký, seed `kpi_definition` v1 |
| F-0003 | Chuẩn mã: generation `{strain}_F{n}` / `_G{n}`, container `MC` / `BC` / `CR` + 2 số, batch `{generation}_{container}`, cá thể `_BB.n`, `seq` bản ghi con | AS+ | Doc | P0 | — | INV-40…46; `overview.md` §7.3 | Chốt format, quy tắc batch không container, mã khi chia nhiều lồng | ADR + test vector |
| F-0004 | Bộ dữ liệu test từ Data Migration.xlsx + warehouse + KPI AppSheet để đối chiếu (`tests/fixtures/legacy`) | AS | Data | P0 | — | INV-140…152 | Trích, ẩn danh tên người, kèm giá trị KPI AppSheet hiện có | Fixture commit; parity test dùng được |
| F-0005 | Xác nhận trên app AppSheet thật các công thức ⚠ và danh sách 44 bảng / 101 view | AS | Doc | P0 | — | INV-64, INV-69…71, UNK-01, UNK-02 | Đọc app editor: hatching_rate, pupae survival, avg_baby_mass, female_ratio; liệt kê bảng / view chưa nêu trong tài liệu | Bảng kết quả đính kèm ADR D7 |
| F-0006 | Protocol v1 cho 5 giai đoạn MB: mật độ, số mẫu, khung giờ, khoảng hợp lệ, lịch việc định kỳ, dung sai trễ | AS+ / New | Doc | P0 | — | Sampling Assessment MB (07:00 · 10:00 · 13:00 · 15:00; 3 × 100 con; 45.000 / crate; 60 / 30 ổ); blueprint "Từng công việc"; D6 | Tham số dạng jsonb để seed `protocol_version` | Executive ký; seed |
| F-0007 | Quy trình đối chiếu migrate: 5 nhóm Match / Source Gap / Logic Difference / User Error / Platform Defect + mẫu defect log | AS | Doc | P1 | — | Rollout Plan §1.4, Defect Log Template | Dùng lại cho E12 và E13 | Mẫu trong `docs/data/` |

## E01 · Nền tảng repo & hạ tầng (W1)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0101 | Monorepo skeleton: pnpm + Turborepo, `backend/` (uv, ruff, mypy, import-linter), `apps/web`, `apps/mobile`, `packages/{api-client,shared,design-tokens}`, `tools/legacy_import`, `infra/` | New | Infra | P0 | — | `overview.md` §5, `backend.md` §3, §14 | Thư mục `apps/`, `packages/`, `services/`, `contracts/` hiện có trống: chốt theo `overview.md` | Build xanh trên máy trống |
| F-0102 | Docker Compose local: postgres 16 (4 schema, 3 role DB), api, worker, web, mobile, nginx (không Redis theo ADR-0005; thêm `redis` nếu ADR bị từ chối) | New | Infra | P0 | F-0101 | `overview.md` §10, `backend.md` §7.1 | Seed + fixture legacy | `docker compose up` chạy e2e |
| F-0103 | CI: lint, type check, test, build, kiểm `openapi.json` ↔ api-client, migration up → down → up trên Postgres thật, boundaries | New | Infra | P0 | F-0101 | `workflow.md` §6, `.github/` hiện có | | PR bắt buộc CI xanh |
| F-0104 | Môi trường staging / production (server Genetics nội bộ, Nginx TLS; hoặc Azure theo D3), deploy từ `main` / tag | New | Infra | P0 | F-0102, D3 | `overview.md` §10, Architecture png | Staging tự động; production thủ công có checklist | Staging truy cập qua HTTPS từ điện thoại trong khu nuôi |
| F-0105 | Backup `pg_dump` hằng ngày + WAL, test restore hằng tháng có ghi nhận | New | Infra | P1 | F-0104 | `overview.md` §10 | | Restore drill đầu tiên xong trước W4 |
| F-0106 | Quan sát: log JSON structlog + `trace_id`, Sentry (hoặc tương đương), `/healthz`, `/readyz` | New | API / Infra | P1 | F-0101 | `backend.md` §12 | | Lỗi 5xx có trace trên Sentry |
| F-0107 | Quản lý secret: `.env.example`, biến môi trường trên server, user DB riêng cho app, role `app_analytics_ro`; kế hoạch rotate SSH / DB / AppSheet API key cũ | AS+ | Infra | P0 | F-0104 | INV-137, RSK-01 | Không secret trong repo / OneDrive | Secret cũ đã đổi trước khi staging có dữ liệu thật |

## E02 · Đăng nhập & phân quyền (W1)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0201 | Entra ID: 3 app registration (API, web SPA, mobile PWA), MSAL redirect flow, kiểm JWT (iss, aud, tid, JWKS cache), nền tảng phiên từ `azp` | AS+ | API / Web / Mob | P0 | F-0101 | INV-136; `api-standards.md` §5 | Thay sign-in AppSheet | Đăng nhập được trên web và PWA; token web gọi endpoint app → 403 |
| F-0202 | `app_user`: tạo từ `oid` lần đầu, `account_pending`, `GET /me` (role, platform, home, phone_home) | AS+ | API / DB | P0 | F-0201 | `api-standards.md` §5.1; board NoAccess | | User chưa gán vai trò → 403 `account_pending` |
| F-0203 | Schema `auth`: role (4 bộ mặc định `is_system`), permission (danh mục `backend.md` §8.2), role_permission (scope, device), user_permission (grant / deny, batch, hạn, lý do), user_scope; seed | AS+ | DB | P0 | F-0101 | INV-85, INV-89; `backend.md` §8 | Project Leader gộp vào Executive | Migration + seed; test ma trận quyền |
| F-0204 | `auth.has_perm()` + RLS policy trên bảng đo lường, batch, project / task / message / attachment | New | DB | P0 | F-0203 | `backend.md` §8.3, §9 | Lớp chặn thứ hai | Test integration đăng nhập từng vai trò |
| F-0205 | `require(perm, scope)` dependency, `actor.require` trong use case, `GET /me/permissions` (etag), `Can` / `usePermissions` ở client | New | API / Web / Mob | P0 | F-0203 | `backend.md` §8.3; `web.md` §6 | Cấm kiểm tên vai trò | Nút ẩn / hiện đúng theo quyền trên 4 vai trò |
| F-0206 | Web Users: danh sách, mời user (`POST /users/invite`), gán vai trò, phạm vi dòng / chương trình, quyền riêng có hạn + lý do | AS+ | Web / API | P0 | F-0205 | INV-11; board Users, UserInvite | Thay bảng `users` + 4 cờ | Admin thêm Worker và cấp thêm 1 quyền form cho 1 batch |
| F-0207 | Web Vai trò & quyền: xem / sửa ma trận nền tảng · màn & nút · điện thoại; nhân bản vai trò (ví dụ QC); không xoá vai trò hệ thống | New | Web / API | P1 | F-0205 | board RolePerms, Roles; `PUT /roles/{id}/permissions` | | Tạo vai trò QC không sửa code |
| F-0208 | Màn Login, NoAccess (gửi yêu cầu cấp quyền → thông báo Admin), WorkerDesktop (QR cài PWA), MLogin, màn "dùng web" cho Manager / Admin trên app | AS+ / New | Web / Mob | P0 | F-0201, F-0308 | board Login, NoAccess, WorkerDesktop, MLogin | | Worker mở web → `/worker`, không lỗi |
| F-0209 | Audit mọi thay đổi quyền (`role_permission`, `user_permission`, `app_user.role_id`) | New | DB | P1 | F-0305 | `backend.md` §9 | | Dòng audit khi đổi vai trò |

## E03 · Xuyên suốt (W1)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0301 | Lỗi problem+json (RFC 9457), danh mục `code`, `blockers[]`, `errors[]`, `trace_id`; handler `DomainError`; client `ApiError` | New | API / Web / Mob | P0 | F-0101 | `api-standards.md` §7 | | Mọi lỗi test API có `code` ổn định |
| F-0302 | Phân trang cursor / offset, lọc phẳng, `q`, `sort`, khoảng ngày theo giờ VN; `DataTable` dùng chung | New | API / Web | P0 | F-0301 | `api-standards.md` §10; `web.md` §8 | | `/batches` lọc stage / strain / generation / status |
| F-0303 | Khoá lạc quan: `version`, `ETag`, `If-Match`, 412 / 428 | New | API / Web / Mob | P0 | F-0301 | `api-standards.md` §8 | | Test 412 trên PATCH batch |
| F-0304 | Idempotency: `id` client sinh cho bản ghi đo lường (so hash → 200 / 409 `duplicate_id`), `Idempotency-Key` + bảng `idempotency_key` 72 h cho POST khác | New | API / DB | P0 | F-0301 | `api-standards.md` §9 | Nền cho outbox mobile | Gửi lại cùng bản ghi 3 lần → 1 dòng |
| F-0305 | Audit: trigger `audit.log_change()` mọi bảng core, `SET LOCAL app.user_id / device / reason / request_id`, `GET /audit?table=&record_id=` | AS+ | DB / API | P0 | F-0101 | INV-88; `backend.md` §9 | Thay db_log, ghi cả Edit | Sửa bản ghi người khác → audit có reason |
| F-0306 | Job nền Procrastinate trên PostgreSQL (ADR-0005; arq / SAQ + Redis nếu bị từ chối), `GET /jobs/{id}`, mẫu 202 + poll, enqueue trong cùng transaction | New | API / Infra | P0 | F-0102 | `backend.md` §10.3, §11; `api-standards.md` §11 | | Job mẫu chạy, retry 3 lần |
| F-0307 | File: port `FileStorage` + `LocalDiskStorage` (D4), bảng `attachment` (owner_table / owner_id), `POST /attachments`, download có kiểm quyền, giới hạn 20 MB / 10 MB | AS+ | API / DB | P0 | F-0204 | INV-21, INV-123…125; `backend.md` §7.3; D4 | Interface để đổi sang SharePoint / MinIO | Upload ảnh từ mobile, tải từ web |
| F-0308 | Thông báo: bảng `notification`, `GET /notifications`, `POST /notifications/read`, Inbox web + MInbox, web push VAPID (tuỳ chọn) | AS+ | API / Web / Mob | P1 | F-0301 | INV-99; board Inbox, MInbox | Nền cho nhắc tự động, task, chat | Thông báo "task mới" mở đúng deep link |
| F-0309 | OpenAPI → `packages/api-client` (openapi-typescript / orval, chốt một), `operationId` theo mẫu, CI kiểm sinh lại | New | Infra | P0 | F-0101 | `web.md` §5.1; `api-standards.md` §3 | Tài liệu API sinh từ code | PR đổi API mà quên sinh client → CI đỏ |
| F-0310 | `packages/shared`: i18n vi / en, `formatNumber` / `formatInt` / ngày `dd/MM/yyyy` theo `Asia/Ho_Chi_Minh`, mã quyền, nhãn enum, schema zod form, kpi-preview | New | Web / Mob | P1 | F-0101 | `design-system.md` §7; `web.md` §11 | Dùng chung web + mobile | `0,0291 mg`, `11.140 con` |

## E04 · Design system & khung app (W1)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0401 | `packages/design-tokens` (`tokens.json` → `web.css` Tailwind 4 + `tokens.ts`) và `packages/ui` (shadcn init monorepo, Base UI, primitive dùng chung web + mobile) | New | Web / Mob | P0 | F-0101 | `design-system.md` §3–5, §11; board Foundations; ADR-0009 | Không hex trong component | Snapshot test màu 4 vai trò badge; `@genetics/ui` build |
| F-0402 | Web AppShell: sidebar 248 px theo quyền (`layouts/nav.ts`), topbar (breadcrumb, Ctrl K, chuông, avatar), Settings cá nhân, trang lỗi / NoAccess, responsive ≥ 1280 | AS+ / New | Web | P0 | F-0401, F-0205 | board Layout, AppSidebar, Settings, UIStates; `web.md` §9 | Thay `master_controls` / `home` | Sidebar đổi theo vai trò |
| F-0403 | Web component nghiệp vụ dùng chung: BatchCode, StrainBadge, StatusBadge, StageStepper, StatCard, KpiDelta, BatchHead, BlockerList, ReasonDialog, RecordTable, Timeline, LineageChain, CupMap, Empty / Error / NoAccess, Can, DataTable | AS+ | Web | P0 | F-0401 | `design-system.md` §6.2; board BatchHead, BatchLineage, BatchHistory, States, UIStates | | Storybook hoặc test component cho từng cái |
| F-0404 | Mobile PWA shell (web-first, ADR-0010): Vite + TanStack Router, tab bar (Trang chủ · Việc · Quét · Thông báo · Tôi), manifest + service worker qua `vite-plugin-pwa` (precache shell, SWR cho reference), cài đặt Android / hướng dẫn iOS, MProfile | New | Mob | P0 | F-0401, F-0201 | `mobile.md` §4, §5, §7; board MTabBar, MProfile | | Cài lên màn hình chính Android + iOS, mở offline |
| F-0405 | Mobile adapter nền tảng: `auth` (MSAL browser + bridge page), `storage` (idb), `scanner` (`barcode-detector` ponyfill / native), `push`, `files`, `install`, `haptics`; fake để test | New | Mob | P0 | F-0404 | `mobile.md` §4, §8 | Giữ đường bọc Capacitor | Code ngoài `platform/` không chạm `window` (lint) |
| F-0406 | Mobile offline: IndexedDB stores (outbox, batches, records, reference, work, drafts), sync engine (FIFO per batch, backoff, phân loại 2xx / 409 / 412 / 422 / 403 / 401), MSync, OfflineBanner, SyncBadge, hoàn tác xoá 10 s | New | Mob | P0 | F-0405, F-0304 | `mobile.md` §6; board MSync | Mục tiêu "không mất dữ liệu ở khu nuôi" | E2E: offline nhập 3 bản ghi → online → không trùng |
| F-0407 | Mobile component bố cục: PhoneTile, MListRow, NumberField (48 px, dấu phẩy / chấm), SegmentedControl, BottomTabBar, ScreenHeader / ActionFooter (trên primitive `@genetics/ui`) | New | Mob | P0 | F-0404 | `design-system.md` §6.2 | | Dùng trong mọi form M* |
| F-0408 | Bộ kiểm thử UI: Vitest + Testing Library + MSW (web và mobile), Playwright (web; mobile profile iPhone / Pixel), trạng thái bắt buộc (skeleton, trống, lỗi, không quyền) | New | Web / Mob | P1 | F-0402, F-0404 | `web.md` §11; `mobile.md` §11; `design-system.md` §8 | | Template test cho một màn |
| F-0409 | Tài liệu & hướng dẫn: trang Documentation (thư viện có phiên bản, lọc module, trợ giúp theo màn), MDocs (lưu offline); nạp 8 PDF hiện có | AS+ | Web / Mob / API | P1 | F-0307 | INV-13, INV-125; board Documentation, MDocs | Thay bảng `documentation` | Tài liệu mở được offline trên app |

## E05 · Dữ liệu tham chiếu (W1)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0501 | Migration bảng tham chiếu: `strain`, `scheme`, `line`, `generation`, `container`, `diet`, `protocol`, `protocol_version`, `kpi_definition`, `form_def` (seed 13 form_code) | AS+ / New | DB | P0 | F-0101, F-0003 | INV-10; blueprint tab Database; `api-standards.md` §14 | | Migration up / down |
| F-0502 | API tham chiếu: `/strains`, `/generations` (chỉ thêm từ thế hệ mới nhất → 409 `generation_not_latest`), `/containers` (format mã, `is_active`), `/diets`, `/protocols` + `/versions`, `/kpi-definitions`, `/form-defs`; không xoá bản ghi đã dùng | AS+ | API | P0 | F-0501, F-0205 | INV-110; luật "Adds only" | Bản ghi tham chiếu đang dùng chỉ `is_active = false` | Test 409 khi thêm generation không phải mới nhất |
| F-0503 | Web Dòng giống: Strains (thẻ có ảnh, tab Maintenance / Selective, KPI so thế hệ trước), StrainDetail (timeline F0 → Fn, xu hướng KPI), biến thể Manager chỉ xem | AS+ | Web | P0 | F-0502, F-0403 | board Strains, StrainDetail, StrainsManager | KPI trend cần F-1101 (hiện placeholder tới W3) | Manager không thấy nút Thêm / Sửa |
| F-0504 | Web Thế hệ: ma trận lồng × giai đoạn (Generation), AddGeneration (xem trước mã, chỉ từ thế hệ mới nhất) | AS+ | Web | P0 | F-0502 | board Generation, AddGeneration | | Ô trống = giai đoạn chưa tới |
| F-0505 | Web Master data: tab Strain & Generation (Master), Container (MasterContainers: BC / MC / CR, ảnh, đang dùng / trống, vô hiệu hoá), ContainerDetail (batch đang chứa, lịch sử dùng lồng + KPI, QR), Diet (MasterDiets) | AS+ / New | Web | P0 | F-0502, F-0307 | board Master, MasterContainers, ContainerDetail, MasterDiets | Thay Deck cages / rooms | Thêm lồng BC11 sinh mã đúng |
| F-0506 | Web Protocol + ProtocolVersion: tham số SOP, khoảng hợp lệ, ngưỡng, lịch việc; version mới với ngày hiệu lực, áp dụng cho batch mới / đang chạy | New | Web / API | P1 | F-0502, F-0006 | board Protocol, ProtocolVersion | | Batch mới lấy version hiệu lực lúc tạo |
| F-0507 | Web KpiDefs: xem định nghĩa KPI, version, giai đoạn, ngày hiệu lực; tạo version mới (chỉ Executive / Admin) | AS+ | Web / API | P1 | F-0502, F-0002 | board KpiDefs | Đổi công thức = version mới + migration view | |
| F-0508 | Seed master data thật từ AppSheet: strains TMA / TME / REF (+ MSA / MSB / MSC), generations, cages, rooms (chuẩn hoá padding), ảnh | AS | Data | P0 | F-0501, F-1201 | INV-10, INV-124, INV-41 | Dùng chung với E12 | Danh sách lồng / phòng khớp AppSheet |

## E06 · Breeding lõi · Maintenance Breeding (W2)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0601 | Model batch: `batch`, `batch_transfer`, `breeding_setup`, `rearing_condition`, `batch_reopen`, `batch_assignment`; bảng đo lường (`egg_collection`, `egg_clutch`, `individual`, `neonate_harvest`, `sample_weighing`, `larvae_observation`, `nursery_observation`, `pupae_observation`, `feeding_record`, `larva_weight`, `drying_record`); generated column; CHECK / UNIQUE; `codes.py` | AS+ | DB / API | P0 | F-0501, F-0003 | INV-14…17; blueprint tab Database; `backend.md` §5.2 | FK `ON DELETE RESTRICT` (giữ luật xoá cha) | Migration + unit test sinh mã |
| F-0602 | Tạo batch Egg production thủ công: chọn cha Pupae (strain / generation / cage tự điền và khoá) hoặc tự chọn; xem trước mã; trùng → 409; population bắt buộc; sinh nhãn | AS+ | API / Web | P0 | F-0601, F-0502 | INV-50, INV-75, INV-76; board EggCreate | Dùng cho batch đầu tiên / lịch sử | Tạo `TMA_F8_BC01` từ cha đúng |
| F-0603 | Danh sách batch theo giai đoạn: `GET /batches?stage=`, lọc strain / generation / status, nhóm theo strain (EggList); mobile MEggList (nhóm giai đoạn, việc hôm nay) | AS | API / Web / Mob | P0 | F-0601, F-0302 | INV-100; board EggList, MEggList | Thay 5 Deck view | |
| F-0604 | Chi tiết batch: `GET /batches/{id}` (KPI, `can.add / close / close_blockers / edit_conditions / print_labels`, lineage tóm tắt), BatchHead, hàng StatCard, checklist điều kiện chốt, tab theo giai đoạn; mobile MEggDetail / MNeonateDetail / MLarvaeDetail | AS+ | API / Web / Mob | P0 | F-0603, F-0403 | INV-102; board EggDetail, NeonateDetail, LarvaeDetail, NurseryDetail, PupaeDetail, M*Detail | KPI từ view (F-1101); trước đó tính bằng `kpi.py` | Cờ `can.*` đúng cho 4 vai trò |
| F-0605 | Khung đo lường dùng chung: `POST / GET /batches/{id}/measurements/{form_code}`, `PATCH / DELETE /measurements/{form_code}/{id}`, `id` client sinh, `seq` trong transaction, `gates.can_add`, DQ error / warning, cập nhật `done_qty`, `can.edit / delete / edit_requires_reason` | AS+ | API | P0 | F-0601, F-0304, F-0205 | `backend.md` §10.1; INV-50…54 | Một use case cho 13 form | Test gate từng form |
| F-0606 | Form Thu trứng (`egg_collection`): web tab EggDetail (nhập nhiều dòng, Enter), mobile MEggCollect (phòng, ngày, mg, Lưu & thêm tiếp) | AS | Web / Mob | P0 | F-0605, F-0407 | INV-14, INV-77; board EggDetail, MEggCollect | | Offline lưu được |
| F-0607 | Form Cân ổ trứng (`egg_weighing` → `egg_clutch`): EggWeigh (12 ổ, mg / trứng, ổ ngoài khoảng protocol đánh dấu, phân bố), MEggWeigh (cảnh báo vàng, vẫn lưu) | AS | Web / Mob | P0 | F-0605 | INV-14; board EggWeigh, MEggWeigh | | `indv_mass_mg` tính ngay |
| F-0608 | Emerge & Sexing: `POST /batches/{id}/individuals/prepare` (N cá thể pending, SexingRows), lưới CupMap 300 (EggSexing: lọc trạng thái, nhập bàn phím), MSexing (quét cốc → cá thể → Đực / Cái, body mass, ngày nở, Lưu & quét tiếp), trạng thái dead / lost | AS / AS+ | API / Web / Mob | P0 | F-0605, F-0803 | INV-15, INV-46, INV-58; board EggSexing, SexingRows, MSexing | KPI chỉ đếm đã nở | 300 cốc tạo một lần; quét `…_BB.187` mở đúng dòng |
| F-0609 | Form Thu neonate (`neonate_harvest`): NeonateDetail (ngày × giờ thu), MNeonateHarvest (khung giờ 07 · 10 · 13 · 15 hoặc giờ khác, mg) | AS | Web / Mob | P0 | F-0605 | INV-16; board NeonateDetail, MNeonateHarvest | `harvested_at` tstz | |
| F-0610 | Form Cân mẫu neonate (`neonate_weighing` → `sample_weighing`): NeonateWeigh (≥ 3 lần mới chốt, biểu đồ), MNeonateWeigh (bàn phím lớn, mg / con, so lần trước) | AS | Web / Mob | P0 | F-0605 | INV-16; board NeonateWeigh, MNeonateWeigh | | |
| F-0611 | Set population (`PUT /batches/{id}/setup`) và Điều kiện thí nghiệm (`PUT /batches/{id}/conditions`: diet, mật độ, thức ăn ướt, ẩm; mặc định từ protocol; sửa sau khi có quan sát cần lý do) + dialog Conditions | AS+ | API / Web | P0 | F-0605 | INV-55; board Conditions; n_cond | Gate form con larvae / nursery / pupae | Chưa đủ 4 trường → form quan sát không mở |
| F-0612 | Form Quan sát larvae (`larvae_observation`, replicate R1–R3, 3 mẫu cân, KL trước rây, sinh khối, ẩm): LarvaeDetail tab, MLarvaeObs (form nhiều bước, nháp) | AS+ | Web / Mob | P0 | F-0611 | INV-17; board LarvaeDetail, MLarvaeObs | frass, survival tính ngay (preview) | |
| F-0613 | Form Quan sát nursery (`nursery_observation`): NurseryDetail tab, MNurseryObs (mẫu đếm + KL, 3 mẫu 100 con, sinh khối khay) | AS+ | Web / Mob | P0 | F-0611 | INV-17; board NurseryDetail, MNurseryObs | | |
| F-0614 | Form Mẫu pupae (`pupae_sample` → `pupae_observation`, thêm `larvae_qty`): PupaeDetail (ngày 2–6 thu gọn), MPupaeSample | AS+ | Web / Mob | P0 | F-0611 | INV-17; board PupaeDetail, MPupaeSample | | pupation, survival preview |
| F-0615 | Cho ăn theo lịch (`feeding_record`, form `feeding`): tab LarvaeFeed (ngày 0 / 3 / 5 / 7, lượng từng replicate, % chất khô), NurseryFeed (starter S1, 2 khay) | New | API / Web | P1 | F-0605, F-0506 | board LarvaeFeed, NurseryFeed; `backend.md` §4 bảng bổ sung | Tổng dùng cho FCR (chốt ở F-0002 có dùng feeding_record hay `total_wet_feed_kg`) | |
| F-0616 | Tab Thu hoạch Larvae / Pupae: sinh khối cuối mỗi crate, frass, KPI cuối, so sánh diet, gợi ý chia lồng Egg | AS+ / New | Web | P1 | F-0612, F-0614, F-1101 | board LarvaeHarvest, PupaeHarvest | Đọc từ observation + transfer | |
| F-0617 | Chốt Egg → Neonate: `POST /batches/{id}/close` (gate ≥1 sexing / thu / cân, 0 pending, 0 DQ error; tạo neonate F+1 từ FK generation; transfer; yêu cầu nhãn; huỷ routine; sinh routine mới; một transaction), dialog CloseStage, trạng thái EggApproved (khoá) | AS+ | API / Web | P0 | F-0605, F-0608, F-0801, F-1002 | INV-50; board CloseStage, EggApproved; `backend.md` §5.3–5.4, §6 | Chỉ web, quyền `stage.close` | Rollback khi lỗi giữa chừng |
| F-0618 | Chốt Neonate + chọn nhánh (NextBranch): tạo Larvae và / hoặc Nursery (mỗi loại ≤ 1), chia neonate theo khối lượng vào `batch_transfer` | AS | API / Web | P0 | F-0617 | INV-51; board NextBranch | | Tạo cả hai nhánh với tổng khối lượng khớp |
| F-0619 | Chốt Larvae (đóng nhánh, cần ≥ 1 quan sát) và Chốt Nursery → Pupae (gate: đã đặt điều kiện; cùng mã) | AS | API / Web | P0 | F-0617 | INV-52, INV-53 | DN-3: có bắt buộc observation cho nursery? | |
| F-0620 | Chốt Pupae → Egg thế hệ kế với chia nhộng nhiều lồng (PupaeToEgg): mỗi dòng = 1 batch Egg + 1 transfer (số nhộng, khối lượng), tổng phải khớp; yêu cầu nhãn | AS+ | API / Web | P0 | F-0617 | INV-54; board PupaeToEgg; n_p2e | AppSheet chỉ tạo 1 batch giữ nguyên cage | |
| F-0621 | Mở lại batch (Admin): `POST /batches/{id}/reopen` (lý do, 48 h, `batch_reopen`), cron `relock_batches`, dialog ReopenBatch, trạng thái `reopened` badge | New | API / Web | P0 | F-0617 | board ReopenBatch; `backend.md` §10.5 | Thay bước duyệt | Tự khoá lại sau 48 h |
| F-0622 | Sửa / xoá bản ghi: luật 24 h của mình, người khác cần lý do, batch chốt khoá; dialog RecordEdit (giá trị cũ, xem trước KPI), EggEditRecord, DeleteConfirm (gõ mã batch, xoá mềm 30 ngày, Admin khôi phục); mobile MRecordEdit (đếm ngược), MDeleteSheet (hoàn tác 10 s); thông báo người nhập | AS+ | API / Web / Mob | P0 | F-0605, F-0305 | INV-56, INV-57; board RecordEdit, RecordEditNeonate, RecordEditLarvae, RecordEditPupae, EggEditRecord, DeleteConfirm, MRecordEdit, MDeleteSheet; `backend.md` §5.6 | Thay Delete 6 bước | RLS chặn sửa bản ghi người khác không có quyền |
| F-0623 | Dòng dõi: `GET /batches/{id}/lineage?direction=`, tab Dòng dõi mỗi giai đoạn (LineageChain, bảng transfer), trang Lineage (cây về F0 và xuôi, lượng chuyển trên mũi tên) | AS+ | API / Web | P0 | F-0601 | INV-43, INV-44; board EggLineage…PupaeLineage, Lineage, BatchLineage | Thay `*_ref` 1 cha | Pupae `TMA_F4` hiện 3 cha |
| F-0624 | Lịch sử: `GET /batches/{id}/history`, tab Lịch sử (Timeline cũ → mới, lý do, xoá mềm, trạng thái), trang History toàn hệ thống (lọc bảng, người, loại) | AS+ | API / Web | P1 | F-0305 | INV-88; board EggHistory…, History, BatchHistory | Thay db_log | |
| F-0625 | Tra mã và tìm: `GET /lookup?code=`, Search Ctrl K (batch, cá thể, task), MSearch (gợi ý, gần đây) | AS+ / New | API / Web / Mob | P0 | F-0601 | INV-113; board Search, MSearch | Thay bảng scanner | Quét / gõ `TMA_F7_BC01` mở đúng |
| F-0626 | Kiểm thử xuyên suốt M2: e2e "Egg → Neonate → Nursery → Pupae → Egg" + nhánh Larvae bằng fixture, web + mobile (Playwright) | — | Web / Mob / API | P0 | F-0617…F-0620 | `workflow.md` §13.4 | | Chạy xanh trong CI |

## E07 · Data quality (W2)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0701 | Bộ luật DQ trong domain: bắt buộc / Min (giữ AppSheet), khoảng hợp lệ theo protocol, trùng, thứ tự ngày, cha hợp lệ, cá thể pending, khớp hand-off (`match_status`), bất thường 3σ | AS+ / New | API | P0 | F-0605, F-0506 | INV-75…82; `overview.md` §7.5 | | Unit test mỗi luật |
| F-0702 | `dq_issue` + chạy khi lưu form, khi import, job `nightly_dq` 01:00 | New | DB / API | P0 | F-0701, F-0306 | `backend.md` §11 | | |
| F-0703 | Chặn chốt khi còn `error`; badge cảnh báo trên batch / dòng bảng (`row-error`, `row-warning`) | New | API / Web | P0 | F-0702, F-0617 | `overview.md` §7.2 | | 409 `dq_blocking` |
| F-0704 | Trang DQ: danh sách lỗi, mở → bản ghi, Bỏ qua kèm lý do (`POST /dq-issues/{id}/ignore`), thông báo cho Executive | New | Web / API | P1 | F-0702, F-0308 | board DQ | | |

## E08 · Nhãn & quét QR (W2)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0801 | `label_print` + job `render_labels` (Jinja2 HTML → WeasyPrint, QR segno nội dung = mã): nhãn batch Egg (A4 ngang: QR + mã + population), Neonate (tem 105 × 74 mm: QR + mã + Egg cha), nhãn cốc sexing A4 3 cột (nội dung ô chốt ở UNK-09) | AS+ | API / DB | P0 | F-0306, F-0307 | INV-114, INV-120, INV-47; `backend.md` §10.3 | Thay bot + quickchart + docx | PDF giống nhãn hiện có (`Files/labels`) |
| F-0802 | Web Labels: xem trước, in, in lại; yêu cầu tự động khi chốt / tạo batch; nút In nhãn trên BatchHead; nhắc "in nhãn batch mới" | AS+ | Web / API | P0 | F-0801 | board Labels; INV-59 | | |
| F-0803 | Mobile quét: MScan (camera sau, đèn, khung vuông, nhập mã tay, rung / âm), MScanResult (thẻ batch + thao tác hợp lệ theo `can.*`), tra offline trong store `batches` | AS+ | Mob | P0 | F-0405, F-0625 | INV-113; board MScan, MScanResult; `mobile.md` §10 | Thay scanner + bot Scan row clear | Quét nhãn in thật trên Android + iPhone |

## E09 · Import (W2)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-0901 | `import_batch` + template (9 CSV tương thích + xlsx), `POST /imports` upload → job parse / validate (domain + DQ từng dòng) → `GET /imports/{id}/rows?status=`; `GET /import-templates` | AS+ | API / DB | P0 | F-0605, F-0701, F-0306 | INV-18, INV-82, INV-122; `backend.md` §10.2 | Thay staging + IFS | Import file mẫu `mb_egg_collection_import_form.csv` |
| F-0902 | Web wizard Import1 (chọn loại + batch đích, tải template) → Import2 (preview lỗi đỏ / cảnh báo vàng) → Import3 (`POST /imports/{id}/commit` một transaction, kết quả) | AS+ | Web | P0 | F-0901 | board Import1, Import2, Import3 | Chỉ web (`import.run`) | |
| F-0903 | Lịch sử import + hoàn tác 24 h (`POST /imports/{id}/undo`, batch chưa chốt, lý do): ImportHistory, ImportUndo | New | Web / API | P1 | F-0902 | board ImportHistory, ImportUndo | | |
| F-0904 | Import liên kết từ chi tiết batch (nút Import trên BatchHead mở Import1 với batch đích điền sẵn) | AS | Web | P1 | F-0902 | INV-111 "Import data"; INV-103 Linked | | |

## E10 · Việc & lịch (W2)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1001 | `routine_template` (theo protocol_version, form, schedule jsonb, target_qty, tolerance), `routine_occurrence`, `batch_assignment`; job `generate_routine` 00:15 + khi tạo batch; `mark_late_routine` 10 phút | New | DB / API | P1 | F-0506, F-0306 | blueprint "Việc & lịch"; `backend.md` §10.4 | D6 | Sinh đúng việc cho batch mở |
| F-1002 | `done_qty` cập nhật trong cùng transaction với bản ghi đo lường; xoá bản ghi mở lại việc; chốt batch huỷ việc chưa làm và task data đang mở | New | API | P0 | F-0605, F-1001 | `overview.md` §7.4 | Gọi qua `work.public` | Test transaction |
| F-1003 | Việc của tôi: `GET /me/work?date=&kind=` (routine, task, nhắc); web MyTasks (Kanban + lịch hạn tuần); mobile MTasks (trễ · hôm nay · sắp tới, chạm mở form) | AS+ | API / Web / Mob | P1 | F-1001, F-0308 | board MyTasks, MTasks, TaskFlow | Task PM đầy đủ ở E14 | |
| F-1004 | Lịch việc định kỳ (web RoutineSchedule): template theo protocol, phân công batch → người, % đúng lịch theo người / khu / giai đoạn (`GET /routine/on-time`) | New | Web / API | P1 | F-1001 | board RoutineSchedule | | |
| F-1005 | Nhắc tự động (hệ thống tạo khi đủ điều kiện): đủ điều kiện chốt, cần đặt điều kiện, in nhãn batch mới, lỗi DQ, task được giao | New | API | P2 | F-0308, F-0617, F-0703 | blueprint "Nhắc tự động 9" | | |

## E11 · Phân tích & dashboard (W3)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1101 | View `analytics`: `v_egg_kpi`, `v_neonate_kpi` (cộng cha qua transfer), `v_larvae_kpi`, `v_nursery_kpi`, `v_pupae_kpi`, `v_lineage` (CTE), `v_generation_summary`, `v_cage_contribution`, `v_dq_open`, `v_routine_ontime`, view tên như warehouse cũ; `kpi.py` + `test_kpi_parity` | AS+ | DB / API | P0 | F-0601, F-0002 | INV-60…72; blueprint tab Analytics; `backend.md` §5.5 | Role `app_analytics_ro` | Parity ≤ 1e-9; khớp fixture |
| F-1102 | Dashboard breeding trong app (`GET /analytics/dashboard?stage=`): tổng quan (thế hệ đang chạy, FCR, % theo dòng) + tab Egg / Neonate / Larvae / Nursery & Pupae theo 4 trang Metabase; trục X = generation; nút Dashboard từ trang giai đoạn | AS+ | Web / API | P0 | F-1101 | INV-133; Metabase wireframe; board BreedDashboard | Thay Metabase | Số khớp dashboard Metabase trên cùng dữ liệu |
| F-1103 | Phân tích KPI (`GET /analytics/kpi?stage=&strain=&generation_from=&to=`): theo thế hệ, dòng, so sánh lồng; bảng số liệu kèm biểu đồ | New | Web / API | P1 | F-1101 | board Analytics | | |
| F-1104 | Báo cáo & export: `POST /exports` (CSV / Excel / JSON, 5 giai đoạn, tổng hợp theo batch hoặc từng lần đo), job `export_large`, trang Reports | AS+ | Web / API | P0 | F-1101, F-0306 | INV-133 Export Hub; board Reports | Thay Export Hub | |
| F-1105 | Home theo vai trò: HomeExec (việc cần làm, thẻ giai đoạn, dòng giống, hoạt động gần đây), HomeManager, HomeAdmin; mobile MHome / MHomeExec (ô theo `phone_home` ∩ quyền form, việc tiếp theo) | AS+ / New | Web / Mob / API | P1 | F-1003, F-0703, F-1101 | board Home*, MHome, MHomeExec | | |
| F-1106 | Báo cáo batch PDF khi chốt (EggApproved "báo cáo batch PDF") | New | API | P2 | F-0801, F-1101 | n_eggapproved | Job `generate_report` dùng chung | |

## E12 · Migrate dữ liệu MB (W3)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1201 | `tools/legacy_import`: schema `legacy` giữ nguyên cột; nạp từ warehouse Postgres (18 bảng), Data Migration.xlsx (13 sheet), AppSheet API (`fetch_table` dùng lại từ `cloud_to_db.py`) cho bảng ngoài warehouse (users, documentation, PM) | AS | Data | P0 | F-0102, F-0004 | INV-130…132, INV-140…152 | Không sửa tay | Chạy lại được, idempotent |
| F-1202 | Transform master data: strains, generations (`generation_no` số), cages / rooms → `container` (padding `MC1` → `MC01`), ảnh → attachment, users → `app_user` (map email Entra) | AS+ | Data | P0 | F-1201, F-0501 | INV-41, INV-85 | | 0 mã không khớp format |
| F-1203 | Transform batch & lineage: 5 bảng cha → `batch` (program, stage, status closed / open theo end_date), `breeding_setup`, `rearing_condition` (diet text → `diet`), `*_ref` → `batch_transfer` (pupae gộp nhiều cage; nursery không cage), `legacy_row_id` | AS+ | Data | P0 | F-1202, F-0601 | INV-42…44; `overview.md` §11 | | Mỗi batch cũ có đúng 1 batch mới; lineage tới F0 |
| F-1204 | Transform đo lường: egg_collection, egg_weighing → egg_clutch, emerge_sexing → individual (rỗng → pending), neonate_harvest (`harvested_at`, parse "SA / CH"), neonate_weighing (Egg ID → neonate batch), larvae / nursery / pupae observation (+ replicate từ Excel), `seq` theo thứ tự tạo | AS+ | Data | P0 | F-1203 | INV-141…152 | | Số dòng khớp ± Source Gap đã ghi |
| F-1205 | Migrate db_log → `audit.audit_log` (actor legacy), nhãn PDF cũ → `attachment` + `label_print`, tài liệu → Documentation | AS | Data | P1 | F-1201, F-0305, F-0307 | INV-19, INV-123, INV-125 | | |
| F-1206 | Tính lại KPI bằng view, so với KPI AppSheet (Data Migration + warehouse), báo cáo đối chiếu phân loại 5 nhóm theo Rollout Plan | AS | Data | P0 | F-1204, F-1101, F-0007 | Rollout Plan §1.4; `overview.md` §11.3 | | 100 % khác biệt được phân loại |
| F-1207 | Đồng bộ lại tăng dần tới ngày cutover (chạy lại transform theo `legacy_row_id`, không trùng) + kịch bản import lần cuối | AS | Data | P0 | F-1204 | `overview.md` §11.5 | | Chạy 2 lần liên tiếp không đổi dữ liệu |

## E13 · Cutover & vận hành (W4)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1301 | Chạy song song trên staging theo "Historical Comparison Method": user nhập mẫu lịch sử + batch đang chạy trên app mới, so với AppSheet, defect log 5 nhóm, acceptance ≥ 95 % / lineage 100 % / 0 defect mở | AS | Doc / Data | P0 | F-1206, F-0626 | Rollout Plan §1.3, §1.8 | D1 quyết định lịch | Sign-off từng giai đoạn |
| F-1302 | Đào tạo + tài liệu người dùng trong app (web + PWA), checklist thiết bị thật (D8) | AS+ | Doc | P0 | F-0409 | Rollout Plan Stage 0; `mobile.md` §11 | | 100 % user được đào tạo, ≥ 95 % tự làm |
| F-1303 | Runbook cutover: khoá AppSheet chỉ đọc, import lần cuối (F-1207), tắt cron ETL + Metabase + link public, đổi secret cũ, thông báo | AS | Infra / Doc | P0 | F-1207, F-0107 | `overview.md` §11.5; INV-130, INV-133, INV-137 | | Diễn tập trên staging trước |
| F-1304 | Production hardening: TLS, backup đã test restore, giám sát, SystemSettings (kiểm tra đêm, thông báo, file tạm, máy in, export theo lịch, nhật ký) | New | Infra / Web | P0 | F-0104, F-0105, F-0106 | board SystemSettings | | |
| F-1305 | Hypercare + rollback plan: kiểm tra hằng ngày (DQ, mạng, lineage, KPI), metric go-live (same-day entry ≥ 95 %, required fields ≥ 99 %), tiêu chí bàn giao | AS | Doc | P0 | F-1303 | Rollout Plan Stage 6 | | Bàn giao vận hành thường |

## E14 · Project Management (W5)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1401 | Model PM: `project`, `project_member`, `task` (kind, batch_id, form_code, target_qty, auto_complete, review, deadline_days, ƒ deadline_date), `task_assignee`, `message`, `message_recipient`, `report`; RLS privacy | AS+ | DB | P1 | F-0601, F-0204 | INV-20…23; blueprint tab PM | Thay chuỗi tên " & " | |
| F-1402 | Dự án: API CRUD + `POST /projects/{id}/transition` (Pending / Continue cascade, Complete khi progress = 1, Cancel, Reopen; chỉ người tạo); web Projects (Của tôi / Cả team, lịch), ProjectDetail, ProjectCreate (gắn dòng / batch) | AS | API / Web | P1 | F-1401 | INV-92, INV-115; board Projects, ProjectDetail, ProjectCreate | progress NULL khi 0 task | |
| F-1403 | Task thường: API + `POST /tasks/{id}/transition` (Assigned → In progress → Under review → Completed / Requires amendment; Pending; Cancelled cần lý do; Complete / Approved chỉ người giao hoặc `task.complete`), chỉ báo Due in / Due today / Late / Early / On time; web TaskCreate, TaskDetail; `/work` kanban đầy đủ | AS | API / Web | P1 | F-1401, F-1003 | INV-91, INV-93, INV-116; board TaskCreate, TaskDetail, MyTasks | Sửa tài liệu "Cancelled → Assigned" | 409 `invalid_transition` kèm `allowed[]` |
| F-1404 | Task nhập liệu (`kind = data`): form + batch + mục tiêu, giao chỉ cho người có quyền form (409 `assignee_lacks_permission`), `done_qty` đếm từ bản ghi, tự Completed hoặc Under review (D5), huỷ khi batch chốt; mobile MTaskData / MTaskDataDone (deep link mở form) | New | API / Web / Mob | P1 | F-1403, F-1002 | board TaskCreate, MTaskData, MTaskDataDone, TaskCoverage | Nối PM ⇄ Breeding | Lưu ổ cuối → task Completed, người giao được báo |
| F-1405 | Tin nhắn: `GET / POST /tasks/{id}/messages` (và project), type Normal / Status / Next step, recipients, `POST /messages/{id}/read`, sửa / xoá khi chưa ai đọc; Inbox hiển thị tin + thông báo; task hiện Status / Next step mới nhất | AS | API / Web / Mob | P1 | F-1401, F-0308 | INV-94, INV-117; board Inbox, MInbox, TaskDetail | | |
| F-1406 | Mobile task: MTaskDetail (trạng thái chạm, bước tick, trao đổi kèm ảnh), MTaskStatus (sheet đổi trạng thái theo luật) | AS | Mob | P1 | F-1403, F-1405 | board MTaskDetail, MTaskStatus | | |
| F-1407 | File & Drive: attachment owner project / task / message, upload hoặc URL (một trong hai), privacy, xoá bởi người liên quan; trang Drive (mọi file + link) | AS+ | Web / API | P1 | F-0307, F-1401 | INV-95; board Drive | | |
| F-1408 | PM dashboard + report: `GET /analytics/pm` (bộ lọc type / ngày / PIC / status → 21 metric: status, priority, Early / On time / Late, Long due / Due soon / Due today / Late), PMDashboard; report theo kỳ (Year / Quarter / Month / Week + số kỳ → ngày; job PDF; Manager tạo cho mọi người), PMReports | AS | Web / API | P1 | F-1401, F-0306 | INV-96, INV-97, INV-121; board PMDashboard, PMReports | Thay `dashboard_filter`, bot report | Công thức ngày kỳ khớp AppSheet |
| F-1409 | Quyền PM: `project.view` (mem / all), `project.view_confidential`, `task.update_own`, `task.complete / return`, RLS Confidential (Public, hoặc member / assignee / sender / recipient / creator, hoặc quyền all) | AS+ | DB / API | P1 | F-1401, F-0204 | INV-86, INV-87 | 404 thay 403 cho Confidential | Manager thấy mọi dự án |
| F-1410 | Migrate PM qua AppSheet API: projects, tasks, chat (recipients_read → read_at), files (URL / file), pm_reports; chuỗi tên → `app_user`; `dashboard_filter` bỏ | AS | Data | P2 | F-1201, F-1401 | INV-20…23, UNK-04 | PM không có trong warehouse | Mọi task cũ có assignee đúng |

## E15 · Selective Breeding (W6)

| ID | Feature | Nguồn gốc | Nền | Ưu tiên | Phụ thuộc | Nguồn | Phạm vi | Xong khi |
|---|---|---|---|---|---|---|---|---|
| F-1501 | Chốt logic SB: data dictionary + ERD đã sửa lỗi (26 lỗi xác minh: PK chép nhầm, 2 cột pupae_biomass, kiểu sai, dry_fcr dùng wet feed, selection_index tham chiếu cột không có, G vs F, thiếu diet / line / crate, fly_allocation 1–1), KPI theo scheme (hatching theo ổ / theo khối lượng, fertility rate, pupation có / không larvae, mating = effective clutch / số cái với ≥ 8 biến thể trong Excel, effective clutch 300 / 600 / 600–1.800 / 15 mg, emergence 200 / 300), quy tắc chọn lọc (index 2 hay 3 thành phần), phạm vi MSC / BK | SB | Doc | P1 | F-0002 | INV-30…33; blueprint "Selective Breeding"; Sampling Assessment SB; D2, DN-5 | | Executive ký; ADR |
| F-1502 | Tham chiếu SB: `scheme` (MSA / MSB / MSC), `line` (SEL / CTR / BK), container crate (`CR`), generation `G` prefix, protocol SB (500 con / crate, max 4.000 / nhóm, top 25 %, trọng số index 0,3 / −0,45 / −0,25, 4 / 6 crate, 3 control; ổ: 7:00 & 15:30, ≤ 50 ổ / lồng / ngày) | SB | DB / API / Web | P1 | F-0501, F-1501 | Sampling SB; blueprint | Màn Master data dùng chung | |
| F-1503 | Ổ trứng SB: form `sb_clutch` (type Sampling / Incubated / Preserved / None, position In / Out, preserved_on), `sb_clutch_sampling` (cân mẫu → KL 1 trứng, quy đổi số trứng), `sb_hatch` (ổ Incubated → ngày nở, KL neonate, hatching từng ổ); web SBCage / SBCageSampling / SBCageHatch; mobile MSBClutch; effective clutch, mating rate SB | SB | API / Web / Mob | P1 | F-1502, F-0605 | INV-31, INV-122 (`sb_breeding_import_form.csv`); board SBCage*, MSBClutch | Dùng `egg_clutch` chung | Import template SB chạy được |
| F-1504 | Batch SB nursery / larvae / pupae với scheme + line; gộp nhiều neonate batch vào crate qua `batch_transfer` (MSA `neonate_refs`); `larva_weight` (pre / post sieving, từng con), `drying_record` (DL / FL); quan sát dùng form MB | SB | API / Web | P1 | F-1502, F-0618 | INV-32; blueprint data model | | |
| F-1505 | Phenotyping (SBPhenotype): import file cân Ohaus (500 con / crate) → histogram, mean / SD / CV, ngưỡng top 25 % (`PERCENTILE 0,75`); import post-sieving để kiểm tra | SB | Web / API | P1 | F-1504, F-0901 | board SBPhenotype; `overview.md` §1.2 (không nối cân trực tiếp) | Template import mới | |
| F-1506 | Chọn lọc (SBSelection): `POST /selection-runs` (MSB index = 0,3·z(survival) − 0,45·z(DryFCR) − 0,25·z(ngày thu); 3 control ngẫu nhiên trước, 4 / 6 select cao nhất), `selection_result` (z-score, rank, selected), xác nhận → tạo pupae batch | SB | API / Web | P1 | F-1504 | board SBSelection; blueprint | | Một thế hệ MSB chạy hết vòng |
| F-1507 | Phân bổ ruồi (SBAllocation): `GET / PUT /generations/{id}/allocation` (MSA số đực / cái; MSB / MSC số nhộng) → lồng breeding thế hệ kế, `batch_transfer` | SB | API / Web | P1 | F-1506 | board SBAllocation | | |
| F-1508 | SBOverview + SB trong dashboard / analytics: 3 scheme, thế hệ hiện tại, lồng / crate đang chạy, phản ứng chọn lọc Select vs Control qua thế hệ; `v_cage_contribution` cho yêu cầu KPI-1 (đóng góp ổ trứng → thế hệ kế) | SB / New | Web / API | P2 | F-1101, F-1503 | board SBOverview; Feedback KPI1 | | |
| F-1509 | Migrate lịch sử SB từ Excel (MSA G0–G3, MSB G0–G4, MSC G1–G3) vào model chung | SB | Data | P2 | F-1503, F-1504, F-1201 | INV-164, INV-170 | 6 file trong Planning/SB không đọc được, dùng bản System Review | Source Gap ghi rõ |

---

## Kiểm tra phủ so với phạm vi đã kiểm chứng

| Nguồn phạm vi | Phủ bởi |
|---|---|
| 30 bảng MB nêu tên (INV-10…19) | A.1 của traceability → F-05xx, F-06xx, F-09xx, F-12xx |
| 11 bảng PM (INV-20…24) | F-14xx |
| 22 bảng ERD SB (INV-30…33) | F-15xx |
| 101 view MB / 69 view PM (theo nhóm INV-100…107) | B.1, B.2 của traceability |
| Action / bot (INV-110…118) | C của traceability |
| 14 lỗi AppSheet cần sửa (`overview.md` §9) | I của traceability |
| 346 board wireframe (≈ 150 màn thật) | B.1–B.3; board tài liệu → F-040x |
| Top 10 Priority Improvements của Data System & Operation Review (05/08/2026) | #1 (P0) chuẩn ID & lineage Record_ID / Parent_Record_ID → F-0003, F-0601, F-0623; #2 (P0) một nguồn sự thật, backup + restore test → F-0102, F-0105, F-1303; #3 (P0) một bộ luật KPI (survival, hatching, pupation, mating, fertility, body mass, FCR) → F-0002, F-1101, F-1501; #4 (P0) data dictionary + controlled list + data check → F-0001, F-0006, F-0506, F-0701; #5 (P1) nhập số tại nguồn, form giấy có ID / scan → F-0404…F-0407, F-0307; #6 (P0) hand-off record (outgoing / incoming ID, quantity, biomass, date, sender, receiver, match status) → `batch_transfer` F-0601, F-0618, F-0620, F-0701; #7 (P1) DQ tự động → F-07xx, F-0901; #8 (P0) RACI, RBAC, maker / checker, change log → F-0203…F-0207, F-0305, F-0622 (maker / checker: xem DN-16); #9 (P1) cấu trúc bảng chung, Excel chỉ là input / view → F-0601, F-1104; #10 (P1) tự động gộp và báo cáo, dashboard → F-1101…F-1104, F-1408 |
| Rollout Plan (giai đoạn, acceptance, 5 nhóm) | F-0007, F-1206, F-1301, F-1305 |
