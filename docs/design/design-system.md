# Design system · Genetics Data Platform

> Nguồn: bộ wireframe Genetics Platform Wireframes (346 màn) và file `ui.css` của nó — các giá trị dưới đây được lấy từ đó.
> Áp dụng cho web và mobile (cả hai: React + shadcn/ui + Tailwind 4, ADR-0010).
> Token là **nguồn duy nhất**: nằm ở `packages/design-tokens`, sinh `web.css` (`@theme` + biến shadcn) cho cả hai app. Không viết mã màu hex trong component.

## 1. Nguyên tắc

1. **Số liệu là nhân vật chính.** Màn hình phục vụ đọc và nhập số đo. Số to, căn phải, `tabular-nums`, đơn vị luôn đi kèm.
2. **Mã là định danh.** Mã batch / cá thể (`TMA_F7_BC01`) luôn hiện bằng font mono, bấm được, copy được.
3. **Một màu chính, dùng tiết kiệm.** Xanh Entobel `#013db3` cho hành động chính, trạng thái đang chọn, link. Các màu khác mang nghĩa (trạng thái, dòng), không trang trí.
4. **Bề mặt phẳng, phân lớp bằng nền nhạt.** Thẻ số liệu không viền, nền tông nhạt; bảng và form có viền mảnh. Bóng đổ chỉ cho lớp nổi (dialog, menu, toast).
5. **Trạng thái nói bằng chữ, không chỉ bằng màu.** Badge luôn có nhãn; nút tắt luôn có lý do.
6. **Điện thoại là công cụ hiện trường.** Nút lớn, chữ số lớn, hành động chính ở đáy màn hình trong tầm ngón cái.

## 2. Nền tảng: dùng gì ở đâu

| | Web | Mobile |
|---|---|---|
| Thư viện | shadcn/ui CLI 4, primitive **Base UI** (đã chốt, ADR-0009) + Tailwind 4, icon lucide-react; primitive nằm trong `packages/ui` dùng chung | Cùng `packages/ui` (web-first PWA, ADR-0010); component bố cục điện thoại riêng trong `apps/mobile/src/components/mobile` |
| Token | `@import "@genetics/design-tokens/web.css"` trong `globals.css` (Tailwind 4 `@theme`) | như web |
| Font | Inter, JetBrains Mono (tự host woff2) | như web (tự host, precache trong service worker) |

Dùng chung token, quy tắc, primitive shadcn và component nghiệp vụ chung (`packages/ui`). Component bố cục (sidebar web, tab bar điện thoại, PhoneTile…) hiện thực riêng cho mỗi app.

## 3. Màu

### 3.1 Màu nền tảng (biến shadcn)

Hex là giá trị chuẩn trong `tokens.json`. Cả web và mobile dùng Tailwind 4 + shadcn CLI 4: script `build-tokens` sinh biến OKLCH / `@theme` từ hex. Cột HSL chỉ để tham khảo.

| Token | Hex | HSL | Dùng cho |
|---|---|---|---|
| `background` | `#ffffff` | 0 0% 100% | Nền trang web |
| `foreground` | `#0a0a0b` | 240 4.8% 4.1% | Chữ chính |
| `primary` | `#013db3` | 220 98.9% 35.3% | Nút chính, tab đang chọn, link, ring focus |
| `primary-hover` | `#0134a0` | 221 98.8% 31.6% | Hover nút chính |
| `primary-soft` | `#e8effd` | 220 84% 95.1% | Nền mục đang chọn (sidebar), avatar, badge Open |
| `primary-foreground` | `#ffffff` | | Chữ trên nền primary |
| `secondary` · `muted` · `accent` | `#f4f4f5` | 240 4.8% 95.9% | Nút phụ, nền tab group, hover |
| `muted-foreground` | `#5f5f69` | 240 5% 39.2% | Chữ phụ, nhãn bảng, mô tả (đạt 4.5:1 trên trắng) |
| `subtle-foreground` | `#71717a` | | Nhãn nhóm sidebar, chữ rất phụ (chỉ cỡ ≥ 11 px đậm) |
| `border` · `input` | `#e4e4e7` | 240 5.9% 90% | Viền thẻ, ô nhập, bảng |
| `border-soft` | `#f0f0f2` | | Đường kẻ giữa các dòng |
| `ring` | `#013db3` | 220 98.9% 35.3% | Focus |
| `destructive` | `#c81e1e` | 0 73.9% 45.1% | Nút xoá, dấu `*` bắt buộc |
| `success` | `#15803d` | 142 71.8% 29.2% | Nút / chỉ báo thành công, delta tăng |
| `warning` | `#d97706` | 32 94.6% 43.7% | Viền ô cảnh báo |
| `surface` | `#f6f7f9` | 220 20% 97.1% | Nền app điện thoại |
| `panel` | `#f8f9fb` | 220 27.3% 97.8% | Khối phụ (panel) trên web |
| `table-head` | `#fafafa` | | Nền hàng tiêu đề bảng, sidebar web |

