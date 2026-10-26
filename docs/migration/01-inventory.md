# PLAN-001 · 1 · Migration inventory

> Kiểm kê mọi thứ đang tồn tại trong hệ AppSheet "Genetics Data Platform" và trong thư mục handover, để biết **cái gì phải được migrate, cái gì bỏ, cái gì chưa đọc được**.
> Nguồn: thư mục handover `Genetics Data Platform/` (appsheet/, API to Postgres/, Metabase/, Planning/, Claude outputs/) và `docs/genetics-platform-wireframes/`.
> Quy ước: **[MB]** Maintenance Breeding · **[PM]** Project Management · **[SB]** Selective Breeding · **[INF]** hạ tầng / ETL · **[DOC]** tài liệu.
> Mọi mục có mã `INV-xx` để tham chiếu từ ma trận truy vết (`02-traceability-matrix.md`) và backlog (`03-feature-backlog.md`).

## 1. Ứng dụng AppSheet

| Mã | App | Version | Quy mô (theo Platform Documentation) | Trạng thái vận hành | Nguồn |
|---|---|---|---|---|---|
| INV-01 | Maintenance Breeding (MB) | app v1.000121 (5/2026); data model v1.000942 | 44 bảng · 651 cột · 101 view (tài liệu §4 chỉ liệt kê 30 bảng; ảnh chụp editor trong Ecosystem Integration.pdf còn thấy `egg_production_log`, `neonate_harvesting_log`, `import_emerge_sexing`, `scale` — xem UNK-01) | Rollout: Stage 1A / 1B sign-off 23/10/2026; go-live dự kiến **04/01/2027**; hypercare tới **05/02/2027** | MB Platform Documentation, Rollout Plan, blueprint |
| INV-02 | Project Management (PM) | v1.000626 (7/2026) | 11 bảng · 169 cột · 69 view | Đang dùng hằng ngày | PM Platform Documentation, PM User Guide |
| INV-03 | Selective Breeding (SB) | chưa có app | ERD 22 bảng · 1 template import (`sb_breeding_import_form.csv`) | Đang thiết kế; dữ liệu thực tế ghi trên Excel (MSA/MSB/MSC-Gn.xlsx) và giấy | SB ERD (drawio/pdf/jpg), System Review/Selective |

Locale cả hai app: `vi-VN`. Đăng nhập: tài khoản AppSheet gắn email `@entobel.com`.

## 2. Nguồn dữ liệu (workbook) và bảng

Mỗi "database" AppSheet là một workbook (Google Sheets / OneDrive), mỗi bảng một sheet.

### 2.1 Maintenance Breeding

| Mã | Workbook | Bảng | Loại | Update policy (AppSheet) |
|---|---|---|---|---|
| INV-10 | `master_db` (dùng chung MB + PM) | `strains`, `generations`, `cages`, `rooms` | Dimension | Adds only |
| INV-11 | `master_db` | `users` | System | Full CRUD (user_name: Update only) |
| INV-12 | `master_db` | `master_controls`, `home` | System (menu) | Read only |
| INV-13 | `master_db` | `documentation` | System | Adds & Updates only |
| INV-14 | `egg_production_db` | `egg_production` (cha), `egg_collection`, `egg_weighing` | Fact | Full CRUD |
| INV-15 | `EMERGE_SEXING` | `emerge_sexing` (12.942 dòng live; tách riêng vì lớn) | Fact | Full CRUD |
| INV-16 | `neonate_harvesting_db` | `neonate_harvesting` (cha), `neonate_harvest`, `neonate_weighing` | Fact | Full CRUD |
| INV-17 | `growing_db` | `larvae_growing`, `larvae_observation`, `nursery`, `nursery_observation`, `pupae_growing`, `pupae_observation` | Fact | Full CRUD |
| INV-18 | `IMPORT` | `import_wizard`, `egg_import`, `neonate_import`, `larvae_import`, `nursery_import`, `pupae_import` | Staging import | Full CRUD |
| INV-19 | `DB_LOG` | `db_log` (122 dòng: 56 Import · 48 Delete · 18 Add), `temp`, `scanner` | Log / cache | db_log: Adds only; temp, scanner: Full CRUD |

