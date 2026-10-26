# PLAN-001 · 5 · Migration waves và ưu tiên

> Wave = nhóm epic / feature đi cùng nhau tới một mốc demo được (M0…M6 của `workflow.md` §3). Thứ tự bám đường găng ở `04-dependency-map.md`; ngày tháng là **giả định lập kế hoạch** (vòng 2 tuần, bắt đầu 03/11/2026) và phụ thuộc D1, D3; chốt lại khi có đội.
> Bối cảnh lịch AppSheet (Rollout Plan): Stage 2 Neonate 26/10–06/11/2026 · Stage 3A Larvae 09–20/11 · Stage 3B Nursery 23/11–04/12 · Stage 4 Pupae 07–18/12 · Stage 5 E2E 22/12/2026–01/01/2027 · **Go-live AppSheet 04/01/2027** · Hypercare tới **05/02/2027**.

## 1. Tổng quan

| Wave | Mốc | Epic | Mục tiêu demo | Ước lượng (vòng 2 tuần) | Điều kiện vào | Điều kiện ra |
|---|---|---|---|---|---|---|
| **W0** Chốt logic | M0 | E00 | Tài liệu KPI / mã / data dictionary / protocol được Executive ký; fixture legacy | 1–2 vòng, **song song W1** | Thư mục handover; truy cập app AppSheet editor | F-0001…F-0006 ký; F-0007 mẫu |
| **W1** Nền tảng | M1 | E01, E02, E03, E04, E05 | Đăng nhập Entra trên web + PWA; CRUD master data; mọi thay đổi vào audit; khung app 2 nền tảng; outbox gửi được bản ghi giả | 3 vòng | D2, D3 có mặc định | CI xanh; 4 vai trò đăng nhập đúng nền tảng; outbox e2e |
| **W2** Maintenance Breeding | M2 | E06, E07, E08, E09, E10 | Chạy trọn Egg → Neonate → Nursery → Pupae → Egg và nhánh Larvae bằng fixture trên web + mobile; nhãn in được; import có preview; việc định kỳ | 5–6 vòng | M1 | F-0626 e2e xanh; gate / chốt / mở lại / sửa 24 h đúng quyền |
| **W3** Analytics + migrate MB | M3 | E11, E12 | Dashboard 5 giai đoạn + export; dữ liệu MB thật trên staging; 100 % khác biệt KPI phân loại | 3 vòng | M2; F-0002 ký | F-1206 báo cáo đối chiếu; số trên dashboard khớp Metabase |
| **W4** Cutover MB | M4 | E13 | Chạy song song theo Historical Comparison Method; sign-off; khoá AppSheet; tắt ETL / Metabase; hypercare | 2 vòng + hypercare 4 tuần | M3; D1 chốt; staging có TLS; thiết bị thật (D8) | Metric go-live (Rollout Plan §1.8): 100 % bản ghi mới nhập trên app; same-day ≥ 95 %; 0 defect mở |
| **W5** Project Management | M5 | E14 | Project, task (general + data), chat, file, report, PM dashboard; task nhập liệu gắn batch; migrate PM | 3 vòng | M2 (E06, E10); E02 | PM dùng app mới; AppSheet PM khoá |
| **W6** Selective Breeding | M6 | E15 | Một thế hệ MSB chạy hết vòng: ổ trứng → neonate → larvae (phenotype, index) → pupae → phân bổ; SB overview | 4 vòng | M2; F-1501 ký; file Ohaus mẫu | Selection run và lineage G(n) → G(n+1) |

Tổng ước lượng: khoảng 21–23 vòng 2 tuần (≈ 10–11 tháng lịch) nếu một đội; W5 và W6 có thể chạy song song với W3 / W4 nếu có đội thứ hai (chỉ phụ thuộc M2).

## 2. Lịch giả định (D1 = go-live AppSheet rồi cutover sau hypercare)

| Wave | Bắt đầu | Kết thúc | Ghi chú lịch AppSheet |
|---|---|---|---|
| W0 | 03/11/2026 | 28/11/2026 | Trùng Stage 3A / 3B AppSheet: tận dụng Executive đang test để xác nhận công thức (F-0005) |
| W1 | 03/11/2026 | 12/12/2026 | Song song W0 |
| W2 | 15/12/2026 | 20/03/2027 | AppSheet go-live 04/01/2027 nằm trong W2 → **không cutover** lúc này |
| W3 | 23/03/2027 | 30/04/2027 | Dữ liệu MB trên AppSheet đã có batch live để migrate thật |
| W4 | 04/05/2027 | 29/05/2027 (+ hypercare tới 26/06/2027) | Cutover sau khi AppSheet ổn định ≥ 3 tháng; chọn thời điểm giữa hai chu kỳ thế hệ |
| W5 | 23/03/2027 | 04/05/2027 (đội 2) hoặc 01/06–12/07/2027 (một đội) | |
| W6 | 04/05/2027 | 26/06/2027 (đội 2) hoặc 13/07–04/09/2027 (một đội) | |