### 3.2 Trạng thái (badge)

| Token | Nền | Chữ | Dùng cho |
|---|---|---|---|
| `status-open` | `#e8effd` | `#013db3` | Batch Open, task In progress |
| `status-pending` | `#fef3c7` | `#8a4b08` | Chờ (Pending, Under review, chờ đồng bộ) |
| `status-ok` | `#dcfce7` | `#166534` | Đã chốt, Completed, Đã nhập |
| `status-closed` | `#f4f4f5` | `#3f3f46` | Đóng, Cancelled, Chưa tới giờ |
| `status-error` | `#fee2e2` | `#991b1b` | Lỗi DQ, Trễ, Xung đột |
| `status-warning` | `#fff4e5` | `#9a4d00` | Cảnh báo DQ, sắp trễ |
| `status-outline` | `#ffffff` + viền `border` | `#3f3f46` | Nhãn trung tính |

Badge: cao 22 px, bo tròn hoàn toàn, chữ 12 px / 500, có thể có chấm tròn 6 px cùng màu chữ ở đầu.

Mapping trạng thái cố định (dùng ở mọi nơi):

| Đối tượng | Giá trị → token · nhãn |
|---|---|
| batch | `open` → open · "Open" · `closed` → ok · "Đã chốt" · `reopened` → pending · "Mở lại · còn n giờ" |
| task | `assigned` → closed · "Đã giao" · `in_progress` → open · "Đang làm" · `under_review` → pending · "Chờ kiểm tra" · `requires_amendment` → warning · "Cần sửa" · `pending` → pending · "Tạm dừng" · `completed` → ok · "Hoàn thành" · `cancelled` → closed · "Đã huỷ" |
| routine | `planned` → closed · "Chưa tới giờ" · `done` → ok · "Đã nhập" · `late` → error · "Trễ n′" · `missed` → error · "Bỏ lỡ" · `cancelled` → closed |
| dq | `error` → error · `warning` → warning · `ignored` → closed · "Đã bỏ qua" · `resolved` → ok |
| đồng bộ (mobile) | chờ gửi → pending · đã gửi → ok · xung đột → error |
| priority | Urgent → error · Important → warning · Normal → closed · Low → outline |

### 3.3 Màu dòng giống (strain badge)

Badge vuông bo 6 px, có ô vuông nhỏ 7 px cùng màu chữ ở đầu, chữ 12 px / 600.

| Dòng | Nền | Chữ |
|---|---|---|
| TMA | `#eef2ff` | `#3730a3` |
| TME | `#e3f5f2` | `#115e59` |
| REF | `#fff1e0` | `#8f4600` |
| MSA | `#fdeef6` | `#9d174d` |
| MSB | `#f3efff` | `#5b21b6` |
| MSC | `#e6f7fa` | `#155e75` |

Dòng mới thêm sau: chọn từ bảng mở rộng trong `tokens.json` (Admin gán màu khi tạo dòng), không tự sinh màu ngẫu nhiên.

### 3.4 Thẻ số liệu, cảnh báo, biểu đồ