Cột hệ thống trên mọi fact table: `_RowNumber`, `Row ID` (UUID, PK), `create_date`, `create_by` (tên người, không phải khoá), `update`.

### 2.2 Project Management

| Mã | Workbook | Bảng | Update policy |
|---|---|---|---|
| INV-20 | `RnD_PM` | `projects`, `tasks`, `chat` | Full CRUD |
| INV-21 | `RnD_PM` | `files` | Adds & Deletes only |
| INV-22 | `RnD_PM` | `dashboard_filter` (1 dòng / user, 21 cột metric) | Updates only |
| INV-23 | `master_db` | `pm_reports` | Full CRUD (report) |
| INV-24 | `master_db` | `users`, `home` (+ `pm_description`), `documentation`, `master_controls` | Dùng chung với MB |

### 2.3 Selective Breeding (ERD, chưa có bảng thật)

| Mã | Nhóm | Bảng theo ERD |
|---|---|---|
| INV-30 | Lookup | `strain`, `generation`, `cage`, `room`, `line`, `crate`, `scheme` |
| INV-31 | Breeding (egg) | `breeding` (egg batch cage-ngày), `egg_clutch`, `neonate`, `neonate_clutch` |
| INV-32 | Nursery / larvae | `nursery`, `nursery_sampling`, `larvae` (crate SEL/CTR/BK), `phenotyping_*`, `sieving_data`, `drying_record` |
| INV-33 | Pupae / allocation | `pupae`, `pupae_sampling`, `emerge_sexing`, `fly_allocation` |

Chi tiết 22 bảng, công thức và lỗi ERD: xem `06-risks-unknowns-decisions.md` §SB và báo cáo trích xuất SB.

## 3. Luật nghiệp vụ đang chạy trong AppSheet

### 3.1 Sinh mã (label column)

| Mã | Đối tượng | Công thức AppSheet | Ví dụ | Vấn đề |
|---|---|---|---|---|
| INV-40 | `generation_id` | `strain_id & "_" & "F" & generation_no` | `TMA_F4` | SB dùng `G` nhưng ERD ghi `F` |
| INV-41 | `cage_id` · `room_id` | `"BC" & cage_no` · `"MC" & room_no` | `BC01`, `MC06` | db_log có `MC1`, `MC9`, `MC10` (không padding) |
| INV-42 | `egg_id` | `generation_id & "_" & cage_id` | `TMA_F4_BC01` | Có batch không cage (`TMA_F4`) |
| INV-43 | `neonate_id` | `strain_id & "_F" & (NUMBER(MID(egg_id,6,2))+1) & "_" & cage_id`; không có egg_ref thì `generation_id_cage_id` | `TMA_F5_BC01` | `MID(…,6,2)` giả định strain 3 ký tự |
| INV-44 | `larvae_growing_id`, `nursery_id`, `pupae_growing_id` | `= neonate_id` (pupae `= nursery_id`); nursery không cage → `generation_id` | `TMA_F4` | Pupae gộp nhiều cage thành 1 batch |
| INV-45 | Mã bản ghi con | `mã_cha & "_" & dd/mm/yyyy & "." & (COUNT cùng ngày + 1)`; egg_collection chèn thêm `room_id`; neonate_harvest dùng `dd/mm/yyyy - HH:MM` | `TMA_F4_BC01_MC10_24/06/2026.1` | Trùng khi xoá rồi thêm / nhập đồng thời; `neonate_weighing_id` đếm nhầm bảng `NEONATE_HARVEST` |
| INV-46 | `emerge_sexing.parent_id` | `egg_id & "_BB." & (COUNT + 1)` | `TMA_F0_BC01_BB.1` | Dòng rỗng tạo trước để in nhãn |
| INV-47 | QR | `https://quickchart.io/qr?size=…&text=<mã>` (egg 800, neonate 150, parent 75) | — | Dịch vụ ngoài |
| INV-48 | File nhãn | `/Files/labels/<mã>_<yy.mm.dd_HH.MM>.pdf` | `TMA_F6_BC01_26.08.03_22.40.pdf` | Mỗi lần tạo thêm 1 file (35 file đang có) |

