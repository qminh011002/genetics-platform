# PLAN-001 · 2 · Legacy-to-target traceability matrix

> Mỗi thành phần AppSheet (bảng, view, action, bot, công thức, luật, file, hạ tầng) được nối tới **thành phần đích** trong kiến trúc mới và tới **feature** trong `03-feature-backlog.md`.
> Cột **Xử lý**: `Keep` giữ nguyên luật · `Transform` giữ luật, đổi hình thức · `Replace` thay cơ chế khác · `Drop` bỏ · `Fix` giữ nhưng sửa lỗi đã xác nhận · `New` không có trong AppSheet (chỉ có ở wireframe / khuyến nghị).
> Mã `INV-xx` trỏ về `01-inventory.md`. Mã `F-xxxx` trỏ về backlog. Mã `D1…D8`, `DN-x` là quyết định ở `06-risks-unknowns-decisions.md`.

## A. Bảng dữ liệu

### A.1 Maintenance Breeding

| INV | Bảng AppSheet | Bảng đích (schema `core` trừ khi ghi khác) | Xử lý | Ghi chú chuyển đổi | Feature |
|---|---|---|---|---|---|
| INV-10 | `strains` | `strain` (code, name, program) | Transform | `strain_image` → `attachment` | F-0501, F-1202 |
| INV-10 | `generations` | `generation` (strain_id, scheme_id, generation_no, code) | Transform | `generation_no` số; mã chỉ hiển thị; luật "chỉ thêm từ thế hệ mới nhất" giữ | F-0501, F-0502 |
| INV-10 | `cages`, `rooms` | `container` (type = cage / room / crate, code `BC`/`MC`/`CR` 2 chữ số, room_id, capacity, image) | Transform + Fix | Chuẩn hoá padding (`MC1` → `MC01`) khi migrate | F-0501, F-1202 |
| — | (không có) | `diet` | New | Khuyến nghị review; `larvae_growing.diet_ref` text tự do → FK | F-0501, F-0505 |
| — | (không có) | `protocol`, `protocol_version` (params jsonb) | New | Tham số SOP, khoảng hợp lệ, lịch việc | F-0501, F-0506 |
| — | (không có) | `kpi_definition` | New | Mỗi KPI có code, unit, formula, version | F-0002, F-0507 |
| — | (không có) | `form_def` | New | Danh mục form dùng chung quyền, task, lịch | F-0501 |
| INV-14 | `egg_production` | `batch` (program = maintenance, stage = egg) + `breeding_setup` (population_size) | Transform | `pupae_growing_ref` → `batch_transfer`; `label_*` → `label_print`; `emerge_sexing_count` → đếm `individual`; KPI → `analytics.v_egg_kpi` | F-0601, F-0602, F-1203 |
| INV-14 | `egg_collection` | `egg_collection` (batch_id, room_id, collected_on, seq, egg_mass_mg) | Transform | mã hiển thị bỏ; khoá `(batch_id, collected_on, seq)` | F-0606, F-1204 |
| INV-14 | `egg_weighing` | `egg_clutch` (type = sampling; clutch_mass_mg, clutch_count, ƒ indv_mass_mg) | Transform | Cùng bảng với ổ trứng SB (type incubated / preserved / none, position in / out) | F-0607, F-1204 |
| INV-15 | `emerge_sexing` | `individual` (code `…_BB.n`, body_mass_mg, emergence_date, sex, status pending / emerged / dead / lost) | Transform + Fix | Dòng rỗng → `status = pending`; KPI chỉ đếm cá thể đã nở | F-0608, F-1204 |
| INV-16 | `neonate_harvesting` | `batch` (stage = neonate) + `batch_transfer` (từ egg) | Transform + Fix | Generation từ FK, không `MID()`; copy `total_egg_mass` thành view `v_parent_egg_sum` | F-0601, F-0617, F-1203 |
| INV-16 | `neonate_harvest` | `neonate_harvest` (harvested_at tstz, seq, neonate_mass_mg) | Transform | `harvest_date + harvest_time` → `harvested_at`; xử lý "SA/CH" khi parse | F-0609, F-1204 |
| INV-16 | `neonate_weighing` | `sample_weighing` (weighed_on, replicate_no, sample_mass_mg, sample_count, ƒ indv_mass_mg) | Transform + Fix | Data Migration ghi Egg ID → map sang neonate batch | F-0610, F-1204 |
| INV-17 | `larvae_growing` | `batch` (stage = larvae) + `rearing_condition` (diet_id, stock_density, feed_moisture, total_wet_feed_kg) + `batch_transfer` (từ neonate) | Transform | `diet_ref` text → `diet` | F-0601, F-0611, F-0618 |
| INV-17 | `larvae_observation` | `larvae_observation` (+ `replicate_no`) | Transform | Excel có Replication No.; AppSheet không | F-0612, F-1204 |
| INV-17 | `nursery` | `batch` (stage = nursery) + `rearing_condition` + `batch_transfer` | Transform | nursery không cage (`TME_F4`) → container NULL | F-0601, F-0618 |
| INV-17 | `nursery_observation` | `nursery_observation` (+ replicate_no; sample_mass_g, sample_weight_g, baby_quantity, sample_1..3_mg) | Transform | KPI → view | F-0613 |
| INV-17 | `pupae_growing` | `batch` (stage = pupae) + `rearing_condition` + `batch_transfer` (gộp nhiều nursery cage) | Transform + Fix | Lineage n–n thay 1 cha | F-0601, F-0619, F-0620 |
| INV-17 | `pupae_observation` | `pupae_observation` (+ replicate_no, larvae_qty, frass_weight_g) | Transform | `prepupae_mass` tính trong view | F-0614 |
| INV-11 | `users` | `app_user` + `auth.role` / `role_permission` / `user_permission` / `user_scope` | Replace | 4 cờ → quyền riêng; role enum → bảng | F-0203, F-0206, F-1205 |
| INV-12 | `master_controls`, `home` | `layouts/nav.ts` (web), `role.phone_home` (app) | Drop | Cấu hình menu nằm trong code / role | F-0402, F-0404 |
| INV-13 | `documentation` | `attachment` + trang Documentation / MDocs | Transform | Có phiên bản, lọc theo module | F-0409 |
| INV-18 | `import_wizard`, `*_import` | `import_batch` (file, rows, errors jsonb, status) | Replace | Staging → preview trong job, commit một transaction | F-0901 |
| INV-19 | `db_log` | `audit.audit_log` | Replace | Ghi cả Edit, old/new, reason; 122 dòng cũ nạp vào audit với `actor = legacy` | F-0305, F-1205 |
| INV-19 | `temp`, `scanner` | — | Drop | `/lookup?code=` thay scanner | F-0625, F-0803 |

