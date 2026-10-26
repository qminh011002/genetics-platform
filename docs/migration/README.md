# PLAN-001 · Migration Discovery & Master Backlog

Bộ tài liệu lập kế hoạch migrate Genetics Data Platform từ AppSheet (Maintenance Breeding, Project Management, thiết kế Selective Breeding) sang monorepo React + TypeScript (web), Expo PWA (mobile), FastAPI + PostgreSQL (backend). Ngày lập: 26/10/2026. Nguồn: thư mục handover `Genetics Data Platform/` và `docs/` (kiến trúc, design system, wireframe 346 màn).

| File | Nội dung | Dùng khi |
|---|---|---|
| [01-inventory.md](01-inventory.md) | Kiểm kê AppSheet: app, workbook / bảng, luật (mã, gate, KPI, validation, quyền), view, action, bot, template, file, hạ tầng / ETL, dữ liệu lịch sử, tài liệu handover, thứ bỏ | Cần biết "AppSheet đang có gì" (mã `INV-xx`) |
| [02-traceability-matrix.md](02-traceability-matrix.md) | Bảng / view / action / công thức / validation / quyền / file / hạ tầng → thành phần đích + feature; kiểm tra phủ | Review thiết kế, chứng minh không bỏ sót |
| [03-feature-backlog.md](03-feature-backlog.md) | 129 feature theo 16 epic (E00–E15) với nguồn gốc, nền, ưu tiên, phụ thuộc, nguồn, phạm vi, tiêu chí xong | Tách task (`docs/tasks/workflow.md` §4) |
| [04-dependency-map.md](04-dependency-map.md) | Phụ thuộc epic và feature (mermaid), đường găng, nhóm làm song song, phụ thuộc vào quyết định | Xếp lịch, chia người / agent |
| [05-waves.md](05-waves.md) | 7 wave W0–W6 ↔ mốc M0–M6, lịch giả định so với go-live AppSheet 04/01/2027, ưu tiên trong wave, P2 để sau | Kế hoạch tổng |
| [07-screen-coverage.md](07-screen-coverage.md) | 146 board wireframe thật → feature → task W1; chứng minh dùng hết thiết kế | Kiểm phủ UI |
| [06-risks-unknowns-decisions.md](06-risks-unknowns-decisions.md) | 20 rủi ro, 23 điều chưa biết, D1–D8 (đề xuất) + 17 quyết định mới, việc làm ngay | Họp chốt với Genetics Manager / Executive / IT |

Nguyên tắc đã áp dụng: không bịa chức năng AppSheet (mọi dòng `AS` / `AS+` trỏ về INV hoặc board wireframe có nhãn nguồn gốc); không chi tiết hoá task; tên người không đưa vào tài liệu.

Bước kế tiếp (PLAN-002): tách feature P0 của W0–W1 thành task theo mẫu `workflow.md` §4.4, tạo `docs/tasks/epics/E00…E05.md` và `docs/tasks/board.md`; viết ADR cho D1, D2, D3.
