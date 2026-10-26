# PLAN-001 · 6 · Rủi ro, điều chưa biết và quyết định còn mở

> Ba danh sách riêng: **RSK** rủi ro (có xác suất / ảnh hưởng / cách giảm), **UNK** điều chưa biết (cần đi hỏi hoặc mở file), **D / DN** quyết định phải chốt (D1–D8 từ `overview.md` §13; DN-x mới phát hiện trong PLAN-001). Mỗi mục ghi feature bị chặn.
> Quy ước mức: Cao = chặn go-live hoặc làm sai dữ liệu lịch sử · TB = làm trễ hoặc phải làm lại một phần · Thấp = khó chịu, có cách vòng.

## A. Rủi ro

| ID | Rủi ro | Mức | Bằng chứng | Giảm thiểu | Ảnh hưởng tới |
|---|---|---|---|---|---|
| RSK-01 | **Secret lộ**: mật khẩu SSH / DB và AppSheet API key nằm dạng chữ thường trong OneDrive (Server commands.txt, 2 file .env) | Cao | INV-137 | Rotate ngay; nhưng **giữ API key cũ (hoặc cấp key mới) cho tới khi migrate PM xong** vì PM chỉ lấy được qua API (DN-12) | F-0107, F-1303, F-1410 |
| RSK-02 | **Công thức KPI mâu thuẫn giữa 3–4 nguồn** (tài liệu app, ERD, Excel Key Metrics, Sampling Assessment, Appendix I): hatching_rate nghịch đảo, pupae survival sai thứ nguyên, avg_baby_mass ×1000, feeding rate mg/g, female_ratio mẫu số; Appendix I ghi nhận mating rate có ≥ 8 biến thể, survival có 6 mẫu số khác nhau, nhiều ô hard-code | Cao | INV-60…72; Appendix I Data Fields "Flagged field issues"; Review Top 10 #3 | F-0005 đọc app thật; F-0002 ký; parity test với fixture; version KPI | E06, E11, E12 |
| RSK-03 | **Lineage thiếu trong dữ liệu live**: nhãn neonate F6 / F7 in ra có "Prev. Generation Egg batch ID" trống → `egg_ref` không đặt; `neonate_harvesting.egg_ref` không bắt buộc khi có strain / generation / cage | Cao | Label PDF; INV-78 | Khi migrate: suy lineage từ mã (`TMA_F6_BC01` → `TMA_F5_BC01`) và ghi `match_status = unchecked`; báo Source Gap; DQ "cha hợp lệ" ở hệ mới | F-1203, F-0701 |
| RSK-04 | **Trùng / lệch mã trong dữ liệu cũ**: hậu tố `.n` = COUNT + 1 (trùng khi xoá rồi thêm), `neonate_weighing_id` đếm nhầm bảng, padding `MC1 / MC10 / MC06`, egg_collection có `egg_mass = 0` | TB | INV-45, INV-41, INV-142 | `seq` cấp lại theo `create_date`; chuẩn hoá container; DQ cảnh báo giá trị 0 | F-1202, F-1204 |
| RSK-05 | **Số dòng emerge_sexing lệch**: Data Migration 16.542 · sheet live 12.942 · Excel gốc 14.143 | TB | INV-141, INV-15 | Đối chiếu theo Row ID; phần thiếu = Source Gap; không bịa | F-1204, F-1206 |
| RSK-06 | **Schema AppSheet còn thay đổi tới go-live 04/01/2027** (rollout đang Stage 2); app thật có bảng không có trong tài liệu (`egg_production_log`, `neonate_harvesting_log`, `import_emerge_sexing`, `scale`) | TB | Ảnh chụp editor trong Ecosystem Integration.pdf; UNK-01 | Đọc lại app editor ở F-0005 và trước F-1201; `legacy` giữ nguyên cột nên chịu được thêm cột | F-0005, F-1201 |
| RSK-07 | **Wi-Fi khu nuôi yếu** (Rollout Plan liệt kê là rủi ro đầu tiên; AppSheet mất dữ liệu nửa chừng khi rớt mạng giữa composite action) | Cao | Rollout Plan §1.11; blueprint | Offline-first (F-0406), idempotency (F-0304); test thiết bị thật ở khu nuôi (D8) | E04, E13 |
| RSK-08 | **Giới hạn PWA trên iOS**: không Background Sync, push chỉ khi cài, camera hỏi lại ở standalone, refresh token SPA ≤ 24 h | TB | `mobile.md` §8, §11 | Outbox không dựa Background Sync; giữ outbox khi phải đăng nhập lại; checklist iPhone mỗi bản phát hành | F-0404…F-0406 |
| RSK-09 | **Lịch va với go-live AppSheet**: team Executive bận test Stage 2–5 (26/10/2026–01/01/2027) và hypercare tới 05/02/2027; khó xin thời gian ký KPI / xác nhận công thức | TB | Rollout Plan §1.6 | W0 tận dụng chính phiên test của họ; hỏi gộp theo đợt; D1 phương án A | W0, W4 |
| RSK-10 | **Đào tạo hai lần** (AppSheet rồi app mới trong < 6 tháng) → mệt mỏi, quay về Excel / giấy | TB | Rollout Plan "no return to Excel" | Giữ thuật ngữ, luồng và mã giống AppSheet; mobile 5 ô Worker giống Home AppSheet; cutover giữa hai chu kỳ | F-1302 |
| RSK-11 | **Tài liệu khoá RMS**: 2 pptx, 6 xlsx MSB / MSC trong Planning/SB, REFF5.xlsx không mở được ngoài Office có quyền | Thấp | INV-169, INV-170 | Dùng bản không khoá trong System Review/Selective (có đủ MSB-G0…G4, MSC-G1…G3); nhờ người có quyền xuất PDF nếu cần | F-1501, F-1509 |
| RSK-12 | **ERD Selective nhiều lỗi** (26 lỗi xác minh: PK chép nhầm, cột trùng, kiểu sai, dry_fcr dùng wet feed, selection_index tham chiếu cột không tồn tại, F vs G, thiếu diet / line / crate FK, fly_allocation 1–1 trong khi dữ liệu n–n) | Cao (cho W6) | Báo cáo SB §6 | F-1501 chốt lại trước khi code; model chung đã bao: `batch_transfer` n–n, `container` crate, `line`, `diet` | E15 |
| RSK-13 | **Model chung MB + SB (D2) tốn thêm 1–2 tuần thiết kế** và nếu SB đổi quy trình (MSC preservation, C1–C4) sẽ kéo theo `batch` | TB | blueprint "Đánh đổi" | Chốt D2 = model chung nhưng chỉ dựng phần MB trước; cột / bảng SB thêm bằng migration riêng | F-0601 |
| RSK-14 | **Đơn vị không thống nhất** giữa sheet, tài liệu và giấy (mg / g / kg; "29,872" vs "0.864"; `total_dry_feed` kg vs g; `eggs_produced` thật ra là mg) | Cao | INV-70; báo cáo Excel cũ; ảnh sổ tay | Data dictionary (F-0001); đơn vị trong tên cột; import chuẩn hoá dấu phẩy / chấm; DQ 3σ | F-0001, F-0901, F-1204 |
| RSK-15 | **Dữ liệu survival > 1** trong pupae_observation lịch sử (1,02; 1,22) | Thấp | INV-152 | Giữ nguyên khi migrate, gắn `dq_issue` warning; không sửa tay | F-1204, F-0702 |
| RSK-16 | **Thời gian "SA / CH"** (AM / PM tiếng Việt) trong `harvest_time` parse thành NULL ở ETL cũ | TB | Cron setup notes | Parser riêng khi migrate; test với dữ liệu thật | F-1204 |
| RSK-17 | **PM không có bản xuất**; chỉ lấy được qua AppSheet API `Find`; nếu app PM bị khoá / key đổi trước khi migrate thì mất | TB | INV-20, UNK-04 | Xuất snapshot PM ngay trong W0 (một lần, JSON) để phòng; migrate thật ở W5 | F-1201, F-1410 |
| RSK-18 | **Thiếu bảng thiết bị thật** để nghiệm thu camera / PWA | Thấp | D8 | Chốt ở W1; mượn 1 Android + 1 iPhone của Worker | F-0404, F-1302 |
| RSK-19 | **Nhân lực**: W2 có ~45 feature trên 3 nền tảng; một người làm tuần tự ≈ 6 tháng | TB | `05-waves.md` | Chia nhóm song song S5–S7; agent AI theo `workflow.md` §9; ưu tiên P0 | W2 |
| RSK-20 | **Kiến trúc đích mâu thuẫn với ảnh cũ** (System architecture.png vẽ warehouse bronze / silver / gold + Metabase + IoT; `overview.md` bỏ Metabase, không warehouse) → stakeholder kỳ vọng khác nhau | TB | Báo cáo dashboard §C | Nêu rõ trong ADR D2 / overview: dashboard trong app, export cho ML; IoT / cân ngoài phạm vi v1 (`overview.md` §1.2) | F-1102, F-1104 |