### A.2 Project Management

| INV | Bảng AppSheet | Bảng đích | Xử lý | Ghi chú | Feature |
|---|---|---|---|---|---|
| INV-20 | `projects` | `project` (code, name, objective, status, priority, privacy, start/end_date, created_by) + `project_member` | Transform + Fix | `pic` chuỗi " & " → `project_member`; `completed_tasks`, `progress_pct`, `latest_message` → query (NULL khi chưa có task) | F-1401, F-1402, F-1410 |
| INV-20 | `tasks` | `task` (+ kind general / data, batch_id, form_code, target_qty, auto_complete, review) + `task_assignee` | Transform + New | `deadline_date` generated; `indicator` / `temp_indicator` tính trong query; `status_message`… → query message mới nhất | F-1401, F-1403, F-1404 |
| INV-20 | `chat` | `message` (project_id, task_id, type, body, privacy, sender_id, edited_at) + `message_recipient` (read_at) | Transform | `recipients_read` → `read_at`; `read_status`, `page`, `message_label` → query | F-1405 |
| INV-21 | `files` | `attachment` (owner_table ∈ project / task / message, file hoặc URL, privacy) | Transform | Dùng chung với nhãn, ảnh | F-0307, F-1407 |
| INV-22 | `dashboard_filter` | tham số `GET /analytics/pm?type=&from=&to=&pic=&status=` | Drop | 21 metric tính trong query | F-1408 |
| INV-23 | `pm_reports` | `report` (user_id, period_type, period_no, year, start/end_date, file_url) + job `generate_report` | Transform | Công thức ngày kỳ giữ nguyên (Year / Quarter / Month / Week) | F-1408 |
| INV-24 | `home.pm_description` | `GET /notifications?unread=true` | Replace | Đếm thông báo chưa đọc | F-0308 |