### 3.2 Điều kiện (gate) và chuyển giai đoạn

Lấy từ mục 8 Actions của MB Platform Documentation (điều kiện `Show_If`).

| Mã | Giai đoạn | Form con mở khi | "End date" hiện khi | Sau End date (composite action) |
|---|---|---|---|---|
| INV-50 | Egg production | `population_size <> 0` và `ISBLANK(end_date)` | ≥1 `emerge_sexing`, ≥1 `egg_collection`, ≥1 `egg_weighing` | Ghi end_date → thêm `neonate_harvesting` (F+1) → ghi `db_log` Add; label bot auto |
| INV-51 | Neonate harvesting | `ISBLANK(end_date)` | có `neonate_harvest` và `neonate_weighing` | Chỉ set end_date; sau đó hiện `Add: Larvae growing` và `Add: Nursery` (mỗi loại tối đa 1) |
| INV-52 | Larvae growing | `ISBLANK(end_date)` | có `larvae_observation` | Set end_date, đóng nhánh |
| INV-53 | Nursery | `stock_density`, `feed_moisture`, `total_wet_feed <> 0` và `ISBLANK(end_date)` | `ISBLANK(end_date)` (không bắt buộc observation) | end_date → thêm `pupae_growing` → `db_log` |
| INV-54 | Pupae growing | đã "Set experimental conditions" và `ISBLANK(end_date)` | có `pupae_observation` | end_date → thêm `egg_production` thế hệ kế (giữ strain/generation/cage) → `db_log`; label bot auto |
| INV-55 | Set population / Set experimental conditions | cột đang = 0 và chưa end | — | Ghi giá trị người nhập |
| INV-56 | Xoá bản ghi cha | — | chỉ khi không còn bản ghi con | `db_log` Delete → Delete |
| INV-57 | Xoá bản ghi con (6 bước) | — | luôn | db_log → copy sang `temp` → zeroing field → trigger cha tính lại → xoá temp → xoá dòng |
| INV-58 | Emerge & Sexing: New rows | `emerge_sexing_count = 0`, `population_size <> 0`, chưa end | — | Vòng lặp tạo N dòng rỗng có QR |
| INV-59 | Create label | Browser only, chưa end | — | `label_trigger = Requested` → bot |

Mỗi action nhập liệu có 2 bản **Browser** / **Device** (`CONTEXT("Host")`). Import và Create label chỉ có ở Browser.

### 3.3 Công thức chỉ số (virtual column)

