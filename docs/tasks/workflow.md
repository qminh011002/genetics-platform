# Quy trình làm việc · task, nhánh, review, quyết định

> Dành cho người và agent AI (ví dụ Fable) cùng làm trên repo `genetics-platform`.
> Mục tiêu: mỗi task đủ rõ để một agent làm từ đầu tới cuối mà không phải đoán, và mỗi thay đổi kiểm chứng được.

## 1. Nguồn sự thật

Thứ tự ưu tiên khi có mâu thuẫn:

1. Quyết định đã chốt trong `docs/decisions/` (ADR).
2. `docs/architecture/overview.md`.
3. Các tài liệu kiến trúc còn lại (`backend.md`, `web.md`, `mobile.md`, `api-standards.md`, `infrastructure.md`, `quality-standards.md`) và `docs/design/design-system.md`.
4. Wireframe trên canvas Genetics Platform Wireframes (bố cục, nội dung màn hình).
5. Blueprint (hiện trạng AppSheet, lý do của từng luật).

Thấy mâu thuẫn: **không tự chọn**. Ghi vào mục "Câu hỏi" của task, đặt task `blocked`, nêu phương án đề xuất.

## 2. Cấu trúc thư mục

```
docs/
├─ architecture/ …                 # tài liệu kiến trúc (+ research-references.md, open-questions.md)
├─ design/design-system.md
├─ decisions/                      # ADR-0001 … ADR-0016 (xem decisions/README.md)
├─ migration/                      # PLAN-001
├─ tasks/initialization/           # PLAN-002 blueprint, setup-guide, dependency-map, acceptance-checklist
├─ data/                           # data dictionary, định nghĩa KPI đã ký, bảng đối chiếu migrate
└─ tasks/
   ├─ workflow.md                  # file này
   ├─ board.md                     # bảng tổng: mọi task, trạng thái, người làm (cập nhật mỗi PR)
   ├─ epics/
   │  ├─ E01-foundation.md         # mục tiêu, phạm vi, tiêu chí xong của epic, danh sách task
   │  └─ …
   └─ items/
      ├─ E01/T0101-monorepo-skeleton.md
      └─ …
```

## 3. Epic và mốc

Epic bám theo lộ trình ở `overview.md` §12. Mốc (M) là điểm có thể demo cho user.