Phương án B (D1 = dừng rollout AppSheet, dùng lịch test hiện có cho app mới): W2 phải xong trước 22/12/2026 → không khả thi với lịch trên; chỉ chọn nếu chấp nhận hoãn go-live tới khoảng tháng 3–4/2027. Khuyến nghị **phương án A** (go-live AppSheet đúng lịch, cutover sau).

## 3. Ưu tiên trong từng wave

### W0
1. F-0005 (xác nhận công thức trên app thật) — chặn mọi KPI.
2. F-0002, F-0001, F-0003 — đầu vào migration schema.
3. F-0006, F-0004, F-0007.

### W1 (thứ tự nhập)
1. F-0101 → F-0102 → F-0103 (ngày 1–5).
2. Backend: F-0301, F-0203, F-0201, F-0202, F-0205, F-0305, F-0304, F-0303, F-0302, F-0306, F-0309, F-0307.
3. Frontend: F-0401 → F-0402 / F-0404 → F-0403 / F-0405 / F-0407 → F-0406.
4. Reference: F-0501 → F-0502 → F-0503 / F-0504 / F-0505 → F-0508 (seed thật) → F-0506 / F-0507.
5. Cuối W1: F-0206, F-0208, F-0104 (staging), F-0107.

### W2 (lát dọc theo giai đoạn)
1. F-0601 → F-0605 → F-0603 / F-0604 → F-0602.
2. Egg: F-0606, F-0607, F-0608 (web trước, mobile sau F-0803), F-0801 / F-0802, F-0622, F-0617, F-0621.
3. Neonate: F-0609, F-0610, F-0618, F-0803.
4. Larvae / Nursery / Pupae: F-0611, F-0612, F-0613, F-0614, F-0619, F-0620.
5. Cross: F-0701…F-0703 (trước F-0617 hoàn chỉnh), F-0901 / F-0902, F-1001 / F-1002 / F-1003, F-0623, F-0624, F-0625.
6. P1 còn lại: F-0615, F-0616, F-0704, F-0903, F-0904, F-1004, F-0409.
7. F-0626 e2e đóng wave.

### W3
1. F-1101 (view + parity) song song F-1201 / F-1202.
2. F-1203 → F-1204 → F-1206; F-1102, F-1104 song song; F-1105.
3. F-1205, F-1207, F-1103 (P1).

### W4
F-1304 → F-1301 (song song F-1302) → F-1303 → F-1305.

### W5
F-1401 → F-1409 → F-1402 / F-1403 → F-1404 / F-1405 → F-1406 / F-1407 / F-1408 → F-1410.

### W6
F-1501 → F-1502 → F-1503 / F-1504 → F-1505 → F-1506 → F-1507 → F-1508 → F-1509.

## 4. Những thứ cố ý để sau go-live (P2)

| Feature | Lý do để sau |
|---|---|
| F-1005 Nhắc tự động đầy đủ | Thông báo nền có từ W1; nhắc theo sự kiện làm sau khi gate ổn định |
| F-1106 Báo cáo batch PDF | Không có trong AppSheet; wireframe chỉ nhắc một câu |
| F-1410 Migrate PM | PM tiếp tục trên AppSheet tới W5 |
| F-1508, F-1509 | SB overview và lịch sử Excel sau khi một thế hệ chạy thật |
| Web push (trong F-0308) | iOS chỉ có khi cài PWA; không chặn vận hành |
| Export theo lịch, máy in nhãn cấu hình (SystemSettings) | Hoàn thiện ở hypercare |

## 5. Rủi ro lịch (xem thêm `06`)

- W2 là wave dài nhất và có nhiều lát dọc; cần ≥ 2 người (1 backend, 1 frontend web, 1 mobile) hoặc agent song song theo nhóm S5–S7.
- W3 phụ thuộc chất lượng dữ liệu AppSheet sau go-live: lỗi lineage (ví dụ nhãn neonate thiếu Egg cha) biến thành Source Gap.
- W4 cần cửa sổ giữa hai chu kỳ thế hệ (Egg → Neonate ~ 3–5 ngày) để khoá AppSheet; chọn ngày cùng Executive.