| Mã | Bảng | Chỉ số | Công thức trong app (Platform Documentation §6) | Khác với ERD / Excel |
|---|---|---|---|---|
| INV-60 | egg_production | `female_ratio` | `COUNT(sex = Female) / COUNT(Related emerge_sexings)` | ERD chia `population_size`; cả hai đếm dòng rỗng |
| INV-61 | egg_production | `emergence_rate` | `COUNT(Related emerge_sexings) / population_size` | Đếm dòng chưa có emergence_date |
| INV-62 | egg_production | `total_egg_mass`, `avg/std_egg_clutch_mass`, `avg/std_indv_egg_mass` | SUM / AVERAGE / STDEVP bảng con | STDEVP = tổng thể |
| INV-63 | egg_production | `mating_rate` | `(total_egg_mass / avg_egg_clutch_mass) / (population_size × female_ratio)` | SB dùng effective clutch / số cái |
| INV-64 | neonate_harvesting | `hatching_rate` | `(avg_indv_neonate / total_neonate) / (avg_indv_egg / total_egg)` | **Nghịch đảo** ERD & Excel: `(total_neonate / avg_indv_neonate) / (total_egg / avg_indv_egg)` |
| INV-65 | neonate_harvesting | `total_egg_mass`, `avg_egg_indv_mass` | copy từ egg_ref | — |
| INV-66 | neonate_weighing | `neonate_sample_indv_mass` | `sample_mass / sample_count` | — |
| INV-67 | larvae_observation | `frass_weight`, `avg_larvae_mass`, `survival_rate` | `initial − biomass` · `AVERAGE(s1..s3)/100` · `(biomass×10⁶ / avg_mass) / stock_density` | — |
| INV-68 | larvae_growing | `wet_fcr`, `dry_fcr`, `growing_duration`, `avg_*` | `total_wet_feed / avg_biomass` · `wet×(1−feed_moisture) / (avg_biomass×(1−avg_larvae_moisture))` · `HOUR(end−start)/24` | ERD `dry_fcr` dùng wet feed ở SB |
| INV-69 | nursery_observation | `avg_baby_mass`, `baby_harvested`, `baby_biomass`, `survival_rate` | `(AVERAGE(s1..s3)/100)×1000` · `qty / sample_weight × sample_mass` · `harvested × avg_mass / 1000` · `harvested / stock_density` | Data Migration không nhân 1000 |
| INV-70 | nursery · pupae_growing | `total_dry_feed`, `*_feeding_rate` | `wet×(1−moisture)` (nursery, kg) · `×1000` (pupae, g) · `dry / stock_density` | Đơn vị khác nhau giữa 2 bảng |
| INV-71 | pupae_observation | `prepupae_mass`, `pupae_mass`, `pupation_rate`, `survival_rate` | `biomass/qty×1000` · `P/(P+PP)` · `((PP+P)/(sample_weight×pupae_biomass))/stock_density` | survival sai thứ nguyên; Excel: `((P+PP)/sample_weight×total_biomass)/stock_density`; SB pupation `P/(P+PP+L)`; tài liệu ghi `prepupae_mass` 2 lần |
| INV-72 | mọi bảng cha | `avg_*` | AVERAGE bảng con, không trọng số | — |

### 3.4 Validation (Required / Min)

| Mã | Bảng | Cột | Luật |
|---|---|---|---|
| INV-75 | egg_production | `pupae_growing_ref` | Required nếu thiếu strain/generation/cage; strain/generation/cage phải khớp cha |
| INV-76 | egg_production | `population_size` | Min 1 |
| INV-77 | egg_collection · egg_weighing | `egg_mass ≥ 1 mg`, `egg_clutch_mass ≥ 0.01 mg`, `egg_clutch_count ≥ 1` | |
| INV-78 | neonate_harvesting | `generation_ref` phải khớp 2 phần đầu của `neonate_id`; strain khớp egg_ref | |
| INV-79 | neonate_harvest · neonate_weighing | `neonate_mass ≥ 1`, `neonate_sample_mass ≥ 0.01`, `sample_count ≥ 1` | |
| INV-80 | larvae_growing / nursery / pupae_growing | `stock_density ≥ 1`, `feed_moisture ≥ 0.01`, `total_wet_feed ≥ 0.01` (larvae) / `≥ 1` (nursery, pupae) | |
| INV-81 | *_observation | mọi cột đo Min 0.01 / 0.001 / 1 theo bảng | |
| INV-82 | import_wizard.validation | IFS kiểm tra thiếu `reference_id`, thiếu giá trị từng cột, `body_mass ≤ 0` (Appendix II) | Không kiểm khoảng, trùng, ngày |

### 3.5 Quyền và audit (AppSheet)

| Mã | Cơ chế | Hiện trạng |
|---|---|---|
| INV-85 | `users` | `user_name`, `email`, `role` (Admin, Manager, Senior, Executive), 4 cờ `view/add/edit/delete_rights` |
| INV-86 | Kiểm tra role | MB gần như không kiểm role; PM: `role = "Manager"` thấy mọi dự án, duyệt task; `delete_rights = TRUE` để thêm project |
| INV-87 | Privacy PM | `privacy` Public / Confidential trên projects, tasks, chat, files; thấy khi Public, hoặc Manager, hoặc trong `pic`, hoặc là `create_by` |
| INV-88 | `db_log` | ghi `id`, `reference_id`, `details`, `database`, `action` (Add / Delete / Import), `create_by`, `create_datetime`; **không ghi Edit** |
| INV-89 | Vai trò theo Rollout Plan | System Admin, Project Leader (Senior), Executive, Worker |