| Epic | Nội dung | Phụ thuộc | Mốc |
|---|---|---|---|
| E00 · Chốt logic | Data dictionary (cột, đơn vị, khoảng hợp lệ), định nghĩa KPI có version, chuẩn mã, bộ dữ liệu test từ Data Migration.xlsx, kết quả KPI AppSheet để so | — | M0 |
| E01 · Nền tảng repo | Monorepo pnpm + Turborepo, backend uv, Docker Compose, CI, môi trường local / staging, `.env.example`, pre-commit | — | M1 |
| E02 · Đăng nhập & phân quyền | Entra app registrations, xác thực JWT, `app_user`, `auth.*`, seed quyền và 4 vai trò, `auth.has_perm()`, RLS, `/me`, `/me/permissions`, màn Users, Vai trò & quyền, quyền riêng | E01 | M1 |
| E03 · Xuyên suốt | Problem+json, danh mục mã lỗi, phân trang cursor, `If-Match`, idempotency, audit trigger, trace id, health check, job queue | E01 | M1 |
| E04 · Design system & khung app | `design-tokens`, shadcn + theme, AppShell web (sidebar, topbar, Ctrl K), khung PWA web-first (tab bar, manifest, service worker qua vite-plugin-pwa, adapter nền tảng), `packages/ui`, outbox và sync engine | E01 | M1 |
| E05 · Dữ liệu tham chiếu | strain, generation, container, diet, protocol + version, KPI definition, form_def; màn Dòng giống, Thế hệ, Master data | E02, E03 | M1 |
| E06 · Breeding lõi | batch, sinh mã, đo lường (mọi form, web + mobile), gate, đặt điều kiện, chốt (một transaction), chọn nhánh, mở lại 48 giờ, lineage, luật sửa 24 giờ, màn danh sách / chi tiết / form | E05, E04 | M2 |
| E07 · Data quality | Luật DQ (form, import, đêm), `dq_issue`, chặn chốt, bỏ qua có lý do, màn DQ | E06 | M2 |
| E08 · Nhãn & quét | Sinh QR / PDF nhãn (batch, cốc sexing), `/lookup`, màn quét trên điện thoại | E06 | M2 |
| E09 · Import | Template, upload, parse, validate, preview, commit, undo 24 giờ, lịch sử | E06, E07 | M2 |
| E10 · Việc & lịch | `routine_template`, sinh việc đêm, `done_qty` trong transaction, trễ / bỏ lỡ, phân công batch, Việc của tôi (web + mobile), % đúng lịch | E06 | M2 |
| E11 · Phân tích & dashboard | View `analytics`, dashboard 5 giai đoạn, phân tích KPI theo thế hệ, export, Home theo vai trò | E06 | M3 |
| E12 · Migrate dữ liệu MB | Schema `legacy`, đọc warehouse, biến đổi sang `core`, tính lại KPI, báo cáo đối chiếu 5 nhóm | E06, E00 | M3 |
| E13 · Cutover & vận hành | Backup + test restore, giám sát, chạy song song, đào tạo, khoá AppSheet, tắt ETL / Metabase, đổi secret cũ | E11, E12 | M4 |
| E14 · Project Management | project, task (general / data), luồng trạng thái, chat có read receipt, file, report, PM dashboard, migrate PM qua AppSheet API | E02, E10 | M5 |
| E15 · Selective Breeding | Model SB trên `batch` chung, ổ trứng, phenotype (import Ohaus), selection run, phân bổ | E06, E09 | M6 |

E00 chạy song song với E01–E04; kết quả của E00 là đầu vào bắt buộc của task KPI trong E06 / E11.

## 4. Task

### 4.1 Kích thước

- Một task = **một PR**, làm xong trong **tối đa 2 ngày** công. Lớn hơn thì tách.
- Tách theo lát dọc khi được (API + UI của một việc nhỏ), theo lớp khi lát dọc quá lớn (ví dụ: "domain + migration chốt Egg", rồi "API chốt", rồi "UI chốt").
- Spike (tìm hiểu, thử nghiệm) có giới hạn thời gian và đầu ra là tài liệu / ADR, không phải code production.

### 4.2 Định danh và nhãn

- Epic: `E00`…`E15`. Task: `T` + số epic 2 chữ số + số thứ tự 2 chữ số, ví dụ `T0603` = task thứ 3 của E06.
- Nhãn bắt buộc:

| Nhãn | Giá trị |
|---|---|
| `area` | `backend` · `web` · `mobile` · `shared` · `infra` · `data` · `design` · `docs` |
| `type` | `feature` · `chore` · `bug` · `spike` · `migration` · `test` |
| `priority` | `P0` (chặn go-live) · `P1` (cần cho go-live) · `P2` (sau go-live được) |
| `size` | `S` (≤ ½ ngày) · `M` (≤ 1 ngày) · `L` (≤ 2 ngày) |

### 4.3 Trạng thái

```
todo → ready → in_progress → in_review → done
          ↘        ↘ blocked ↙
```

| Trạng thái | Nghĩa |
|---|---|
| `todo` | Đã ghi, chưa đủ điều kiện bắt đầu |
| `ready` | Đạt Definition of Ready (§5) |
| `in_progress` | Có người / agent nhận, có nhánh |
| `blocked` | Chờ quyết định, chờ task khác, chờ thông tin; ghi rõ chờ gì |
| `in_review` | Có PR, CI xanh, chờ review |
| `done` | Merge, đạt Definition of Done (§6) |

`board.md` và frontmatter của task phải cùng trạng thái.

### 4.4 Mẫu task