### A.3 Selective Breeding (ERD → model chung, chờ D2 và F-1501)

| INV | Bảng ERD | Bảng đích | Xử lý | Feature |
|---|---|---|---|---|
| INV-30 | `strain`, `generation`, `cage`, `room`, `line`, `crate`, `scheme` | `strain` (program = selective), `generation` (scheme_id, G-prefix), `container` (type = crate), `line`, `scheme` | Transform | F-1502 |
| INV-31 | `breeding` (egg batch cage-ngày) | `batch` (stage = egg, scheme, line) + `breeding_setup` (male / female allocated) | Transform | F-1503 |
| INV-31 | `egg_clutch` | `egg_clutch` (type sampling / incubated / preserved / none, position in / out, preserved_on, hatched) | Transform | F-1503 |
| INV-31 | `neonate`, `neonate_clutch` | `batch` (stage = neonate) + `batch_transfer` (gộp nhiều egg batch, MSA `neonate_refs` list) + `sample_weighing` | Transform | F-1504 |
| INV-32 | `nursery`, `nursery_sampling` | `batch` (stage = nursery) + `nursery_observation` | Transform | F-1504 |
| INV-32 | `larvae` (crate SEL / CTR / BK), `phenotyping_*`, `sieving_data`, `drying_record` | `batch` (stage = larvae, line) + `larva_weight` (pre / post sieving, fl_mass_mg) + `drying_record` + `larvae_observation` | Transform | F-1504, F-1505 |
| INV-33 | `pupae`, `pupae_sampling`, `emerge_sexing` | `batch` (stage = pupae) + `pupae_observation` (+ larvae_qty) + `individual` | Transform | F-1504 |
| INV-33 | `fly_allocation`, `total_allocation`, selection (threshold top 25 %, MSB index) | `selection_run`, `selection_result`, `batch_transfer` (allocation) | Transform | F-1506, F-1507 |

## B. View AppSheet → màn hình đích

Cột **Board** là tên board trên canvas wireframe (nhãn nguồn gốc trong ngoặc: `[AS]` có sẵn AppSheet, `[AS+]` AppSheet + mở rộng, `[New]` mới, `[SB]` Selective).

### B.1 Maintenance Breeding