### 3.6 Project Management: luật chính

| Mã | Luật | Nguồn |
|---|---|---|
| INV-90 | `progress_pct = completed_tasks / COUNT(task status ∉ {Cancelled, Delete})`; chia 0 khi chưa có task | PM doc §5.1 |
| INV-91 | `deadline_date = start_date + deadline_days`; `indicator`: Cancelled on / Early n / On time / Late n; `temp_indicator`: Late n / Due today / Due in n | §5.2 |
| INV-92 | Trạng thái project: In progress · Pending · Completed · Cancelled; Pending/Continue lan xuống mọi task; Complete chỉ khi `progress_pct = 1`; Reopen chỉ từ Cancelled; mọi thao tác chỉ người tạo | §7.1 |
| INV-93 | Trạng thái task: Assigned · In progress · Under review · Requires amendment · Completed · Pending · Cancelled; Complete (review = false) chỉ người tạo; Review → Under review (ghi end_date); Approved chỉ Manager / người tạo; Cancelled action ghi là về Assigned (tài liệu lệch) | §7.2 |
| INV-94 | Chat: type Normal / Status / Next step; `recipients`, `recipients_read` chuỗi tên nối " & "; sửa / xoá chỉ khi chưa ai đọc; read receipt tự ghi khi mở | §5.3, §7.3 |
| INV-95 | Files: upload hoặc URL (một trong hai bắt buộc); xoá bởi người liên quan project/task/message | §4.1, §7.4 |
| INV-96 | Report: type Year / Quarter / Month / Week + number → start/end_date tính (Week = `WORKDAY(...)+5`, năm hiện tại); bot "Create report" ghép template docx; Refresh; dưới Manager chỉ tạo cho mình | §5.5, §7.5 |
| INV-97 | Dashboard: `dashboard_filter` 1 dòng/user (type, start/end, pic, status) điều khiển 21 metric: status (4), task-only status (3), priority (4), KPI Early/On time/Late (3), live Long due ≥4 ngày / Due soon ≤3 / Due today / Late (4), progress (3) | §5.6 |
| INV-98 | Format rule: màu + icon cố định theo status, priority, privacy, indicator | §7.7 |
| INV-99 | Home `pm_description`: đếm chat chưa đọc gửi tới user | §5.4 |

## 4. View (màn hình) AppSheet

| Mã | App | Nhóm view | Số lượng / danh sách |
|---|---|---|---|
| INV-100 | MB | Navigation | Home (dashboard), Master Data menu, Egg production Deck, Neonate harvesting Deck, Larvae growing Deck, Pupae growing (Nursery & Pupae) Deck, Import wizard Dashboard, Users Deck, Documentation Deck |
| INV-101 | MB | Form | Add: Egg production / Egg collection / Egg weighing / Emerge & Sexing; Neonate harvesting / harvest / weighing; Larvae growing / observations; Nursery / observations; Pupae observations; QR Scan / Search |
| INV-102 | MB | Detail / inline | Detail cho 4 dimension + 13 fact (mỗi fact có `*_Detail`, `nursery_pupae_details`) |
| INV-103 | MB | Import | Home: Import wizard (có reset), Linked: Import wizard (không reset), 8 view `Import: <database>` |
| INV-104 | MB | Tổng | 101 view (chỉ khoảng 40 view được nêu tên trong tài liệu, xem UNK-02) |
| INV-105 | PM | Navigation | Home, Projects (Personal / Public, WIP / Completed / Cancelled, calendar), Tasks (tương tự), Dashboard (filter), Drive, Reports, Notifications, Users, Documentation |
| INV-106 | PM | Form / detail | projects_Form/Detail, tasks_Form/Detail, chat_Form, files form, report form, dashboard_filter form; `Personal tasks: WIP_Detail` |
| INV-107 | PM | Tổng | 69 view |

## 5. Action và automation

