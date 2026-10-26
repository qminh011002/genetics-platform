# ADR-0016 · Model dữ liệu chung cho Maintenance Breeding và Selective Breeding (D2)

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
MB có 5 bảng cha theo giai đoạn + `*_ref` một cha; ERD SB có 22 bảng với 26 lỗi xác minh (PLAN-001 RSK-12). Cả hai cùng khái niệm batch → stage → đo lường, nhưng SB thêm scheme / line / crate, dữ liệu cá thể, chọn lọc. Blueprint ước tính model chung tốn thêm 1–2 tuần thiết kế.

## Phương án
| | Port 1:1 MB rồi gộp sau | **Model chung ngay (batch + batch_transfer + egg_clutch + individual + selection_run)** |
|---|---|---|
| Thời gian tới MB go-live | nhanh hơn ~1–2 tuần | chậm hơn chừng đó |
| SB | dựng lại 22 bảng + bộ KPI thứ hai | thêm cột / bảng nhỏ; KPI version theo scheme |
| Rủi ro | hai định nghĩa KPI (lỗi hiện tại của AppSheet lặp lại) | chốt D7 / F-1501 trước khi làm SB |

## Quyết định đề xuất
Model chung (`overview.md` §6), nhưng **chỉ hiện thực phần MB ở W1–W2**; cột / bảng SB (`scheme_id`, `line_id`, `larva_weight`, `drying_record`, `selection_*`) thêm bằng migration ở W6 sau F-1501. `batch_transfer` n–n và `egg_clutch.type` làm từ đầu vì migrate MB cũng cần (pupae gộp cage, nursery không cage).

## Hệ quả
Migration MB không phải sửa lại khi vào SB; `kpi_definition` có `scheme` tuỳ chọn. Xem lại nếu F-1501 cho thấy SB cần đơn vị sinh học khác hẳn batch (ví dụ cá thể là đơn vị chính từ đầu).

## Tham chiếu
PLAN-001 `02-traceability-matrix.md` §A.3, `06-risks-unknowns-decisions.md` RSK-12, DN-5…DN-9; blueprint "Data model cải tiến".