| Nhóm | Token | Giá trị |
|---|---|---|
| Nền thẻ số (stat) | `stat`, `stat-blue`, `stat-green`, `stat-amber`, `stat-red`, `stat-violet`, `stat-teal`, `stat-gray` | `#f4f6fa`, `#edf2fc`, `#eaf6ef`, `#fcf4e6`, `#fcefee`, `#f2effc`, `#e8f5f3`, `#f4f4f6` |
| Thẻ số nổi bật (hero) | `stat-hero` | nền `#013db3`, chữ trắng, chữ phụ `#d3defa` |
| Delta | `delta-up` · `delta-down` · `delta-flat` · `delta-warn` | `#d5f0df`/`#14532d` · `#fadcdb`/`#8f1d1d` · `#e6e6eb`/`#3f3f46` · `#fbe7c6`/`#7a3e00` |
| Alert | `alert-info` · `alert-warn` · `alert-error` · `alert-ok` | nền `#f3f7ff` viền `#c9d8f7` chữ `#0a2a6b` · `#fffaf0`/`#f5d9a8`/`#6b3a00` · `#fff5f5`/`#f3c0c0`/`#7f1d1d` · `#f2fbf5`/`#bfe5cc`/`#14532d` |
| Dòng bảng | `row-error` · `row-warning` · `row-selected` | `#fff5f5` · `#fffaf0` · `#f3f7ff` |
| Sexing (bản đồ cốc) | `sex-female` · `sex-male` · `sex-pending` · `sex-warning` · `sex-current` | `#f4b6d2` · `#a9c3f5` · trắng viền đứt `#a1a1aa` · `#f59e0b` · `#013db3` |
| Biểu đồ (theo dòng) | `chart-tma` · `chart-tme` · `chart-ref` · `chart-msa` · `chart-msb` · `chart-msc` | `#4338ca` · `#0f766e` · `#c2410c` · `#be185d` · `#6d28d9` · `#0e7490` |
| Biểu đồ (một series) | `chart-1` | `#013db3`; series phụ `#93b0ea`; ngưỡng / mục tiêu `#d97706` nét đứt |

Biểu đồ: lưới ngang `#ececf0`, trục chữ 11 px `#5f5f69`, không viền khung. Màu series được kiểm cho người mù màu đỏ-lục (không đặt đỏ cạnh lục làm cặp so sánh).

## 4. Chữ

| Token | Cỡ / dòng | Đậm | Dùng cho |
|---|---|---|---|
| `display` | 30 / 38 | 600, `-0.02em` | Tiêu đề trang tài liệu |
| `h1` | 24 / 32 | 600, `-0.01em` | Tiêu đề trang |
| `h2` | 18 / 26 | 600 | Tiêu đề khối |
| `h3` | 15 / 22 | 600 | Tiêu đề thẻ |
| `body` | 14 / 20 | 400 | Chữ thường |
| `body-sm` | 13 / 18 | 400 | Bảng, form web, mô tả |
| `caption` | 12 / 16 | 400–500 | Nhãn phụ, badge |
| `overline` | 11–12 / 16 | 600, IN HOA, `+0.04–0.06em` | Nhãn nhóm sidebar, nhãn khối trên điện thoại |
| `stat` | 28 / 34 | 600, `-0.02em`, tabular | Số trên thẻ số |
| `stat-sm` | 22 / 28 | 600 | Số trên thẻ nhỏ / điện thoại |
| `code` | 13 | 500, JetBrains Mono | Mã batch, mã cá thể, số liệu kỹ thuật |
| `m-title` | 16 / 22 | 600 | Tiêu đề màn điện thoại |
| `m-input` | 16 | 400–600 | Ô nhập số trên điện thoại (≥ 16 để iOS không zoom) |

- Font: **Inter** (400, 500, 600, 700) cho mọi chữ; **JetBrains Mono** (400, 500) cho mã và số kỹ thuật. Cả hai cần bộ ký tự tiếng Việt. Tự host font (không phụ thuộc Google Fonts lúc chạy, để PWA dùng được offline).
- Số trong bảng, thẻ số, ô nhập: `font-variant-numeric: tabular-nums`.

## 5. Khoảng cách, kích thước, bo góc, bóng

**Lưới 4 px.** Bậc thường dùng: 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40.