| Mã | App | Nhóm | Số lượng (đếm từ tài liệu) |
|---|---|---|---|
| INV-110 | MB | Action dimension | strains Add; generations Add, Details: Strain, "Add" (chỉ ở thế hệ mới nhất); cages Add; rooms Add |
| INV-111 | MB | Action fact (cha) | egg_production 16 (Add, 5 Details, Set population, 3 form ×2 host, New rows, Create label, End date ×2, Label, Import data, Delete, Dashboards); neonate_harvesting 15; larvae_growing 10; nursery 10; pupae_growing 11 |
| INV-112 | MB | Action fact (con) | Delete 6 bước cho 8 bảng con |
| INV-113 | MB | Action system | home: QR Scan ×2, Dashboards; import_wizard: Upload CSV, Import (6 bước), Clear data, Reset selection, Form file, View |
| INV-114 | MB | Bot | Scan row clear; Egg label (manual + auto); Emerge & Sexing label (manual); Neonate label (manual + auto) |
| INV-115 | PM | Action projects | Add, Delete, Edit, Add: Task, Add: PIC, Upload File, Message, Pending (cascade), Continue (cascade), Complete, Cancelled, Reopen, 6 link lọc |
| INV-116 | PM | Action tasks | Add: Task (độc lập), Delete (3 bước), Add: PIC, Upload File, Message, Pending, Continue, Complete, Review, Approved, Cancelled, Reopen, 4 link lọc |
| INV-117 | PM | Action chat / files / report / filter | chat: Delete, Edit, Reply, Read receipt (2 bước); files: Add, Delete, Open; report: Add, Delete, Open, Refresh; dashboard_filter: Type, Start/End date, PIC, Status |
| INV-118 | PM | Bot | Create report (docx template → file) |

## 6. Template, file và tài nguyên

| Mã | Loại | Nội dung | Đường dẫn |
|---|---|---|---|
| INV-120 | Template nhãn docx | Egg label (QR + Egg batch ID + Population size, A4 ngang); Neonate label (QR + Neonate ID + Prev. Generation Egg batch ID, tem 105 × 74 mm); Emerge & Sexing label (bảng 3 cột, `MOD(_ROWNUMBER,3)`, nội dung ô không trích được — UNK-09) | `appsheet/data/GeneticsDataPlatform/Content/` |
| INV-121 | Template report docx | Project & Task Report: user, type, number, from/to; bảng project (user ∈ pic) + bảng task (sort deadline, priority) | cùng thư mục |
| INV-122 | Template import CSV | 8 MB (`mb_*_import_form.csv`) + 1 SB (`sb_breeding_import_form.csv`); dòng 2 = kiểu dữ liệu, dòng 3 = hướng dẫn (phải xoá) | `import_wizard_Files_/` |
| INV-123 | File nhãn đã sinh | 33 PDF: nhãn Egg A4 ngang (QR 800 px, Egg batch ID, Population size; 21 file) và nhãn Neonate 105 × 74 mm (QR 150 px, Neonate ID, Prev. Generation Egg batch ID — **trống ở mọi batch F6 / F7**; 12 file); chưa có PDF nhãn cốc sexing | `Files/labels/` |
| INV-124 | Ảnh | cages (4 png), rooms (9), logo (3) | `cages_Images/`, `rooms_Images/` |
| INV-125 | Tài liệu trong app | 8 PDF (MB: Platform Documentation, User Guide EN/VN, Appendix I ERD, Appendix II Validation; PM: Documentation, User Guide, ERD) | `documentation_Files_/` |
| INV-126 | Workbook đã xuất | `DB_LOG.xlsx` (db_log, temp, scanner), `EMERGE_SEXING.xlsx` (12.942 dòng), `IMPORT.xlsx` (6 sheet staging) | `data_Files_/` |

## 7. Hạ tầng, ETL, dashboard ngoài AppSheet