```markdown
---
id: T0607
title: Chốt giai đoạn Egg production (API)
epic: E06
status: ready
area: backend
type: feature
priority: P0
size: L
depends_on: [T0603, T0605, T0701]
decisions: [D7]
wireframes: [CloseStage, EggApproved, Pairs/P10]
owner: ""
allowed_paths:            # glob các đường dẫn được sửa; hook scope-guard và CI scope-check dùng
  - "services/backend/src/genetics/modules/breeding/**"
---

## Bối cảnh
Executive chốt batch Egg khi đủ điều kiện; hệ thống đóng batch, tạo batch Neonate F+1,
ghi lineage, huỷ việc định kỳ còn lại, sinh lịch cho batch mới, yêu cầu in nhãn — trong một transaction.
Nguồn luật: overview.md §7.2, backend.md §5.3–5.4, §6.

## Phạm vi
- Làm: domain `close_stage` cho stage egg; use case `CloseStage`; `POST /batches/{id}/close`; RLS / quyền.
- Không làm: UI (T0608), nhánh Neonate → Larvae / Nursery (T0609), in nhãn PDF (T0802; chỉ xếp yêu cầu).

## Tiêu chí chấp nhận
1. Cho batch Egg open có ≥ 1 sexing, ≥ 1 thu trứng, ≥ 1 cân ổ, 0 cá thể pending, 0 lỗi DQ error
   Khi Executive (web) gọi close với `If-Match` đúng
   Thì trả 200, batch thành `closed`, có batch Neonate `TMA_F8_BC01` (generation +1), có `batch_transfer`,
   việc định kỳ chưa làm của batch cũ thành `cancelled`, có `label_print` trạng thái `requested`.
2. Còn cá thể pending → 409 `gate_not_met`, `blockers` chứa `pending_individuals` với `count`; không có gì thay đổi trong DB.
3. Worker hoặc token từ app → 403 (`permission_denied` / `platform_not_allowed`).
4. `If-Match` lệch → 412 `version_conflict`.
5. Lỗi giữa chừng (giả lập exception sau khi tạo batch mới) → rollback toàn bộ.
6. Audit có dòng cho batch cũ (U) và batch mới (I) cùng `request_id`.

## Ghi chú kỹ thuật
- Khoá dòng batch bằng `SELECT … FOR UPDATE` trong use case.
- Generation lấy từ FK, không parse mã.

## Kiểm thử bắt buộc
- Unit: gate (mọi blocker), plan_children cho egg.
- Integration: transaction rollback, RLS, audit.
- API: 200 / 403 / 409 / 412.

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
```

Tiêu chí chấp nhận viết dạng **Cho / Khi / Thì** (Given / When / Then), mỗi tiêu chí kiểm được bằng test hoặc thao tác cụ thể. Không viết "hoạt động đúng", "UI đẹp".

## 5. Definition of Ready

Task được chuyển `ready` khi:

- [ ] Có bối cảnh và trỏ tới mục tài liệu cụ thể (không chỉ "xem tài liệu").
- [ ] Phạm vi có "Làm" và "Không làm".
- [ ] Tiêu chí chấp nhận dạng Cho / Khi / Thì, gồm cả trường hợp lỗi và quyền.
- [ ] Task phụ thuộc đã `done` hoặc có thể làm song song với giả lập rõ ràng.
- [ ] Quyết định liên quan (D1–D8 hoặc ADR) đã chốt, hoặc task ghi rõ dùng giá trị mặc định và cách đổi sau.
- [ ] Với UI: có tên board wireframe.
- [ ] Với KPI / công thức: có định nghĩa đã ký từ E00 và dữ liệu test.
- [ ] Kích thước ≤ L.

## 6. Definition of Done