| INV | View AppSheet | Board wireframe | Route / màn đích | Feature |
|---|---|---|---|---|
| INV-100 | Home (dashboard) | Home `[AS+]` (bản cũ tham khảo), HomeExec / HomeManager / HomeAdmin `[New]`, MHome / MHomeExec `[AS+]` | `/home`, mobile `/` | F-1105, F-0404 |
| INV-100 | Master Data menu; Strain / Generation / Cage / Room Deck + Detail | Strains, StrainDetail, StrainsManager, Generation, AddGeneration, Master, MasterContainers, ContainerDetail `[AS/AS+]`; MasterDiets, Protocol, ProtocolVersion, KpiDefs `[New/AS+]` | `/strains`, `/generations/$id`, `/master?tab=` | F-0503…F-0507 |
| INV-100 | Egg production Deck | EggList `[AS]`, MEggList `[AS]` | `/batches?stage=egg`, mobile `/batches` | F-0603 |
| INV-102 | egg_production_Detail | EggDetail (tab Thu trứng) `[AS]`, EggWeigh `[AS]`, EggSexing `[AS]`, EggLineage, EggHistory `[AS+]`, EggApproved `[AS+]`; MEggDetail `[AS]` | `/batches/$id?tab=` | F-0604, F-0606…F-0608, F-0623, F-0624 |
| INV-101 | Add: Egg production | EggCreate `[AS+]` | dialog | F-0602 |
| INV-101 | Add: Egg collection (Browser / Device) | EggDetail inline form; MEggCollect `[AS]` | `POST …/measurements/egg_collection` | F-0606 |
| INV-101 | Add: Egg weighing | EggWeigh; MEggWeigh `[AS]` | `…/egg_weighing` | F-0607 |
| INV-101 | Add: Emerge & Sexing; New rows | EggSexing (CupMap 300), SexingRows `[AS]`; MSexing `[AS]` | `…/sexing`, `POST /batches/{id}/individuals/prepare` | F-0608 |
| INV-111 | Create label / Label | Labels `[AS+]` | `/labels`, `POST /batches/{id}/labels` | F-0801, F-0802 |
| INV-111 | End date (Egg) | CloseStage `[AS+]`, EggApproved | `POST /batches/{id}/close` | F-0617 |
| INV-100 | Neonate harvesting Deck + Detail | NeonateDetail `[AS+]`, NeonateWeigh `[AS]`, NeonateLineage, NeonateHistory, RecordEditNeonate; MNeonateDetail `[AS+]` | `/batches?stage=neonate`, `/batches/$id` | F-0603, F-0604, F-0609, F-0610 |
| INV-101 | Add: Neonate harvest / weighing | MNeonateHarvest `[AS]` (khung giờ 07 · 10 · 13 · 15), MNeonateWeigh `[AS]` | `…/neonate_harvest`, `…/neonate_weighing` | F-0609, F-0610 |
| INV-111 | End date (Neonate), Add: Larvae growing, Add: Nursery | NextBranch `[AS]` | `POST /batches/{id}/close` với `branch` | F-0618 |
| INV-100 | Larvae growing Deck + Detail | LarvaeDetail `[AS+]`, LarvaeFeed `[New]`, LarvaeHarvest `[AS+]`, LarvaeLineage, LarvaeHistory, RecordEditLarvae; MLarvaeDetail `[AS+]`, MLarvaeObs `[AS+]` | `/batches?stage=larvae` | F-0612, F-0615, F-0616, F-0619 |
| INV-100 | Nursery & Pupae growing Deck; nursery_Detail / nursery_pupae_details / pupae_growing_Detail | NurseryDetail, NurseryFeed `[New]`, NurseryLineage, NurseryHistory, PupaeDetail, PupaeHarvest `[New]`, PupaeLineage, PupaeHistory; MNurseryObs, MPupaeSample `[AS+]` | `/batches?stage=nursery` hoặc `pupae` | F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 |
| INV-111 | Set population / Set experimental conditions | Conditions `[AS+]` (+ ô population ở EggCreate) | `PUT /batches/{id}/setup`, `PUT /batches/{id}/conditions` | F-0611 |
| INV-111 | End date (Pupae) | PupaeToEgg `[AS+]` (chia nhộng nhiều lồng) | `POST /batches/{id}/close` với danh sách lồng + lượng | F-0620 |
| INV-112 | Delete / sửa bản ghi con | DeleteConfirm `[AS+]`, MDeleteSheet `[AS+]`; RecordEdit, RecordEditNeonate, RecordEditLarvae, RecordEditPupae, EggEditRecord, MRecordEdit `[AS+]` | `PATCH / DELETE /measurements/{form}/{id}` | F-0622 |
| INV-103 | Import wizard (Home / Linked), Import: <db> | Import1 `[AS]`, Import2, Import3 `[AS+]`, ImportHistory, ImportUndo `[New]` | `/import`, `/import/history` | F-0901…F-0904 |
| INV-113 | QR Scan / Search | MScan `[AS]`, MScanResult `[AS+]`, Search `[New]`, MSearch `[New]` | `/scan` (mobile), Ctrl K | F-0803, F-0625 |
| INV-113 | Dashboards: Home / Egg / Neonate / Larvae / Nursery & Pupae (link Metabase) | BreedDashboard `[AS+]`, Analytics `[New]`, Reports `[AS+]` | `/dashboard`, `/analytics`, `/reports` | F-1102, F-1103, F-1104 |
| INV-100 | Users Deck | Users `[AS+]`, UserInvite `[New]`, RolePerms `[AS+]`, Roles | `/admin/users`, `/admin/roles` | F-0206, F-0207 |
| INV-100 | Documentation Deck | Documentation `[AS+]`, MDocs `[AS+]` | `/docs`, mobile Tôi → Tài liệu | F-0409 |
| — | (không có) | DQ `[New]` | `/quality` | F-0704 |
| — | (không có) | History `[AS+]` (db_log mở rộng), Lineage `[AS+]`, ReopenBatch `[New]` | `/history`, `/lineage`, dialog | F-0624, F-0623, F-0621 |
| — | (không có) | RoutineSchedule `[New]`, MyTasks `[AS+]`, TaskCoverage `[Doc]` | `/work`, `/work/routine` | F-1003, F-1004 |
| — | (không có) | Login `[AS+]`, NoAccess `[New]`, WorkerDesktop `[New]`, Settings `[New]`, MLogin, MProfile, MSync, MInbox, MTabBar | `/login`, `/worker`, `/settings`, mobile tabs | F-0201, F-0208, F-0402, F-0404, F-0406, F-0308 |
| — | (không có) | SystemSettings `[New]` | `/admin/settings` | F-1304 |