## B. Điều chưa biết (cần hỏi hoặc mở)

| ID | Câu hỏi | Ai trả lời được | Cần trước | Nếu không có |
|---|---|---|---|---|
| UNK-01 | AppSheet MB thật có **44 bảng** (tài liệu liệt kê 30): tên và vai trò của `egg_production_log`, `neonate_harvesting_log`, `import_emerge_sexing`, `scale` và các bảng khác? Slice hay bảng thật? | System Admin (mở app editor) | F-0005 | Coi là log / staging → Drop; ghi rõ |
| UNK-02 | Danh sách **101 view** MB và **69 view** PM (tài liệu chỉ nêu nhóm) — có view nào ngoài wireframe không? | System Admin | F-0005 | Wireframe 346 màn là phạm vi UI |
| UNK-03 | Vì sao emerge_sexing 16.542 (Data Migration) ≠ 12.942 (live) ≠ 14.143 (Excel)? Dòng nào đã xoá / chưa nạp? | Executive + System Admin | F-1204 | Source Gap |
| UNK-04 | Cách lấy dữ liệu PM: API key hiện tại còn hoạt động? Có quyền `Find` trên app PM (app id khác MB)? | System Admin | W0 (snapshot) | Nhập tay / bỏ lịch sử PM |
| UNK-05 | Nội dung 2 pptx (Presentation, SB Proposal) và REFF5.xlsx bị khoá RMS | Người có tài khoản Entobel + Office | F-1501 | Dùng ERD + Excel đã đọc |
| UNK-06 | Chính sách Entra: ai cấp admin consent cho 3 app registration mới; tenant có cho SPA refresh token > 24 h? | IT Entobel | F-0201 | Đăng nhập lại mỗi ngày (outbox giữ dữ liệu) |
| UNK-07 | Server Genetics nội bộ: cấu hình, Docker có sẵn, HTTPS / tên miền nội bộ, điện thoại trong khu nuôi vào được không (Wi-Fi / VPN)? | IT + System Admin | F-0104 (D3) | Azure |
| UNK-08 | "Supported browser" cho tạo nhãn trong Rollout Plan là gì? (chỉ để biết thói quen user) | System Admin | F-1302 | — |
| UNK-09 | Nội dung từng ô nhãn cốc sexing (template loop không trích được; chưa có PDF mẫu) — in QR + mã? kích thước? | System Admin (in thử) | F-0801 | QR + mã `…_BB.n`, 3 cột A4 |
| UNK-10 | Bộ lọc thật của dashboard Metabase (wireframe chỉ vẽ "Controls") và Export Hub 5 tab có cột gì | System Admin (mở Metabase) | F-1102, F-1104 | Lọc strain / generation / khoảng ngày; export theo view warehouse |
| UNK-11 | Thiết bị điện thoại thật của Worker / Executive (model, iOS / Android version) | Executive | F-0404 (D8) | Android Chrome, iOS 16.4+ |
| UNK-12 | Egg collection ghi theo **phòng (MC)** nhưng đơn vị sinh học là **lồng (BC)**: một phòng nhiều lồng? một batch Egg nhiều phòng? (Data Migration: cùng batch nhiều phòng MC06…) | Executive | F-0606, F-0001 | Giữ `room_id` trên `egg_collection`, batch gắn cage |
| UNK-13 | Batch "COMP / Comp / pooled" trong Excel (gộp nhiều cage) được ghi trong AppSheet thế nào? | Executive | F-1203 | `batch_transfer` nhiều cha, container NULL |
| UNK-14 | Mating rate: REF tracker có 3 biến thể, chỉ "calculated according factory" khớp tài liệu — biến thể nào cần giữ? | Executive | F-0002 | Chỉ công thức tài liệu |
| UNK-15 | Pupae stock density cố định 1.350 / 10.000; nursery 5.889 / 3.500 / 25.657 / 45.000 (Key Metrics) — tham số protocol hay nhập mỗi batch? | Executive | F-0006 | Nhập mỗi batch, protocol chỉ gợi ý |
| UNK-16 | Feeding record: AppSheet chỉ có `total_wet_feed` một lần; wireframe có lịch cho ăn nhiều lần — FCR tính từ tổng feeding_record hay từ `total_wet_feed_kg`? | Executive | F-0615, F-0002 | `total_wet_feed_kg` nhập ở điều kiện; feeding_record chỉ để theo dõi |
| UNK-17 | Số user thật và map vai trò: ai là Manager (xem mọi dự án), ai Admin; Project Leader (2 người) → Executive hay vai trò riêng? | Genetics Manager | F-0203, F-0206 | 4 vai trò mặc định, Project Leader = Executive |
| UNK-18 | SB: bản MSA-G1 / G2 nào là bản chuẩn (2 bản khác nhau); MSA-G3(AutoRecovered) có migrate không? | Executive SB | F-1509 | Bản System Review |
| UNK-19 | SB: MSC có trong phạm vi v1 (preservation, C1–C4, không CTR) hay chỉ MSA + MSB? | Genetics Manager | F-1501 | MSB trước (lộ trình: "một thế hệ MSB") |
| UNK-20 | Nhật ký hypercare / defect log thật của Stage 1A / 1B (đã sign-off 23/10/2026?) — để biết lỗi AppSheet đã gặp | System Admin | F-1301 | — |
| UNK-21 | Ý nghĩa dấu X đỏ trên sổ tay giấy (đã chép vào app hay huỷ) và đơn vị ngầm (mg / g) theo dòng | Worker / Executive | F-1204 (nếu nhập lại từ giấy) | Không migrate từ giấy |
| UNK-22 | Dòng **REF** "không còn quản lý" (Review R:L50) nhưng vẫn có trong AppSheet (REF_F6_BC03) và Data Migration — migrate đủ hay chỉ đọc? | Genetics Manager | F-1203 | Migrate đủ, đánh dấu strain `is_active = false` nếu ngừng |
| UNK-23 | Định dạng file cân Ohaus ("OhausScale 4", sheet Weight Records: DateTime \| Label C1–C4 \| Type \| Weight \| Unit) và công cụ đếm trứng bằng ảnh (Filename / Count / Avg confidence) — cần mẫu file thật | Executive SB | F-1505, F-1503 | Template CSV tự định nghĩa |