- [ ] Mọi tiêu chí chấp nhận có test tự động (hoặc ghi rõ kiểm tra thủ công cho phần không tự động được, như camera thật).
- [ ] CI xanh: lint, type check, test, build, kiểm tra boundaries / import-linter, migration up-down-up.
- [ ] `openapi.json` và `packages/api-client` sinh lại nếu API đổi.
- [ ] Mã lỗi, quyền, form_code mới được thêm vào tài liệu tương ứng trong cùng PR.
- [ ] UI: đối chiếu wireframe; có trạng thái tải / trống / lỗi / không quyền; chuỗi qua i18n.
- [ ] Mobile: chạy được offline nếu là màn nhập; thử trên giả lập điện thoại (Playwright) cho đường đi chính.
- [ ] Không có secret, dữ liệu thật hay token trong code, log, fixture.
- [ ] Tài liệu được cập nhật nếu hành vi khác tài liệu.
- [ ] Task file: trạng thái `done`, mục "Kết quả" điền PR; `board.md` cập nhật.

## 7. Nhánh, commit, PR

- Nhánh từ `main`: `<area>/<task-id>-<mo-ta-ngan>`, ví dụ `backend/T0607-close-egg-stage`.
- Commit theo Conventional Commits, có id task:

```
feat(breeding): close egg stage in one transaction (T0607)
fix(mobile): keep outbox order per batch (T0412)
chore(infra): add staging compose profile (T0105)
```

- PR: tiêu đề giống commit chính; mô tả gồm: task, tóm tắt thay đổi, cách kiểm tra, ảnh chụp (UI), ghi chú migration, rủi ro. Một PR một task.
- `main` luôn deploy được lên staging. Không merge khi CI đỏ. Squash merge.
- Migration DB: không sửa migration đã merge; PR có migration ghi rõ có / không downgrade được và thời gian chạy ước tính.

## 8. Review

- Mọi PR cần ít nhất một người duyệt. PR do agent tạo cần **người** duyệt.
- PR chạm vào các vùng sau cần thêm người nắm nghiệp vụ duyệt: công thức KPI, gate / chốt, sinh mã, RBAC / RLS, migrate dữ liệu.
- Người duyệt kiểm tra theo thứ tự: đúng tiêu chí chấp nhận → đúng luật trong tài liệu → test đủ trường hợp lỗi / quyền → kiến trúc (lớp, boundaries) → đặt tên, trình bày.

## 9. Quy tắc cho agent AI

1. **Đọc trước khi làm**: task file, các mục tài liệu task trỏ tới, code liên quan hiện có. Không đoán cấu trúc.
2. **Đúng phạm vi**: không sửa ngoài phạm vi task trừ khi cần để build / test chạy; nếu có, ghi trong PR.
3. **Không tự chốt nghiệp vụ**: công thức, luật quyền, luật chốt, tên trường dữ liệu chỉ lấy từ tài liệu / ADR. Thiếu thông tin → `blocked` + câu hỏi cụ thể + phương án đề xuất.
4. **Test trước khi báo xong**: chạy toàn bộ kiểm tra của CI ở local; dán kết quả tóm tắt vào PR.
5. **Không bao giờ**: commit secret, dùng dữ liệu production ở local, tắt test để CI xanh, sửa migration đã merge, đổi tên trường API đã phát hành mà không có kế hoạch version.
6. **Thay đổi nhỏ, thường xuyên**: PR dưới khoảng 600 dòng thay đổi (không tính file sinh ra) dễ review hơn.
7. **Cập nhật trạng thái**: task file và `board.md` phản ánh đúng thực tế sau mỗi bước (`in_progress`, `blocked`, `in_review`).
8. Khi tạo task mới (lập kế hoạch): mỗi task theo mẫu §4.4, đạt Definition of Ready, gắn epic, gắn `depends_on`, gắn board wireframe nếu có UI.

## 10. Quyết định (ADR)

- Mỗi quyết định kiến trúc hoặc nghiệp vụ có hậu quả lâu dài là một file `docs/decisions/NNNN-ten.md`.
- Mẫu:

```markdown
# 0003 · Nơi chạy hệ thống
- Trạng thái: đề xuất | đã chốt | thay thế bởi 00xx
- Ngày: 2026-11-02 · Người chốt: …
## Bối cảnh
## Các phương án (ưu / nhược)
## Quyết định
## Hệ quả (việc phải làm, task bị ảnh hưởng)
```