| Bố cục | Giá trị |
|---|---|
| Sidebar web | 248 px |
| Topbar web | padding 12 / 32 |
| Vùng nội dung web | padding 24 / 32 / 40, rộng tối đa 1240 px, khoảng giữa khối 24 |
| Khoảng giữa thẻ số | 12 |
| Màn điện thoại | thiết kế 390 × 844 (wireframe 440 pt), padding 16, khoảng giữa khối 14 |
| Header điện thoại | cao tối thiểu 60, nút icon 44 × 44 |
| Footer hành động điện thoại | padding 12 / 16 / 20, nền trắng, viền trên |

| Thành phần | Cao |
|---|---|
| Nút `sm` · `md` · `lg` · `xl` | 32 · 36 · 44 · 52 |
| Ô nhập · ô nhập lớn | 36 · 48 |
| Segmented control điện thoại | 48 |
| Dòng danh sách điện thoại | ≥ 56 |
| Tab bar điện thoại | 60 + vùng an toàn |
| Vùng chạm tối thiểu (mobile) | 44 × 44; hành động chính 48 |

| Bo góc | Giá trị | Dùng cho |
|---|---|---|
| `radius-sm` | 6 | Strain badge, checkbox, kbd |
| `radius-md` | 8 | Nút, ô nhập, mục sidebar |
| `radius-lg` | 10 | Alert, tab group, nút / ô `xl` |
| `radius-xl` | 12 | Card, khung bảng, thẻ số nhỏ |
| `radius-2xl` | 14 | Panel, thẻ số, dialog, thẻ điện thoại |
| `radius-sheet` | 20 | Bottom sheet điện thoại (góc trên) |
| `radius-full` | 999 | Badge, chip, avatar, switch, thanh tiến độ |

| Bóng | Giá trị | Dùng cho |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(10,10,11,.1)` | Tab đang chọn trong tab group |
| `shadow-overlay` | `0 20px 50px rgba(9,9,11,.25)` | Dialog |
| `shadow-toast` | `0 10px 30px rgba(9,9,11,.25)` | Toast |
| `shadow-sheet` | `0 -8px 30px rgba(10,10,11,.18)` | Bottom sheet |
| Scrim | `rgba(9,9,11,.5)` | Nền sau dialog / sheet |

## 6. Component

### 6.1 Primitive (shadcn / Reusables) và biến thể bắt buộc

| Component | Biến thể |
|---|---|
| Button | `default` (primary), `outline`, `ghost`, `secondary`, `destructive`, `destructive-outline` (viền đỏ nhạt, chữ đỏ), `success`; size `sm`, `default`, `lg`, `xl`, `icon` |
| Badge | theo token §3.2; `strain` theo §3.3 |
| Input · Textarea · Select · Combobox | trạng thái `error` (viền `destructive`), `warning` (viền `warning`); hậu tố đơn vị |
| Tabs | `pill` (nền muted, mục chọn nền trắng + `shadow-xs`) cho bộ lọc; `underline` (gạch 2 px primary) cho tab chi tiết |
| Card · Panel | Card có viền; Panel không viền, nền `panel` |
| Table | khung bo `radius-xl`, đầu bảng nền `table-head`, chữ 13 px, dòng cách 10 / 12 |
| Dialog · Sheet · Drawer | Dialog web; Sheet / bottom sheet điện thoại |
| Alert · Toast (sonner) | §3.4 |
| Switch · Checkbox · Radio | Switch 36 × 20, primary khi bật |
| Command (cmdk) | Tìm Ctrl K |
| Calendar · DatePicker | tuần bắt đầu thứ Hai, `vi` |
| Progress | cao 8 (web), 6 (điện thoại), primary hoặc success |
| Avatar | chữ viết tắt 2 ký tự, nền `primary-soft`, chữ primary |
| Skeleton | gradient `#efeff2 → #f7f7f9` |

### 6.2 Component nghiệp vụ (`components/common`)