### B.2 Project Management

| INV | View AppSheet | Board wireframe | Route đích | Feature |
|---|---|---|---|---|
| INV-105 | Home (PM) | HomeExec / HomeManager (khối dự án) | `/home` | F-1105 |
| INV-105 | Projects (Personal / Public, WIP / Completed / Cancelled, calendar) | Projects `[AS]`, ProjectDetail `[AS]`, ProjectCreate `[AS+]` | `/projects`, `/projects/$id` | F-1402 |
| INV-105 | Tasks (Personal / Public, calendar) | MyTasks `[AS+]` (Kanban), TaskDetail `[AS]`, TaskCreate `[AS]`; MTaskDetail `[AS]`, MTaskStatus `[AS]`, MTaskData / MTaskDataDone `[AS+]` | `/work`, `/tasks/$id`, mobile `/tasks/[id]` | F-1403, F-1404, F-1406 |
| INV-105 | Notifications | Inbox `[AS+]`, MInbox `[AS+]` | `/inbox` | F-0308, F-1405 |
| INV-105 | Drive | Drive `[AS+]` | `/drive` | F-1407 |
| INV-105 | Dashboard (dashboard_filter) | PMDashboard `[AS]` | `/pm/dashboard` | F-1408 |
| INV-105 | Reports | PMReports `[AS]` | `/pm/reports` | F-1408 |
| INV-105 | Users, Documentation | (dùng chung MB) | — | F-0206, F-0409 |

### B.3 Selective Breeding (chỉ wireframe)

| Board | Route | Feature |
|---|---|---|
| SBOverview `[SB]` | `/selective` | F-1508 |
| SBCage, SBCageSampling, SBCageHatch `[SB]`; MSBClutch `[SB]` | `/selective/cages/$batchId`, mobile `…/sb_clutch` | F-1503 |
| SBPhenotype `[SB]` | `/selective/phenotype` | F-1505 |
| SBSelection `[SB]` | `/selective/selection` | F-1506 |
| SBAllocation `[SB]` | `/selective/allocation` | F-1507 |

### B.4 Board tài liệu / component (không phải màn riêng)

Layout, Hierarchy, Lifecycle, States, Foundations, UIStates, BatchHead, BatchLineage, BatchHistory, AppSidebar, Main, Parity, Roles, RoleWorker / RoleExec / RoleManager / RoleAdmin, RoleSheet, Pairs (P01–P26), Origin, TaskFlow, TaskCoverage → đầu vào cho F-0401, F-0403, F-0402, F-0407; không sinh feature riêng. Các board bọc `All*`, `R?_*`, `PairP*` bỏ qua.

## C. Action / automation → use case, endpoint, job