## C. Quyết định còn mở

### C.1 D1–D8 (từ `overview.md` §13) — trạng thái sau PLAN-001

| ID | Quyết định | Đề xuất của PLAN-001 | Lý do | Chặn |
|---|---|---|---|---|
| D1 | Thời điểm cutover | **A**: go-live AppSheet 04/01/2027 đúng lịch; cutover app mới ~05–06/2027 sau ≥ 3 tháng AppSheet ổn định, giữa hai chu kỳ thế hệ | Lịch W2 không kịp 22/12/2026; dữ liệu live trên AppSheet giúp migrate thật; tránh đào tạo chồng | W4 |
| D2 | Model chung MB + SB | **Model chung**, dựng phần MB trước; SB thêm bằng migration riêng | ERD SB lỗi nhiều, phải thiết kế lại dù sao; dùng chung `batch_transfer`, `egg_clutch`, `individual` | F-0601, F-1501 |
| D3 | Nơi chạy | Server nội bộ + Compose (giữ mặc định) nếu UNK-07 xác nhận điện thoại trong khu nuôi vào được HTTPS nội bộ; ngược lại Azure | | F-0104 |
| D4 | Lưu file | Ổ server qua `FileStorage`; SharePoint sau | | F-0307 |
| D5 | Task nhập liệu tự Completed | Tự Completed; `review = true` → Under review | AppSheet: Complete chỉ người tạo; wireframe MTaskDataDone tự hoàn thành | F-1404 |
| D6 | Lịch việc định kỳ | Seed từ Sampling Assessment MB: thu trứng 1 lần / phòng / ngày; cân ổ 3 ổ / lồng / ngày (tối đa 60, ≥ 30); neonate 07 · 10 · 13 · 15; cân neonate 3 × ~5 mg; larvae 3 × 100 con; nursery 3 × 100; pupae 30–50 g từ 3–4 crate; emergence 200 cốc / lồng, 7 ngày; dung sai 30 phút | Số liệu có trong tài liệu, chỉ cần ký | F-0006, F-1001 |
| D7 | Công thức KPI cuối | Theo ERD / Excel cho hatching, pupae survival; female_ratio = female / emerged (SB) **hoặc** female / monitored (Excel MB) → phải chọn (D7a); avg_baby_mass ×1000 (D7b); feeding rate đơn vị (D7c); emergence = emerged / tracked (200) (D7d); mating rate 1 công thức (D7e) | 5 điểm con chưa thống nhất giữa nguồn | F-0002 |
| D8 | Thiết bị | 1 Android (Chrome) + 1 iPhone (Safari 16.4+) của Worker thật | | F-0404 |