| Component | Mô tả | Board tham chiếu |
|---|---|---|
| `BatchCode` | Mã mono, bấm mở batch, có nút copy khi hover; mobile: chữ 13 | EggDetail, BatchHead |
| `StrainBadge` | Badge dòng theo §3.3 | Strains |
| `StatusBadge` | Nhận `kind` + `value`, tự map token và nhãn §3.2 | States |
| `StageStepper` | Egg → Neonate → Larvae / Nursery → Pupae → Egg; bước xong (nền muted), bước hiện tại (primary), bước sau (viền) | Lifecycle, BatchHead |
| `StatCard` | Nhãn (12 / 500) → số (28) + đơn vị (14) → dòng phụ / delta / sparkline; tông nền theo nghĩa | Foundations, HomeExec |
| `KpiDelta` | Pill tăng / giảm / phẳng / cảnh báo | BreedDashboard |
| `BatchHead` | Mã, dòng, giai đoạn, thời gian, trạng thái, nút chính (Chốt, In nhãn), stepper | BatchHead |
| `BlockerList` | Danh sách điều kiện còn thiếu cho nút Chốt: ✓ / ✗ / đang chờ | CloseStage |
| `ReasonDialog` | Ô lý do bắt buộc (≥ 5 ký tự) khi sửa / xoá bản ghi người khác, bỏ qua DQ, mở lại | EggEditRecord, DeleteConfirm |
| `RecordTable` | DataTable cho bản ghi đo lường: người nhập, nguồn (điện thoại / web / import), nút sửa / xoá theo `can` | EggDetail |
| `Timeline` | Lịch sử thay đổi: chấm 28 px, đường nối, giá trị cũ gạch đỏ → mới xanh | History, BatchHistory |
| `LineageChain` | Chuỗi node batch, mũi tên có lượng chuyển | BatchLineage, Lineage |
| `CupMap` | Bản đồ 20 × 15 cốc sexing, ô co giãn theo khung | EggSexing |
| `EmptyState` · `ErrorState` · `NoAccess` | Icon, tiêu đề, một câu, một hành động | UIStates, NoAccess |
| `Can` | Ẩn con nếu thiếu quyền | — |
| Mobile (`apps/mobile/src/components/mobile`): `PhoneTile` | Ô nhập liệu trên Home: icon 34 px nền tông, tên form, việc còn lại | MHome |
| Mobile: `MListRow` | Dòng ≥ 56 px: icon, tiêu đề, phụ đề mono, hạn / trạng thái, chevron | MTasks |
| Mobile: `NumberField` | Ô số 48 px, đơn vị, nút +/-, chấp nhận dấu phẩy | MEggWeigh |
| Mobile: `SegmentedControl` | 48 px, mục chọn nền primary | MNeonateHarvest |
| Mobile: `OfflineBanner` · `SyncBadge` | Báo offline, số bản ghi chờ, xung đột | MSync |

## 7. Nội dung và ngôn ngữ

- Giao diện **tiếng Việt** mặc định, có tiếng Anh. Thuật ngữ chuyên môn giữ tiếng Anh khi team đang dùng: batch, Egg production, Neonate, Larvae, Nursery, Pupae, sexing, FCR, KPI, protocol.
- Câu ngắn, chủ động, nói việc người dùng làm: "Chốt giai đoạn", "Lưu & nhập tiếp", không "Submit".
- Số: dấu phẩy thập phân, dấu chấm hàng nghìn (`0,0291 mg`, `11.140 con`, `92,0 %`). Đơn vị cách số một khoảng. Tỉ lệ hiển thị dạng %, một chữ số thập phân.
- Ngày `dd/mm/yyyy`, giờ `HH:mm` 24 giờ; ngày tương đối khi gần ("hôm nay 10:05", "hôm qua").
- Từ cố định (không dùng từ đồng nghĩa khác):

| Dùng | Không dùng |
|---|---|
| Chốt (giai đoạn) | Đóng, Approve, Hoàn tất batch |
| Mở lại | Unlock, Re-open |
| Bản ghi | Record, dòng dữ liệu |
| Dòng giống | Strain (trong câu tiếng Việt) |
| Thế hệ | Generation (trong câu tiếng Việt) |
| Việc của tôi | My tasks |
| Lý do | Ghi chú (khi bắt buộc giải thích) |

- Thông báo lỗi: nói chuyện gì xảy ra + làm gì tiếp ("Batch TMA_F7_BC01 đã chốt lúc 10:52. Liên hệ Admin nếu cần mở lại."). Không hiện mã kỹ thuật, trừ `trace_id` ở dòng nhỏ.

## 8. Trạng thái giao diện (bắt buộc cho mọi màn có dữ liệu)