| INV | AppSheet | Đích | Xử lý | Feature |
|---|---|---|---|---|
| INV-110 | generations "Add" chỉ ở thế hệ mới nhất | `POST /generations` → 409 `generation_not_latest` | Keep | F-0502 |
| INV-55 | Set population | `PUT /batches/{id}/setup` | Keep | F-0611 |
| INV-55 | Set experimental conditions (3 cột = 0 và chưa end) | `PUT /batches/{id}/conditions` (4 trường: diet, density, wet feed, moisture); sửa sau khi có quan sát cần lý do | Keep + New | F-0611 |
| INV-50…54 | Show_If form con | `gates.can_add(form)` → `batch.can.add[]` | Keep | F-0605 |
| INV-50 | End date Egg (3 bước) | `CloseStage` use case: close + tạo neonate F+1 + transfer + label request + huỷ routine + sinh routine | Transform + Fix (transaction) | F-0617 |
| INV-51 | End date Neonate; Add: Larvae / Nursery | `CloseStage` với `branch ⊆ {larvae, nursery}` + chia lượng | Transform | F-0618 |
| INV-52 | End date Larvae | `CloseStage` đóng nhánh | Keep | F-0619 |
| INV-53 | End date Nursery → Pupae | `CloseStage` tạo pupae (gate nursery: điều kiện đã đặt; không bắt buộc observation — giữ như AppSheet, xem DN-3) | Transform | F-0619 |
| INV-54 | End date Pupae → Egg | `CloseStage` tạo 1..n batch Egg thế hệ kế theo lồng + transfer | Transform | F-0620 |
| INV-56 | Delete cha khi không còn con | FK `ON DELETE RESTRICT` + 409 `has_children` | Keep | F-0601 |
| INV-57 | Delete con 6 bước | `DELETE /measurements/…` xoá mềm, KPI từ view | Replace | F-0622 |
| INV-58 | New rows (loop) | `POST /batches/{id}/individuals/prepare` (N cá thể pending) | Transform | F-0608 |
| INV-59, INV-114 | Create label + bot label (egg / neonate / sexing) | `POST /batches/{id}/labels` → job `render_labels` (WeasyPrint + segno) | Replace | F-0801 |
| INV-113 | QR Scan → scanner → bot Scan row clear | `GET /lookup?code=` + MScan | Replace | F-0803 |
| INV-113 | Import wizard: Upload CSV, validation IFS, Import 6 bước, Clear, Reset | `POST /imports` → job parse / validate → preview → `POST /imports/{id}/commit` (1 transaction) → `undo` 24 h | Replace | F-0901…F-0903 |
| INV-111 | Import data (linked) | Import1 mở sẵn batch đích | Keep | F-0904 |
| INV-111 | Dashboards: <module> (link Metabase) | `/dashboard?stage=` | Replace | F-1102 |
| INV-111 | Details: Strain / Generation / Cage / … | link trong `BatchHead`, `BatchCode` | Keep | F-0403 |
| INV-115 | Project Pending / Continue (cascade) / Complete (progress = 1) / Cancelled / Reopen; chỉ người tạo | `POST /projects/{id}/transition` + luật `invalid_transition` | Keep | F-1402 |
| INV-116 | Task Complete (review = false) / Review / Approved (Manager hoặc người tạo) / Pending / Continue / Cancelled / Reopen / Delete (Assigned hoặc Cancelled, người tạo) | `POST /tasks/{id}/transition` | Keep (sửa "Cancelled → Assigned" theo user guide: Cancelled thật) | F-1403 |
| INV-116 | Add: PIC | `project_member`, `task_assignee` CRUD; data task chỉ giao người có quyền form (409 `assignee_lacks_permission`) | Transform + New | F-1402, F-1404 |
| INV-117 | Chat Edit / Delete khi chưa ai đọc; Reply; Read receipt | `PATCH / DELETE /messages/{id}` kiểm `message_recipient.read_at`; `POST /messages/{id}/read` | Keep | F-1405 |
| INV-117 | Files Add / Delete / Open | `/attachments` với quyền theo owner | Keep | F-1407 |
| INV-117, INV-118 | Report Add / Refresh / Open; bot Create report | `POST /reports` → job `generate_report` (PDF) | Transform (docx → PDF) | F-1408 |
| INV-117 | dashboard_filter Type / dates / PIC / Status | query params | Replace | F-1408 |