| Mã | Thành phần | Hiện trạng | Số phận |
|---|---|---|---|
| INV-130 | `cloud_to_db.py` (Pipeline) | Python: requests Session (retry 4, backoff 2, 4 luồng, timeout 10/300 s), `Find` 18 bảng MB với Locale vi-VN, map `*_ref` → mã đọc được, ép kiểu, `INSERT … ON CONFLICT DO UPDATE` lô 1.000, soft delete theo `db_log` Delete mới hơn `last_success.txt`; cron hằng giờ (`5 * * * *`); log `filemode="w"` | Bỏ khi cutover; dùng lại phần extract cho migrate PM |
| INV-131 | `batch_migration.ipynb`, `cloud_to_db.ipynb` | Notebook dev (py_appsheet `add_items` để nạp lịch sử vào AppSheet) | Tham khảo cho tool `legacy_import` |
| INV-132 | PostgreSQL warehouse `maintenance_breeding_db` | Server Genetics nội bộ; 18 bảng, PK text, không FK, không CHECK, `delete_tag` / `deleted_at`; user `RnD_Data` cho Metabase | Nguồn đọc cho schema `legacy` (MB); bỏ sau cutover |
| INV-133 | Metabase (Docker, :3001) | 4 trang dashboard (Egg, Neonate, Larvae, Nursery → Pupae), Export Hub 5 tab, link `/public/dashboard` | Thay bằng dashboard trong app |
| INV-134 | quickchart.io | Sinh ảnh QR qua URL ngoài | Thay bằng segno trên server |
| INV-135 | Google Drive / OneDrive | Workbook và thư mục file của AppSheet | Đọc một lần khi migrate |
| INV-136 | Microsoft Entra | Email @entobel.com dùng cho sign-in AppSheet | Chuyển sang OIDC thật (MSAL + JWT) |
| INV-137 | Secret | `Server commands.txt` (mật khẩu SSH, DB), `Pipeline/.env` và `Development/.env` (AppSheet API key, mật khẩu Postgres) nằm trong OneDrive; `.env` Pipeline đặt `PG_DB` trong khi code đọc `PG_DATABASE` | Đổi toàn bộ trước / lúc cutover (RSK-01) |

## 8. Dữ liệu lịch sử (Data Migration.xlsx)

| Mã | Sheet | Số dòng | Cột | Ghi chú |
|---|---|---|---|---|
| INV-140 | egg_production | 65 | Egg ID, Start/End date, Population size, Female ratio, Total egg mass, Avg egg clutch mass, Avg indv egg mass, Mating rate | KPI AppSheet để đối chiếu |
| INV-141 | emerge_sexing | 16.542 | STT (Row ID), Egg ID, Emergence date, Body mass, Sex | Live sheet có 12.942 → lệch 3.600 dòng (UNK-03) |
| INV-142 | egg_collection | 486 | STT, Egg ID, Room ID, Collection date, Egg mass, mã sinh | Có `egg_mass = 0` |
| INV-143 | egg_weighing | 118 | Egg ID, Weighing date, clutch mass, count, indv mass | |
| INV-144 | neonate_harvesting | 51 | Neonate ID, Egg ID, dates, Population size, total/avg egg, total/avg neonate, Hatching rate | Hatching rate đã tính theo công thức Excel |
| INV-145 | neonate_harvest | 1.010 | Neonate ID, Room ID (trống), Harvest date, time, mass | |
| INV-146 | neonate_weighing | 117 | **Egg ID** (không phải Neonate ID), date, sample mass, count, indv mass + 8 cột phụ tự ghép mã | Cần map Egg F(n) → Neonate F(n+1) |
| INV-147 | larvae_growing | 10 | + Diet (CD), stock_density 43.200, 16 cột | |
| INV-148 | larvae_observation | 36 | + **Replication No.** (AppSheet không có) | |
| INV-149 | nursery | 39 | stock_density 5.889 / 3.500 / 25.657 | `TME_F4` không cage |
| INV-150 | nursery_observation | 176 | + Replication No. | |
| INV-151 | pupae_growing | 23 | `TMA_F4`, `TME_F4` gộp cage; stock_density 1.350 / 10.000 | |
| INV-152 | pupae_observation | 126 | + Replication No.; survival_rate có giá trị > 1 (`1.02`, `1.22`) | DQ cần cảnh báo |

Dữ liệu PM không có bản xuất; phải lấy qua AppSheet API (UNK-04).

## 9. Tài liệu handover và trạng thái đọc