### C.2 Quyết định mới (DN)

| ID | Quyết định | Phương án | Mặc định đề xuất | Chặn |
|---|---|---|---|---|
| DN-1 | Gate chốt Nursery có bắt buộc ≥ 1 quan sát không? AppSheet: không (chỉ "chưa end"); Rollout Plan Stage 3B mô tả như Pupae | (a) giữ AppSheet (b) bắt buộc 1 quan sát | (a), DQ warning nếu 0 quan sát | F-0619 |
| DN-2 | Vị trí giai đoạn Larvae: AppSheet = nhánh từ Neonate, kết thúc; Key Metrics Excel ghi "Larvae nằm giữa Nursery và Pupae" | (a) theo AppSheet (b) cho phép Nursery → Larvae | (a); thiết kế `batch_transfer` cho phép (b) sau | F-0618, F-0619 |
| DN-3 | Egg collection ghi theo phòng hay lồng (UNK-12) | giữ `room_id` trên bản ghi, batch theo cage | mặc định | F-0606 |
| DN-4 | Master data "Adds only": user guide nói không sửa được; Rollout Plan nói System Admin sửa / xoá được | wireframe: không xoá khi đã dùng, chỉ `is_active = false`; Admin sửa tên / ảnh | mặc định | F-0502 |
| DN-5 | SB: effective clutch ≥ 300 (ERD) / ≥ 600 (Sampling) / 600–1.800 (Excel) / mass ≥ 10 mg (MSB-G0) | tham số protocol theo scheme, có cả cận trên tuỳ chọn | 600–1.800 (Excel đang dùng) | F-1501 |
| DN-6 | SB: hatching rate theo ổ (MSA "fertility") hay theo số ước tính; pupation có larvae hay không theo scheme; emergence 200 hay 300 | 2 KPI code riêng (`hatching_rate_clutch`, `hatching_rate_mass`); `pupation_rate` / `pupation_rate_incl_larvae`; sample size là protocol | mặc định | F-1501 |
| DN-7 | SB: selection index 2 hay 3 thành phần; z-score tính trên tập nào (SEL của thế hệ / SEL + CTR); `Selected?` nhập tay hay tính | 3 thành phần, bỏ harvest-day khi mọi crate cùng ngày (Excel G2+); z trên crate SEL cùng thế hệ; hệ thống đề xuất, Executive xác nhận | mặc định | F-1506 |
| DN-8 | SB: MSC và BK line trong phạm vi v1? | (a) MSA + MSB v1, MSC v1.1 (b) cả ba | (a) | F-1501…F-1507 |
| DN-9 | Fly allocation n–n (nhiều crate / nhóm / ngày vào một lồng) | dùng `batch_transfer` nhiều dòng thay bảng `fly_allocation` 1–1 | mặc định | F-1507 |
| DN-10 | FCR tính từ `feeding_record` (nhiều lần) hay `rearing_condition.total_wet_feed_kg` (một số) | tổng feeding_record nếu có, fallback total_wet_feed | mặc định; chốt cùng D7 | F-0615, F-1101 |
| DN-11 | Rotate AppSheet API key / mật khẩu DB khi nào so với migrate PM (RSK-01, RSK-17) | rotate ngay nhưng cấp key mới cho tool migrate; xoá key sau W5 | mặc định | F-0107, F-1410 |
| DN-12 | Batch Egg không có container (`TMA_F4`) và batch gộp cage: có ép mọi batch Egg phải có lồng ở hệ mới? | không ép (giữ AppSheet), DQ warning | mặc định | F-0602 |
| DN-13 | Xoá bản ghi: xoá mềm 30 ngày + Admin khôi phục (wireframe DeleteConfirm) vs xoá hẳn (AppSheet) | xoá mềm (đã có `deleted_at`) | mặc định | F-0622 |
| DN-14 | Có nhập lại dữ liệu từ sổ tay giấy (ảnh) không? | không trong phạm vi migrate; nếu cần là task import riêng | mặc định | F-1204 |
| DN-15 | Dashboard PM 21 metric: giữ đủ 21 hay rút gọn theo wireframe PMDashboard | giữ đủ (công thức có sẵn), UI theo wireframe | mặc định | F-1408 |
| DN-16 | Review Top 10 #8 yêu cầu **maker / checker** (tách nhập liệu và duyệt cho dữ liệu quan trọng); blueprint / `overview.md` đã bỏ bước duyệt batch (chốt theo điều kiện, Admin mở lại) | (a) giữ không duyệt + audit + DQ + mở lại 48 h (b) thêm cờ `review` cho chốt giai đoạn như task | (a); thiết kế `close` cho phép thêm bước review sau (cờ trên protocol) | F-0617, F-0621 |
| DN-17 | SB: có đưa công cụ đếm trứng bằng ảnh (MSA) và log cân C1–C4 (MSC) vào hệ mới không | (a) import file kết quả (b) chỉ nhập số | (a) qua import template, không tích hợp thiết bị (theo `overview.md` §1.2) | F-1503, F-1505 |

## D. Việc phải làm ngay (trước khi bắt đầu W1)

1. Rotate secret (RSK-01, DN-11) — System Admin.
2. Xuất snapshot PM qua API (RSK-17) — 1 giờ, script dùng lại `fetch_table`.
3. Mở app editor AppSheet để trả lời UNK-01, UNK-02 và xác nhận 5 điểm của D7 (F-0005) — System Admin + Executive, 1 buổi.
4. Chốt D1, D2, D3 bằng 3 ADR trong `docs/decisions/` — Genetics Manager.
5. Xác nhận IT: Entra app registration + admin consent, server / HTTPS (UNK-06, UNK-07).