## D. Công thức → nơi tính ở hệ mới

| INV | Công thức AppSheet | Đích | Xử lý | Feature |
|---|---|---|---|---|
| INV-40…46 | Sinh mã generation / container / batch / individual / seq | `breeding/domain/codes.py` + `UNIQUE`; `seq` cấp trong transaction | Fix | F-0003, F-0601 |
| INV-47 | QR URL quickchart | segno trên server, nội dung QR = mã | Replace | F-0801 |
| INV-60 | female_ratio | `kpi_definition.female_ratio` = female / (female + male), bỏ pending; view `v_egg_kpi` | Fix (D7) | F-0002, F-1101 |
| INV-61 | emergence_rate | có `emergence_date` / population_size | Fix (D7) | F-0002, F-1101 |
| INV-62 | total / avg / std clutch & indv egg | view (STDEVP → `stddev_pop`) | Keep | F-1101 |
| INV-63 | mating_rate | giữ công thức MB; SB có code riêng `mating_rate_sb` | Keep | F-0002 |
| INV-64 | hatching_rate | theo ERD / Excel (nghịch đảo tài liệu) | Fix (D7, cần xác nhận trên app) | F-0005, F-0002 |
| INV-66, INV-67 | indv_mass, frass_weight, avg_larvae_mass | generated column (`indv_mass_mg`, `frass_weight_kg`) + view | Keep | F-0601, F-1101 |
| INV-67, INV-68 | larvae survival, wet / dry FCR, duration | view `v_larvae_kpi` | Keep | F-1101 |
| INV-69 | avg_baby_mass ×1000, baby_harvested, baby_biomass, survival | view `v_nursery_kpi`; đơn vị chốt ở data dictionary | Fix (đơn vị) | F-0001, F-1101 |
| INV-70 | total_dry_feed (kg vs g), feeding_rate | view, đơn vị trong tên cột (`total_dry_feed_kg` / `_g`) | Fix | F-0001, F-1101 |
| INV-71 | prepupae / pupae mass, pupation, pupae survival | view `v_pupae_kpi`; survival theo Excel; `pupation_rate` (MB) và `pupation_rate_incl_larvae` (SB) | Fix (D7) | F-0002, F-1101 |
| INV-72 | avg_* không trọng số | giữ (ghi rõ trong docstring); có thể thêm version có trọng số sau | Keep | F-1101 |
| INV-90, INV-91 | progress_pct, deadline_date, indicator, temp_indicator | query PM (NULL khi 0 task); `deadline_date` generated | Keep + Fix | F-1403 |
| INV-96 | start/end_date kỳ báo cáo (Week = WORKDAY + 5) | `reports/domain/periods.py` | Keep | F-1408 |
| INV-97 | 21 metric dashboard_filter | `GET /analytics/pm` | Keep (tính động) | F-1408 |
| INV-99 | Đếm thông báo chưa đọc | `/notifications` | Replace | F-0308 |

## E. Validation → lớp kiểm tra mới

| INV | Luật | Zod (form) | Pydantic (API) | CHECK (DB) | DQ | Feature |
|---|---|---|---|---|---|---|
| INV-75, INV-78 | Cha hợp lệ, strain / generation / cage khớp cha | — | ✓ | FK | rule `parent_valid` | F-0601, F-0701 |
| INV-76, INV-77, INV-79…81 | Required / Min từng cột | ✓ | ✓ | `CHECK (> 0)` | — | F-0605…F-0614 |
| INV-82 | Validation import (thiếu giá trị, body_mass > 0) | — | ✓ per row | — | toàn bộ bộ luật DQ chạy trên import | F-0901, F-0701 |
| — | Khoảng hợp lệ protocol, trùng, thứ tự ngày, 3σ, hand-off | — | — | — | New | F-0701 |

## F. Quyền và audit