| Mã | Tài liệu | Đọc được | Dùng cho |
|---|---|---|---|
| INV-160 | MB Platform Documentation (45 trang), User Guide EN / VN, Appendix I ERD, Appendix II Validation | ✓ | Inventory §2–5, traceability |
| INV-161 | PM Platform Documentation (28 trang), User Guide, ERD | ✓ | §3.6, traceability PM |
| INV-162 | Maintenance Breeding Rollout Plan.docx, Defect Log Template.xlsx | ✓ | Waves, cutover, phân loại khác biệt |
| INV-163 | Data System & Operation Review.docx (05/08/2026: gaps P1–P4, D1–D6, C1–C4, Q1–Q4, S1–S5; Top 10 Priority Improvements), Appendix I Data Fields.docx (mọi sheet / cột / công thức của 18 workbook, cờ hard-code / inconsistent), Feedback KPI1 (yêu cầu bổ sung: sampling do Executive xác nhận, bản đồ đóng góp ổ trứng → thế hệ kế), 2 Sampling Assessment | ✓ | Khuyến nghị Top 10, data dictionary, protocol, KPI |
| INV-164 | SB ERD (drawio / pdf / jpg), MSA/MSB/MSC-Gn.xlsx (bản System Review), ảnh form giấy | ✓ | Model SB, risks |
| INV-165 | Metabase Dashboards – Wireframe.pdf | ✓ | Dashboard trong app |
| INV-166 | Entobel Ecosystem Integration.pdf, System architecture.png, Tech stack.png | ✓ | Kiến trúc đích, tích hợp |
| INV-167 | Excel vận hành cũ (Baby pupae growing, Egg_neonate_tracking, Gen_Breeding_growing (14 sheet = nguồn Data Migration), Key Metrics operation method formula (công thức + SOP từng chỉ số), REF line tracking, SEXING) | ✓ | Đối chiếu công thức, replicate, SOP; ghi chú trong Key Metrics: Larvae growing "không nối vào flow 01–04" (DN-2) |
| INV-168 | Wireframes (346 màn, 24 trang canvas), blueprint.html, 7 tài liệu kiến trúc trong `docs/` | ✓ | Target, traceability màn hình |
| INV-169 | `Data Platform - Presentation.pptx`, `Selective Breeding - Data Platform Proposal.pptx` | ✗ (không phải zip hợp lệ: khoá RMS / placeholder OneDrive) | UNK-05 |
| INV-170 | `Planning/Selective Breeding/MSB/*.xlsx`, `MSC/*.xlsx` (6 file), `Operation_maintain breeding REFF5.xlsx` | ✗ (không phải zip) | Dùng bản không khoá trong `System Review/Selective`; REFF5 chưa đọc được (UNK-05) |

## 10. Những thứ **không** migrate (workaround AppSheet)

| Mã | Thành phần | Lý do |
|---|---|---|
| INV-180 | Bảng `temp`, `scanner`, `import_wizard`, 5 bảng `*_import` | Cache / staging do AppSheet thiếu transaction và trang tra cứu; thay bằng endpoint `/lookup` và `import_batch` |
| INV-181 | `master_controls`, `home` | Cấu hình menu; thành `layouts/nav.ts` + `role.phone_home` |
| INV-182 | Action nhân đôi Browser / Device | Một UI responsive, quyền + điều kiện ở API |
| INV-183 | Composite action End date / Delete 6 bước / Import 6 bước | Một use case, một transaction |
| INV-184 | Virtual column tổng hợp (`avg_*`, `total_*`, rates) | View `analytics.*`; không lưu KPI thành cột |
| INV-185 | `label_trigger` / `label_file` / `emerge_sexing_trigger` | `label_print` + job |
| INV-186 | `dashboard_filter` (21 metric) | Tham số truy vấn `/analytics/pm` |
| INV-187 | quickchart.io, Metabase public link, cron ETL | Bảo mật và kiến trúc đích |
| INV-188 | Chuỗi tên `pic`, `recipients`, `recipients_read`, `create_by` | Khoá ngoại tới `app_user` |