- Quyết định đang mở lúc khởi động (chi tiết ở `overview.md` §13) — mỗi mục tạo một ADR trạng thái "đề xuất":

| ID | Quyết định | Chặn epic |
|---|---|---|
| D1 | Thời điểm cutover so với go-live AppSheet | E13 |
| D2 | Model chung MB + SB hay port 1:1 | E05, E06 |
| D3 | Server nội bộ hay Azure | E01 (staging / production) |
| D4 | SharePoint hay MinIO / ổ server cho file | E08, E09, E14 |
| D5 | Task nhập liệu tự Completed hay sang Under review | E10, E14 |
| D6 | Lịch việc định kỳ của từng protocol | E10 |
| D7 | Công thức KPI cuối | E06, E11, E12 |
| D8 | Danh sách điện thoại nghiệm thu | E04 (mobile), E13 |

Task bị chặn bởi quyết định chưa chốt vẫn được làm nếu dùng **giá trị mặc định** trong tài liệu và thiết kế để đổi được (cấu hình, interface). Ghi điều này trong task.

## 11. Dữ liệu và môi trường

| Môi trường | Ai dùng | Dữ liệu | Deploy |
|---|---|---|---|
| local | dev, agent | Seed + `tests/fixtures/legacy` | Docker Compose |
| staging | team, user nghiệm thu | Bản sao đã duyệt | Tự động khi merge `main` |
| production | vận hành | Thật | Thủ công từ tag `vX.Y.Z`, có checklist |

- Dữ liệu thật chỉ ở staging (nếu được duyệt) và production. Fixture trong repo phải đã ẩn danh tên người.
- Secret chỉ ở biến môi trường trên server / vault. `.env.example` chỉ có tên biến.

## 12. Nhịp làm việc

- Kế hoạch theo **vòng 2 tuần**: đầu vòng chọn task `ready` theo thứ tự epic và ưu tiên; cuối vòng demo trên staging cho user (Executive phụ trách, Manager).
- Mỗi ngày cập nhật `board.md`; task `blocked` quá 1 ngày được đưa lên thảo luận.
- Lỗi user báo từ staging / production ghi thành task `type: bug`, có bước tái hiện, kết quả mong đợi, ảnh chụp, `trace_id` nếu có. Phân loại khác biệt khi migrate theo 5 nhóm: Match / Logic Difference / Source Gap / User Error / Defect.

## 13. Khi lập danh sách task (hướng dẫn cho người lập kế hoạch)

1. Đi theo thứ tự epic §3. Với mỗi epic, viết file `epics/Exx-*.md`: mục tiêu, phạm vi, tiêu chí xong (lấy từ cột "Xong khi" trong `overview.md` §12), danh sách task.
2. Lấy đầu vào từ:
   - Bảng route `web.md` §4 và bảng màn `mobile.md` §5 (mỗi màn hoặc nhóm màn nhỏ thường là 1–2 task UI).
   - Danh mục endpoint `api-standards.md` §14 (mỗi nhóm endpoint là vài task backend).
   - Danh mục quyền `backend.md` §8.2, danh sách bảng `overview.md` §6.2.
   - Bảng công việc Maintenance / Selective và luật việc định kỳ trong blueprint (mục Task ⇄ Breeding).
   - Danh sách lỗi AppSheet cần sửa `overview.md` §9 (mỗi dòng phải được một task phủ, ghi id task cạnh dòng đó trong E00).
3. Mỗi form đo lường (`form_code`) cần: luật domain + migration bảng, endpoint (dùng chung), form web, form mobile, luật DQ, template import (nếu có), mục trong `routine_template` (nếu định kỳ).
4. Thêm task kiểm thử xuyên suốt ở cuối mỗi mốc: e2e "Egg → Neonate → Nursery → Pupae → Egg" (M2), đối chiếu KPI (M3), diễn tập cutover (M4).
5. Đánh dấu task có thể làm song song (không phụ thuộc nhau) để chia cho nhiều người / agent.