| INV | AppSheet | Đích | Xử lý | Feature |
|---|---|---|---|---|
| INV-85 | users.role + 4 cờ | `auth.role` (4 bộ mặc định is_system) + `role_permission` + `user_permission` (grant / deny, hạn, lý do, batch) | Replace | F-0203 |
| INV-86 | PM kiểm `role = Manager`; MB không kiểm | Mã quyền (`project.view_confidential`, `task.complete`, `stage.close`…); cấm kiểm tên vai trò | Replace | F-0205 |
| INV-87 | privacy Public / Confidential + pic / create_by | RLS trên project / task / message / attachment: Public, hoặc `project.view_confidential`, hoặc member / assignee / sender / recipient / creator | Keep | F-1409 |
| INV-88 | db_log Add / Delete / Import | trigger audit mọi bảng core, cả Edit; `reason` bắt buộc khi sửa của người khác | Replace | F-0305 |
| INV-89 | Vai trò Rollout Plan (System Admin, Project Leader, Executive, Worker) | Worker, Executive, Manager, Admin; Project Leader gộp vào Executive (tạo lại được) | Transform | F-0203 |
| — | Browser / Device | `platform.web` / `platform.app` theo client id trong token | Replace | F-0201 |
| — | Sửa bản ghi | Của mình 24 h; người khác cần lý do; batch chốt khoá | New | F-0622 |

## G. Template và file

| INV | AppSheet | Đích | Feature |
|---|---|---|---|
| INV-120 | 3 template nhãn docx | Template Jinja2 HTML (batch label; cốc A4 3 cột) | F-0801 |
| INV-121 | Template report docx | Template Jinja2 HTML → PDF `generate_report` | F-1408 |
| INV-122 | 9 CSV template | `imports/domain/templates.py` giữ đúng cột; `GET /import-templates` | F-0901 |
| INV-123 | 35 PDF nhãn cũ | Nạp vào `attachment` + `label_print` (status completed, legacy) | F-1205 |
| INV-124 | Ảnh cage / room / strain | `attachment` owner container / strain | F-1202 |
| INV-125 | 8 PDF tài liệu | Trang Documentation (phiên bản) | F-0409 |

## H. Hạ tầng và tích hợp

| INV | Hiện tại | Đích | Feature |
|---|---|---|---|
| INV-130 | cloud_to_db.py + cron | Bỏ sau cutover; phần `fetch_table` dùng lại trong `tools/legacy_import` cho PM | F-1201, F-1410, F-1303 |
| INV-132 | Warehouse Postgres | Nguồn `legacy` MB; bỏ sau cutover | F-1201, F-1303 |
| INV-133 | Metabase + Export Hub + link public | `/dashboard`, `/analytics`, `/reports` + `POST /exports` | F-1102…F-1104 |
| INV-134 | quickchart.io | segno | F-0801 |
| INV-136 | Email @entobel.com (AppSheet) | Entra OIDC, 3 app registration | F-0201 |
| INV-137 | Secret trong OneDrive | Rotate + env / vault; user DB riêng; role analytics RO | F-0107, F-1303 |
| — | (không có) | Docker Compose, Nginx TLS, backup + restore test, CI | F-0102…F-0105 |

## I. Kiểm tra phủ

- Mọi bảng AppSheet MB (30 nêu tên) và PM (11) có dòng trong A. Bảng chưa nêu tên trong tài liệu (44 − 30; UNK-01) sẽ bổ sung khi đọc trực tiếp app AppSheet (F-0005).
- Mọi board wireframe không phải board bọc / tài liệu (≈ 150) có dòng trong B.
- Mọi dòng "Lỗi AppSheet được sửa" của `overview.md` §9 có feature: bảo mật → F-0107; hatching → F-0005 / F-0002; pupae survival → F-0002; đếm dòng rỗng → F-0608 / F-0002; transaction → F-0617…F-0620; trùng mã → F-0003 / F-0601; parse generation → F-0601; dòng dõi 1 cha → F-0623; Metabase / quickchart → F-1102 / F-0801; đơn vị → F-0001; chuỗi tên PM → F-1401; validation import → F-0901 / F-0701; padding mã → F-1202 / F-0502; tài liệu lệch app → F-0309.