| Trạng thái | Cách hiện | Board |
|---|---|---|
| Đang tải | Skeleton giữ đúng bố cục; không spinner toàn trang | UIStates |
| Trống | EmptyState + hành động đầu tiên (nếu có quyền) | UIStates |
| Lỗi | ErrorState + Thử lại + `trace_id` | UIStates |
| Không có quyền | NoAccess, không lộ dữ liệu | NoAccess |
| Offline (mobile) | OfflineBanner, nút lưu vẫn bật | MSync |
| Xung đột | Alert error trên bản ghi, lựa chọn Sửa / Bỏ | MSync |
| Nút tắt có lý do | Nút `disabled` + tooltip / dòng phụ "Còn thiếu: …" | CloseStage |
| Hành động phá huỷ | Dialog xác nhận nêu rõ thứ bị xoá; nút `destructive`; điện thoại có hoàn tác 10 giây | DeleteConfirm, MDeleteSheet |

## 9. Khả năng truy cập

- Tương phản chữ thường ≥ 4.5:1, chữ lớn (≥ 24 px hoặc ≥ 19 px đậm) ≥ 3:1. Các cặp token ở §3 đã chọn để đạt mức này trên nền tương ứng; thêm cặp mới phải kiểm lại.
- Focus nhìn thấy được: ring 2 px `ring`, offset 1 px.
- Không truyền nghĩa chỉ bằng màu (bản đồ cốc có chú thích và `title` từng ô; trạng thái luôn có chữ).
- Icon không có chữ phải có `aria-label`.
- Mobile: chữ ≥ 14 px cho nội dung, ≥ 16 px trong ô nhập.

## 10. Tham chiếu UI

| Board trên canvas | Dùng để |
|---|---|
| Foundations | Màu, chữ, thẻ số, nút |
| UIStates · States | Trạng thái giao diện; luồng trạng thái batch và task |
| Layout · Hierarchy | Bố cục app, cây phân cấp dữ liệu |
| Main | Bản đồ flow máy tính và điện thoại |
| Roles · RolePerms | Vai trò, quyền theo nền tảng, màn và nút |
| Pairs (P01–P26) | Cặp màn điện thoại ⇄ máy tính làm cùng một việc |
| TaskFlow · TaskCoverage · RoutineSchedule | Task giao trên máy tính, làm trên điện thoại; mọi loại việc |
| Các board màn hình | Bố cục, nội dung, nhãn cụ thể từng màn |

Những thứ **chỉ có trong wireframe, không làm trong app**: nhãn nguồn gốc (AppSheet / mở rộng / mới), khung điện thoại và thanh trạng thái giả, ghi chú sticky, các board bọc (`All*`, `R?_*`, `PairP*`).

Khi wireframe và tài liệu này khác nhau về giá trị token, **tài liệu này thắng**; khi khác về nội dung nghiệp vụ (trường nào, nút nào), hỏi lại và cập nhật một trong hai.

## 11. Định dạng token

`packages/design-tokens/tokens.json` (rút gọn):

```json
{
  "color": {
    "primary": { "value": "#013db3" },
    "primary-hover": { "value": "#0134a0" },
    "primary-soft": { "value": "#e8effd" },
    "foreground": { "value": "#0a0a0b" },
    "muted-foreground": { "value": "#5f5f69" },
    "border": { "value": "#e4e4e7" },
    "status": {
      "open": { "bg": "#e8effd", "fg": "#013db3" },
      "ok": { "bg": "#dcfce7", "fg": "#166534" },
      "error": { "bg": "#fee2e2", "fg": "#991b1b" }
    },
    "strain": {
      "TMA": { "bg": "#eef2ff", "fg": "#3730a3", "chart": "#4338ca" }
    }
  },
  "radius": { "sm": 6, "md": 8, "lg": 10, "xl": 12, "2xl": 14, "sheet": 20 },
  "font": {
    "sans": "Inter, ui-sans-serif, system-ui, sans-serif",
    "mono": "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
  }
}
```

Script `build-tokens` sinh: `web.css` (Tailwind 4 `@theme` + biến CSS cho shadcn, dùng cho web và mobile) và `tokens.ts` (cho Recharts và code cần giá trị số). File sinh ra không sửa tay.
