# PLAN-001/003 · 7 · Phủ màn hình wireframe

> Sinh tự động từ `docs/genetics-platform-wireframes/source/project/canvas.json` (346 board: 146 board thật + 200 board bọc `All*`, `R?_*`, `PairP*` không phải màn). Mọi board thật phải có feature; board có task W1 ghi id task, còn lại được tách task ở wave W2+ theo feature. Kiểm lại bằng `scripts/check-screen-coverage.py` (tạo ở T0109).

Tổng: 146 board · 131 màn · 15 board tài liệu / component · chưa có feature: 0

| Trang canvas | Board | Tiêu đề (nguồn gốc · vai trò · cặp) | Loại | Feature | Task W1 |
|---|---|---|---|---|---|
| 1 · Cấu trúc & thiết kế | Layout | [Tài liệu] Bố cục app · Exec | Tài liệu / component | F-0205, F-0401, F-0402, F-0403, F-0407 | T0401 |
| 1 · Cấu trúc & thiết kế | Hierarchy | [AppSheet + mở rộng] Cây phân cấp dữ liệu · Exec | Màn | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| 1 · Cấu trúc & thiết kế | Lifecycle | [AppSheet + mở rộng] Vòng đời & chuyển giai đoạn · Exec | Màn | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| 1 · Cấu trúc & thiết kế | States | [AppSheet + mở rộng] Trạng thái batch & task · Exec | Màn | F-0401, F-0402, F-0403, F-0407 | T0103 |
| 1 · Cấu trúc & thiết kế | Foundations | [Tài liệu] Nền tảng thiết kế · Exec | Tài liệu / component | F-0101, F-0401, F-0402, F-0403, F-0407 | T0103, T0102, T0402 |
| 1 · Cấu trúc & thiết kế | UIStates | [Tài liệu] Trạng thái giao diện · Exec | Tài liệu / component | F-0205, F-0401, F-0402, F-0403, F-0407 | T0103, T0401, T0404 |
| 1 · Cấu trúc & thiết kế | BatchHead | [AppSheet + mở rộng] Component · Header batch · Exec | Màn | F-0401, F-0402, F-0403, F-0407, F-0603, F-0604, F-0801, F-0802, F-0902, F-0904, F-1101 | T0402 |
| 1 · Cấu trúc & thiết kế | BatchLineage | [AppSheet + mở rộng] Component · Tab dòng dõi · Exec | Màn | F-0401, F-0402, F-0403, F-0407, F-0601, F-0623 | W2+ (tách task ở kế hoạch sau) |
| 1 · Cấu trúc & thiết kế | BatchHistory | [AppSheet + mở rộng] Component · Tab lịch sử · Exec | Màn | F-0305, F-0401, F-0402, F-0403, F-0407, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 1 · Cấu trúc & thiết kế | MTabBar | [Mới] Component · Tab bar điện thoại · Exec | Màn | F-0201, F-0208, F-0308, F-0401, F-0402, F-0404, F-0406 | T0404 |
| 2 · Máy tính · Đăng nhập & Home | Login | [AppSheet + mở rộng] Đăng nhập · Worker, Exec, Manager, Admin · ⇄ P01 | Màn | F-0201, F-0208, F-0308, F-0402, F-0404, F-0406 | T0206 |
| 2 · Máy tính · Đăng nhập & Home | NoAccess | [Mới] Chưa có quyền · Worker, Exec, Manager, Admin | Màn | F-0201, F-0202, F-0205, F-0208, F-0308, F-0401, F-0402, F-0403, F-0404, F-0406 | T0206 |
| 2 · Máy tính · Đăng nhập & Home | Home | [AppSheet + mở rộng] Home máy tính · Worker · bản cũ để tham khảo | Màn | F-0404, F-0703, F-0901, F-0904, F-1003, F-1101, F-1102, F-1103, F-1104, F-1105 | W2+ (tách task ở kế hoạch sau) |
| 2 · Máy tính · Đăng nhập & Home | Settings | [Mới] Tài khoản & cài đặt · Exec, Manager, Admin · ⇄ P05 | Màn | F-0201, F-0205, F-0208, F-0308, F-0401, F-0402, F-0404, F-0406 | T0401 |
| 2 · Máy tính · Đăng nhập & Home | Search | [Mới] Tìm kiếm Ctrl K · Exec, Manager, Admin · ⇄ P03 P24 | Màn | F-0601, F-0625, F-0803 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggList | [AppSheet] Danh sách Egg production · Exec, Manager · ⇄ P06 | Màn | F-0302, F-0601, F-0603 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggDetail | [AppSheet] Egg · tab Thu trứng · Exec, Manager · ⇄ P07 P08 | Màn | F-0403, F-0407, F-0603, F-0604, F-0605, F-0606, F-0608, F-0623, F-0624, F-1101 | T0402 |
| 4 · Máy tính · Egg production | EggWeigh | [AppSheet] Egg · tab Cân ổ trứng · Exec · ⇄ P09 | Màn | F-0604, F-0605, F-0606, F-0607, F-0608, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggSexing | [AppSheet] Egg · tab Emerge & Sexing · Exec · ⇄ P10 | Màn | F-0604, F-0605, F-0606, F-0608, F-0623, F-0624, F-0803 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggLineage | [AppSheet + mở rộng] Egg · tab Dòng dõi · Exec, Manager | Màn | F-0601, F-0604, F-0606, F-0608, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggHistory | [AppSheet + mở rộng] Egg · tab Lịch sử · Exec, Manager, Admin | Màn | F-0305, F-0604, F-0606, F-0608, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggApproved | [AppSheet + mở rộng] Egg · Đã chốt · khoá · Exec, Manager, Admin | Màn | F-0604, F-0605, F-0606, F-0608, F-0617, F-0623, F-0624, F-0801, F-1002, F-1101, F-1106 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | Labels | [AppSheet + mở rộng] In nhãn · Exec | Màn | F-0801, F-0802 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggCreate | [AppSheet + mở rộng] Tạo egg production · Exec | Màn | F-0502, F-0601, F-0602, F-0611 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | EggEditRecord | [AppSheet + mở rộng] Sửa bản ghi · Exec · ⇄ P11 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | SexingRows | [AppSheet] Tạo dòng Emerge & Sexing · Exec | Màn | F-0605, F-0608, F-0803 | W2+ (tách task ở kế hoạch sau) |
| 4 · Máy tính · Egg production | CloseStage | [AppSheet + mở rộng] Chốt giai đoạn · Exec | Màn | F-0605, F-0608, F-0617, F-0618, F-0619, F-0620, F-0801, F-1002 | T0402 |
| 5 · Máy tính · Neonate | NeonateDetail | [AppSheet + mở rộng] Neonate · tab Thu neonate · Exec, Manager · ⇄ P13 P14 | Màn | F-0403, F-0603, F-0604, F-0605, F-0609, F-0610, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 5 · Máy tính · Neonate | NeonateWeigh | [AppSheet] Neonate · tab Cân mẫu · Exec · ⇄ P15 | Màn | F-0603, F-0604, F-0605, F-0609, F-0610 | W2+ (tách task ở kế hoạch sau) |
| 5 · Máy tính · Neonate | NeonateLineage | [AppSheet + mở rộng] Neonate · tab Dòng dõi · Exec, Manager | Màn | F-0603, F-0604, F-0609, F-0610 | W2+ (tách task ở kế hoạch sau) |
| 5 · Máy tính · Neonate | NeonateHistory | [AppSheet + mở rộng] Neonate · tab Lịch sử · Exec, Manager, Admin | Màn | F-0603, F-0604, F-0609, F-0610 | W2+ (tách task ở kế hoạch sau) |
| 5 · Máy tính · Neonate | NextBranch | [AppSheet] Chọn nhánh · Exec | Màn | F-0617, F-0618 | W2+ (tách task ở kế hoạch sau) |
| 5 · Máy tính · Neonate | RecordEditNeonate | [AppSheet + mở rộng] Sửa lần cân mẫu neonate · Exec · ⇄ P11 | Màn | F-0305, F-0603, F-0604, F-0605, F-0609, F-0610, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | LarvaeDetail | [AppSheet + mở rộng] Larvae · tab Quan sát · Exec, Manager · ⇄ P16 P17 | Màn | F-0403, F-0603, F-0604, F-0611, F-0612, F-0615, F-0616, F-0619, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | LarvaeFeed | [Mới] Larvae · tab Cho ăn · Exec | Màn | F-0002, F-0506, F-0605, F-0612, F-0615, F-0616, F-0619 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | LarvaeHarvest | [AppSheet + mở rộng] Larvae · tab Thu hoạch · Exec, Manager | Màn | F-0612, F-0614, F-0615, F-0616, F-0619, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | LarvaeLineage | [AppSheet + mở rộng] Larvae · tab Dòng dõi · Exec, Manager | Màn | F-0612, F-0615, F-0616, F-0619 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | LarvaeHistory | [AppSheet + mở rộng] Larvae · tab Lịch sử · Exec, Manager, Admin | Màn | F-0612, F-0615, F-0616, F-0619 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | NurseryDetail | [AppSheet + mở rộng] Nursery · tab Quan sát · Exec, Manager · ⇄ P18 | Màn | F-0403, F-0603, F-0604, F-0611, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | NurseryFeed | [Mới] Nursery · tab Cho ăn · Exec · ⇄ P18 | Màn | F-0002, F-0506, F-0605, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | NurseryLineage | [AppSheet + mở rộng] Nursery · tab Dòng dõi · Exec, Manager | Màn | F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | NurseryHistory | [AppSheet + mở rộng] Nursery · tab Lịch sử · Exec, Manager, Admin | Màn | F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | PupaeDetail | [AppSheet + mở rộng] Pupae · tab Mẫu quan sát · Exec, Manager · ⇄ P19 | Màn | F-0403, F-0603, F-0604, F-0611, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | PupaeHarvest | [Mới] Pupae · tab Thu hoạch · Exec, Manager | Màn | F-0612, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | PupaeLineage | [AppSheet + mở rộng] Pupae · tab Dòng dõi · Exec, Manager | Màn | F-0601, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620, F-0623 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | PupaeHistory | [AppSheet + mở rộng] Pupae · tab Lịch sử · Exec, Manager, Admin | Màn | F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | Conditions | [AppSheet + mở rộng] Điều kiện thí nghiệm · Exec | Màn | F-0605, F-0611 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | PupaeToEgg | [AppSheet + mở rộng] Chia nhộng vào lồng · Exec | Màn | F-0617, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | RecordEdit | [AppSheet + mở rộng] Sửa bản ghi · trong 24 giờ · Exec · ⇄ P11 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | RecordEditLarvae | [AppSheet + mở rộng] Sửa quan sát larvae · Exec · ⇄ P11 | Màn | F-0305, F-0605, F-0612, F-0615, F-0616, F-0619, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | RecordEditPupae | [AppSheet + mở rộng] Sửa thu hoạch nhộng · Exec · ⇄ P11 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 6 · Máy tính · Larvae · Nursery · Pupae | DeleteConfirm | [AppSheet + mở rộng] Xoá bản ghi · Exec, Admin · ⇄ P12 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | Import1 | [AppSheet] Import · 1 chọn loại · Exec, Admin | Màn | F-0901, F-0902, F-0904 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | Import2 | [AppSheet + mở rộng] Import · 2 kiểm tra · Exec, Admin | Màn | F-0901, F-0902, F-0904 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | Import3 | [AppSheet + mở rộng] Import · 3 kết quả · Exec, Admin | Màn | F-0901, F-0902, F-0904 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | ImportHistory | [Mới] Lịch sử import · Exec, Admin | Màn | F-0901, F-0902, F-0903, F-0904 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | DQ | [Mới] Data quality · Exec, Manager, Admin | Màn | F-0001, F-0002, F-0003, F-0006, F-0102, F-0105, F-0203, F-0205, F-0207, F-0304, F-0305, F-0306, F-0307, F-0308, F-0404, F-0407, F-0506, F-0601, F-0605, F-0608, F-0617, F-0618, F-0620, F-0622, F-0623, F-0701, F-0702, F-0703, F-0704, F-0801, F-0901, F-1002, F-1005, F-1101, F-1104, F-1303, F-1305, F-1408, F-1501 | W2+ (tách task ở kế hoạch sau) |
| 7 · Máy tính · Import & Data quality | ImportUndo | [Mới] Hoàn tác import · Exec, Admin | Màn | F-0901, F-0902, F-0903, F-0904 | W2+ (tách task ở kế hoạch sau) |
| 8 · Máy tính · Lịch sử · Lineage · Mở lại batch | History | [AppSheet + mở rộng] Lịch sử thay đổi · Exec, Manager, Admin | Màn | F-0305, F-0621, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 8 · Máy tính · Lịch sử · Lineage · Mở lại batch | Lineage | [AppSheet + mở rộng] Truy xuất dòng dõi · Exec, Manager, Admin | Màn | F-0601, F-0619, F-0620, F-0621, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 8 · Máy tính · Lịch sử · Lineage · Mở lại batch | ReopenBatch | [Mới] Mở lại batch (Admin) | Màn | F-0617, F-0621, F-0623, F-0624 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | Projects | [AppSheet] Dự án · Exec, Manager | Màn | F-1401, F-1402 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | ProjectDetail | [AppSheet] Chi tiết dự án · Exec, Manager | Màn | F-1401, F-1402 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | MyTasks | [AppSheet + mở rộng] Task của tôi · Kanban · Exec · ⇄ P22 P23 P26 | Màn | F-0308, F-1001, F-1003, F-1004, F-1401, F-1403, F-1404, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | TaskDetail | [AppSheet] Chi tiết task · Exec · ⇄ P21 P22 | Màn | F-0308, F-1003, F-1401, F-1403, F-1404, F-1405, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | Inbox | [AppSheet + mở rộng] Thông báo · Exec, Manager, Admin · ⇄ P04 | Màn | F-0301, F-0308, F-1401, F-1405 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | PMDashboard | [AppSheet] Dashboard PM · Manager, Admin | Màn | F-0306, F-1401, F-1408 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | PMReports | [AppSheet] Report theo kỳ · Manager | Màn | F-0306, F-1401, F-1408 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | Drive | [AppSheet + mở rộng] Drive · Exec, Manager | Màn | F-0307, F-1401, F-1407 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | ProjectCreate | [AppSheet + mở rộng] Tạo dự án · Exec | Màn | F-1401, F-1402 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | TaskCreate | [AppSheet] Tạo task · Exec · ⇄ P26 | Màn | F-1002, F-1003, F-1401, F-1403, F-1404, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBOverview | [Mới · Selective] Tổng quan Selective · Exec, Manager | Màn | F-1101, F-1503, F-1508 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBCage | [Mới · Selective] Lồng breeding · Ổ trứng · Exec · ⇄ P20 | Màn | F-0605, F-1502, F-1503 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBCageSampling | [Mới · Selective] Lồng breeding · Cân mẫu trứng · Exec | Màn | F-0605, F-1502, F-1503 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBCageHatch | [Mới · Selective] Lồng breeding · Neonate từ ổ ấp · Exec | Màn | F-0605, F-1502, F-1503 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBPhenotype | [Mới · Selective] Phenotyping · Exec | Màn | F-0901, F-1504, F-1505 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBSelection | [Mới · Selective] Chọn lọc MSB · Exec | Màn | F-1504, F-1506 | W2+ (tách task ở kế hoạch sau) |
| 11 · Máy tính · Selective Breeding | SBAllocation | [Mới · Selective] Phân bổ ruồi · Exec | Màn | F-1506, F-1507 | W2+ (tách task ở kế hoạch sau) |
| 12 · Máy tính · Quản trị | Users | [AppSheet + mở rộng] User & quyền · Admin | Màn | F-0205, F-0206, F-0207, F-0409 | W2+ (tách task ở kế hoạch sau) |
| 12 · Máy tính · Quản trị | SystemSettings | [Mới] Cấu hình hệ thống · Admin | Màn | F-0104, F-0105, F-0106, F-1304 | W2+ (tách task ở kế hoạch sau) |
| 12 · Máy tính · Quản trị | UserInvite | [Mới] Mời user · Admin | Màn | F-0205, F-0206, F-0207 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MLogin | [AppSheet + mở rộng] Đăng nhập · điện thoại · Worker, Exec · ⇄ P01 | Màn | F-0201, F-0208, F-0308, F-0402, F-0404, F-0406 | T0207, T0406 |
| 13 · Điện thoại · Vào app & việc hằng ngày | MHome | [AppSheet + mở rộng] Home điện thoại · quyền Worker | Màn | F-0404, F-0703, F-1003, F-1101, F-1105 | T0505, T0404 |
| 13 · Điện thoại · Vào app & việc hằng ngày | MTasks | [AppSheet + mở rộng] Việc của tôi · điện thoại · Worker, Exec · ⇄ P23 | Màn | F-0308, F-1001, F-1003 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MInbox | [AppSheet + mở rộng] Thông báo · điện thoại · Worker, Exec · ⇄ P04 | Màn | F-0201, F-0208, F-0301, F-0308, F-0402, F-0404, F-0406, F-1401, F-1405 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MProfile | [Mới] Tôi · điện thoại · Worker, Exec · ⇄ P05 | Màn | F-0201, F-0208, F-0308, F-0401, F-0402, F-0404, F-0406 | T0406 |
| 13 · Điện thoại · Vào app & việc hằng ngày | MSync | [Mới] Hàng chờ đồng bộ · Worker, Exec | Màn | F-0201, F-0208, F-0304, F-0308, F-0402, F-0404, F-0405, F-0406 | T0405 |
| 13 · Điện thoại · Vào app & việc hằng ngày | MSearch | [Mới] Tìm kiếm · điện thoại · Worker, Exec · ⇄ P03 | Màn | F-0601, F-0625, F-0803 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MScan | [AppSheet] Quét QR · Worker, Exec · ⇄ P24 | Màn | F-0405, F-0625, F-0803 | T0407 |
| 13 · Điện thoại · Vào app & việc hằng ngày | MScanResult | [AppSheet + mở rộng] Kết quả quét · Worker, Exec · ⇄ P24 | Màn | F-0405, F-0625, F-0803 | T0407 |
| 14 · Điện thoại · Nhập liệu breeding | MEggList | [AppSheet] Batch đang chạy · điện thoại · Worker, Exec · ⇄ P06 | Màn | F-0302, F-0601, F-0603 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MEggDetail | [AppSheet] Chi tiết Egg · điện thoại · Worker, Exec · ⇄ P07 | Màn | F-0403, F-0603, F-0604, F-0606, F-0608, F-0623, F-0624, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MEggCollect | [AppSheet] Nhập thu trứng · Worker, Exec · ⇄ P08 | Màn | F-0407, F-0605, F-0606 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MEggWeigh | [AppSheet] Cân ổ trứng · Worker, Exec · ⇄ P09 | Màn | F-0605, F-0607 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MSexing | [AppSheet] Nhập sexing · Exec · ⇄ P10 | Màn | F-0605, F-0608, F-0803 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MRecordEdit | [AppSheet + mở rộng] Sửa bản ghi · điện thoại · Worker, Exec · ⇄ P11 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MDeleteSheet | [AppSheet + mở rộng] Xoá · điện thoại · Worker, Exec · ⇄ P12 | Màn | F-0305, F-0605, F-0622 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MNeonateDetail | [AppSheet + mở rộng] Neonate · điện thoại · Worker, Exec · ⇄ P13 | Màn | F-0403, F-0603, F-0604, F-0609, F-0610, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MNeonateHarvest | [AppSheet] Nhập thu neonate · Worker, Exec · ⇄ P14 | Màn | F-0605, F-0609, F-0610 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MNeonateWeigh | [AppSheet] Cân mẫu neonate · Worker, Exec · ⇄ P15 | Màn | F-0605, F-0609, F-0610 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MLarvaeDetail | [AppSheet + mở rộng] Larvae · điện thoại · Exec · ⇄ P16 | Màn | F-0403, F-0603, F-0604, F-0612, F-0615, F-0616, F-0619, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MLarvaeObs | [AppSheet + mở rộng] Nhập quan sát larvae · Exec · ⇄ P17 | Màn | F-0611, F-0612, F-0615, F-0616, F-0619 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MNurseryObs | [AppSheet + mở rộng] Nhập quan sát nursery · Exec · ⇄ P18 | Màn | F-0611, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MPupaeSample | [AppSheet + mở rộng] Nhập mẫu pupae · Exec · ⇄ P19 | Màn | F-0611, F-0613, F-0614, F-0615, F-0616, F-0619, F-0620 | W2+ (tách task ở kế hoạch sau) |
| 14 · Điện thoại · Nhập liệu breeding | MSBClutch | [Mới · Selective] Nhập ổ trứng · điện thoại · Worker, Exec · ⇄ P20 | Màn | F-0605, F-1502, F-1503 | W2+ (tách task ở kế hoạch sau) |
| 15 · Điện thoại · Task được giao | MTaskDetail | [AppSheet] Task · điện thoại · Worker, Exec · ⇄ P21 | Màn | F-1403, F-1404, F-1405, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 15 · Điện thoại · Task được giao | MTaskStatus | [AppSheet] Đổi trạng thái task · Worker, Exec · ⇄ P22 | Màn | F-1403, F-1404, F-1405, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 12 · Máy tính · Quản trị | Documentation | [AppSheet + mở rộng] Tài liệu & hướng dẫn · Exec, Manager, Admin · ⇄ P25 | Màn | F-0206, F-0305, F-0307, F-0409, F-1201, F-1205 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MDocs | [AppSheet + mở rộng] Tài liệu · điện thoại · Worker, Exec · ⇄ P25 | Màn | F-0307, F-0409 | W2+ (tách task ở kế hoạch sau) |
| 13 · Điện thoại · Vào app & việc hằng ngày | MHomeExec | [AppSheet + mở rộng] Home điện thoại · quyền Executive · ⇄ P02 | Màn | F-0404, F-0703, F-1003, F-1101, F-1105 | W2+ (tách task ở kế hoạch sau) |
| 15 · Điện thoại · Task được giao | MTaskData | [AppSheet + mở rộng] Task nhập liệu · điện thoại · đang làm · Worker, Exec · ⇄ P26 | Màn | F-1002, F-1403, F-1404, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 15 · Điện thoại · Task được giao | MTaskDataDone | [AppSheet + mở rộng] Task nhập liệu · tự hoàn thành · Worker, Exec · ⇄ P26 | Màn | F-1002, F-1403, F-1404, F-1406 | W2+ (tách task ở kế hoạch sau) |
| 15 · Điện thoại · Task được giao | TaskFlow | [Tài liệu] Task · máy tính ⇄ điện thoại · Exec | Tài liệu / component | F-0308, F-0401, F-0402, F-0403, F-0407, F-1001, F-1003 | W2+ (tách task ở kế hoạch sau) |
| 12 · Máy tính · Quản trị | RolePerms | [AppSheet + mở rộng] Vai trò & quyền · Admin | Màn | F-0205, F-0206, F-0207 | T0201 |
| 10 · Máy tính · Dự án & task | RoutineSchedule | [Mới] Lịch việc định kỳ · Exec, Admin | Màn | F-1001, F-1003, F-1004 | W2+ (tách task ở kế hoạch sau) |
| 10 · Máy tính · Dự án & task | TaskCoverage | [Tài liệu] PM ⇄ Breeding & Selective · mọi công việc · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407, F-1002, F-1003, F-1004, F-1403, F-1404 | W2+ (tách task ở kế hoạch sau) |
| R1 · Worker · chỉ điện thoại | WorkerDesktop | [Mới] Worker mở web trên máy tính | Màn | F-0201, F-0208, F-0308, F-0402, F-0404, F-0406 | T0206 |
| R2 · Executive · điện thoại + máy tính | HomeExec | [Mới] Home · Executive · ⇄ P02 | Màn | F-0404, F-0703, F-1003, F-1101, F-1105 | W2+ (tách task ở kế hoạch sau) |
| R3 · Manager · chỉ xem, chỉ máy tính | HomeManager | [Mới] Home · Manager | Màn | F-0404, F-0703, F-1003, F-1101, F-1105 | W2+ (tách task ở kế hoạch sau) |
| R4 · Admin · chỉ máy tính | HomeAdmin | [Mới] Home · Admin | Màn | F-0404, F-0703, F-1003, F-1101, F-1105 | W2+ (tách task ở kế hoạch sau) |
| R · Vai trò · ai dùng gì, trên thiết bị nào | Roles | [Tài liệu] Vai trò · thiết bị · quyền · Exec | Tài liệu / component | F-0205, F-0206, F-0207, F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| R1 · Worker · chỉ điện thoại | RoleWorker | [Tài liệu] Vai trò Worker · tổng quan · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| R2 · Executive · điện thoại + máy tính | RoleExec | [Tài liệu] Vai trò Executive · tổng quan | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| R3 · Manager · chỉ xem, chỉ máy tính | RoleManager | [Tài liệu] Vai trò Manager · tổng quan · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| R4 · Admin · chỉ máy tính | RoleAdmin | [Tài liệu] Vai trò Admin · tổng quan · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| ⇄ · Điện thoại ⇄ máy tính · 26 cặp làm thay nhau | Pairs | [Tài liệu] Cặp điện thoại ⇄ máy tính · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| N · Nguồn gốc: có sẵn trong AppSheet hay mới | Origin | [Tài liệu] Nguồn gốc: AppSheet hay mới · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| 1 · Cấu trúc & thiết kế | RoleSheet | [Tài liệu] Trang vai trò (component, đổi prop role) · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| 0 · Bản đồ flow | Main | [Tài liệu] Bản đồ flow · máy tính và điện thoại · Exec | Tài liệu / component | F-0401, F-0402, F-0403, F-0407 | W2+ (tách task ở kế hoạch sau) |
| 0 · Bản đồ flow | Parity | [Tài liệu] Điện thoại ↔ máy tính · Exec | Tài liệu / component | F-0002, F-0401, F-0402, F-0403, F-0407, F-0601, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 0 · Bản đồ flow | AppSidebar | [AppSheet + mở rộng] Component · Sidebar · Exec | Màn | F-0205, F-0401, F-0402, F-0403, F-0407 | T0401 |
| 9 · Máy tính · Báo cáo & phân tích | Reports | [AppSheet + mở rộng] Báo cáo & export · Exec, Manager, Admin | Màn | F-0306, F-1101, F-1102, F-1103, F-1104, F-1408 | W2+ (tách task ở kế hoạch sau) |
| 9 · Máy tính · Báo cáo & phân tích | Analytics | [Mới] Phân tích KPI · Manager | Màn | F-0002, F-0601, F-1101, F-1102, F-1103, F-1104 | W2+ (tách task ở kế hoạch sau) |
| 9 · Máy tính · Báo cáo & phân tích | BreedDashboard | [AppSheet + mở rộng] Dashboard breeding · Exec, Manager, Admin | Màn | F-1101, F-1102, F-1103, F-1104 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | ContainerDetail | [AppSheet + mở rộng] Chi tiết lồng BC01 · Exec, Manager, Admin | Màn | F-0307, F-0502, F-0503, F-0505, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | StrainsManager | [AppSheet + mở rộng] Dòng giống · Manager chỉ xem, không có nút thêm, sửa | Màn | F-0403, F-0502, F-0503, F-0507, F-1101 | T0504 |
| 3 · Máy tính · Dòng giống & master data | Strains | [AppSheet + mở rộng] Dòng giống · Exec, Manager, Admin | Màn | F-0403, F-0502, F-0503, F-0507, F-1101 | T0504, T0502 |
| 3 · Máy tính · Dòng giống & master data | StrainDetail | [AppSheet + mở rộng] Dòng TMA · các thế hệ · Exec, Manager, Admin | Màn | F-0403, F-0502, F-0503, F-0507, F-1101 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | Generation | [AppSheet + mở rộng] Thế hệ TMA_F7 · Exec, Manager, Admin | Màn | F-0307, F-0403, F-0502, F-0503, F-0504, F-0505, F-0507, F-0601, F-0617, F-1203 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | Master | [AppSheet] Master data · Strain & Generation · Exec, Manager, Admin | Màn | F-0307, F-0501, F-0502, F-0503, F-0505, F-0507, F-1501, F-1502 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | MasterContainers | [AppSheet + mở rộng] Master data · Container · Exec, Manager, Admin | Màn | F-0307, F-0502, F-0503, F-0505, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | MasterDiets | [Mới] Master data · Diet · Exec, Manager, Admin | Màn | F-0307, F-0502, F-0503, F-0505, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | Protocol | [Mới] Protocol · Exec, Manager, Admin | Màn | F-0006, F-0502, F-0503, F-0506, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | KpiDefs | [AppSheet + mở rộng] Định nghĩa KPI · Exec, Manager, Admin | Màn | F-0002, F-0502, F-0503, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | AddGeneration | [AppSheet] Thêm generation · Admin | Màn | F-0502, F-0503, F-0504, F-0507 | W2+ (tách task ở kế hoạch sau) |
| 3 · Máy tính · Dòng giống & master data | ProtocolVersion | [Mới] Tạo version protocol · Admin | Màn | F-0006, F-0502, F-0503, F-0506, F-0507 | W2+ (tách task ở kế hoạch sau) |
