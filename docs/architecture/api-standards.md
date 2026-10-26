# Chuẩn API và tích hợp contract-first

> Áp dụng cho mọi endpoint của `services/backend`. Web và mobile chỉ nói chuyện với backend qua hợp đồng này.
> Hợp đồng chạy thật là `contracts/openapi/openapi.json` sinh từ FastAPI và **commit vào repo**; tài liệu này là luật để sinh ra hợp đồng đó cho nhất quán. Quy trình sở hữu, sinh SDK, mock, kiểm breaking change ở mục 16–20 (ADR-0006, ADR-0007).

## 1. Nguyên tắc

1. REST trên JSON qua HTTPS. Không GraphQL, không RPC tự chế.
2. **Một use case = một request = một transaction.** Không có API "bước 1, bước 2" mà client phải gọi đủ.
3. **Server quyết định, client hiển thị.** Quyền và điều kiện (`can_close`, `can_edit`…) do API trả về; client không tự suy luật.
4. **Mọi request ghi từ điện thoại gửi lại được an toàn** (idempotent, mục 9).
5. Hợp đồng ổn định: thêm trường là an toàn; đổi tên, đổi kiểu, xoá trường là breaking và cần version mới.

## 2. URL và version

- Gốc: `https://<host>/api/v1`. Version nằm ở path. Chỉ tăng `v2` khi có breaking change không tránh được (mục 15, 19).
- Tài liệu: `/api/v1/docs` (Swagger UI, chỉ bật ở local / staging), `/api/v1/openapi.json`.
- Health: `/healthz`, `/readyz` (ngoài `/api/v1`, không cần token).

## 3. Đặt tên và phương thức

| Quy ước | Ví dụ |
|---|---|
| Path dùng danh từ số nhiều, `kebab-case` | `/batches`, `/dq-issues`, `/kpi-definitions` |
| Định danh trong path là `uuid` | `/batches/3f1c…` |
| Giá trị mã nghiệp vụ trong path giữ nguyên | `/batches/{id}/measurements/egg_collection` |
| Hành động nghiệp vụ không phải CRUD: `POST` lên sub-resource động từ | `POST /batches/{id}/close`, `POST /imports/{id}/commit`, `POST /tasks/{id}/transition` |
| Tra theo mã người đọc được | `GET /lookup?code=TMA_F7_BC01` |

| Phương thức | Dùng cho | Thành công |
|---|---|---|
| `GET` | Đọc, không tác dụng phụ | 200 |
| `POST` | Tạo, hoặc hành động nghiệp vụ | 201 (tạo, kèm header `Location`), 200 (hành động trả kết quả), 202 (job nền) |
| `PUT` | Thay toàn bộ một tài nguyên con có định danh tự nhiên (điều kiện thí nghiệm, quyền của vai trò) | 200 |
| `PATCH` | Sửa một phần (JSON Merge Patch, `application/merge-patch+json` hoặc `application/json`) | 200 |
| `DELETE` | Xoá (mềm với dữ liệu nghiệp vụ) | 204 |

`operationId` trong OpenAPI theo mẫu `<tag>_<verb>_<noun>` (ví dụ `batches_close_stage`, `batches_list`), sinh bằng `generate_unique_id_function=lambda r: r.name` nên **tên hàm router phải duy nhất toàn app**. orval tạo hook `useBatchesCloseStage` từ đó. Mỗi router có `tags` bằng tên module. Đổi `operationId` là breaking change (đổi tên hàm client).

## 4. Định dạng dữ liệu

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Tên trường | `snake_case`, giống cột DB và Python. Client TS dùng nguyên tên này, không đổi sang camelCase | `population_size`, `egg_mass_mg` |
| Định danh | `uuid` dạng chuỗi | `"id": "3f1c2b0e-…"` |
| Ngày nghiệp vụ | `YYYY-MM-DD`, hiểu theo giờ Việt Nam | `"collected_on": "2026-10-22"` |
| Thời điểm | ISO 8601 có múi giờ; server trả UTC (`Z`) | `"harvested_at": "2026-10-22T03:00:00Z"` |
| Số đo | JSON number; đơn vị nằm trong tên trường; tỉ lệ 0–1. Backend giữ `Decimal`, serialize `float` khi `when_used='json'` (Pydantic mặc định serialize Decimal thành chuỗi — ta ghi đè) | `"egg_mass_mg": 175.4`, `"female_ratio": 0.536` |
| KPI chưa tính được | `null` (không phải 0) | `"hatching_rate": null` |
| Enum | chuỗi chữ thường `snake_case` | `"stage": "egg"`, `"status": "open"` |
| Boolean | `true` / `false`, tên bắt đầu `is_`, `has_`, `can_` | `"can_close": false` |
| Trường không có giá trị | Trả `null`, không bỏ trường. Request: bỏ trường = không đổi (PATCH), `null` = xoá giá trị | |
| Tiền | Không có | |

- Ngày "hôm nay", "trong 24 giờ", "đúng lịch" tính theo `Asia/Ho_Chi_Minh` ở server. Client không tự tính ranh giới ngày cho nghiệp vụ.
- Định dạng hiển thị (dấu phẩy thập phân, `dd/mm/yyyy`) là việc của client. API luôn trả dạng máy đọc.

## 5. Xác thực

- **Microsoft Entra ID** (OIDC). Client lấy access token bằng MSAL (`@azure/msal-browser` 5, redirect flow, `handleRedirectPromise()` mỗi lần tải; MSAL v5 cần trang redirect bridge same-origin), gửi `Authorization: Bearer <token>`.
- Một app registration cho **API** (expose scope `api://genetics-platform-api/access_as_user`, `requestedAccessTokenVersion = 2`), một cho **web** (SPA), một cho **mobile** (SPA / PWA). API kiểm `aud` = client id của API, `iss` = `https://login.microsoftonline.com/{tid}/v2.0`, `tid` = tenant Entobel, chữ ký qua JWKS (`/discovery/v2.0/keys`, cache khoá 24 giờ theo khuyến nghị Microsoft), `exp`. Thư viện: PyJWT `PyJWKClient`.
- **Nền tảng của phiên** = `azp` (token v2): web hoặc app. Dùng để kiểm `platform.web` / `platform.app` và quyền có `device`. Không dùng header client tự khai.
- Access token sống 60–90 phút; refresh token SPA hết hạn **24 giờ** (Microsoft Learn): client phải chạy lại auth code flow tương tác mỗi ngày; API không cấp token riêng.
- Lần đăng nhập đầu: API tạo `app_user` từ `oid`, `email`, `name`. User chưa được Admin gán vai trò → 403 `account_pending`.
- Token hết hạn → 401 `token_expired`; client làm mới token im lặng rồi gửi lại **một lần**.

### 5.1 `/me` và `/me/permissions`

```http
GET /api/v1/me
```
```json
{
  "id": "…", "email": "phuong.thao@entobel.com", "display_name": "Phương Thảo",
  "role": { "code": "executive", "name": "Executive" },
  "platform": "web",
  "home": "/home/exec",
  "phone_home": ["egg_collection", "egg_weighing", "sexing", "neonate_harvest", "neonate_weighing",
                 "larvae_observation", "nursery_observation", "pupae_sample", "sb_clutch"]
}
```

```http
GET /api/v1/me/permissions
```
```json
{
  "platform": "web",
  "permissions": {
    "stage.close": { "scope": "all" },
    "record.edit": { "scope": "all" },
    "egg_collection.add": { "scope": "all" }
  },
  "overrides": [
    { "perm_code": "larvae_observation.add", "effect": "grant", "batch_id": "…", "valid_until": "2026-10-31" }
  ],
  "etag": "W/\"perm-81\""
}
```

Client cache kết quả theo `etag`, gọi lại khi app trở lại foreground hoặc nhận lỗi 403.

## 6. Phân quyền trong response

- Thiếu quyền → **403** `permission_denied`, kèm `required_permission` và `scope`.
- Không được thấy tài nguyên (ví dụ dự án Confidential, RLS lọc mất) → **404** `not_found`, không phải 403, để không lộ sự tồn tại.
- Tài nguyên trả về kèm khối `can` cho các hành động UI cần biết, tính theo **người gọi** và **trạng thái hiện tại**:

```json
{
  "id": "…", "code": "TMA_F7_BC01", "stage": "egg", "status": "open", "version": 14,
  "can": {
    "add": ["egg_collection", "egg_weighing", "sexing"],
    "close": false,
    "close_blockers": [
      { "code": "pending_individuals", "params": { "count": 24 } }
    ],
    "edit_conditions": true,
    "print_labels": true
  }
}
```

Bản ghi đo lường trả `can.edit`, `can.delete`, `edit_requires_reason` (true khi sửa bản ghi người khác hoặc quá 24 giờ).

## 7. Lỗi

Mọi lỗi trả `Content-Type: application/problem+json` theo RFC 9457, cộng các trường mở rộng:

```json
{
  "type": "https://genetics.entobel.com/errors/gate_not_met",
  "title": "Chưa đủ điều kiện chốt giai đoạn",
  "status": 409,
  "code": "gate_not_met",
  "detail": "Batch TMA_F7_BC01 còn 24 cá thể chưa xử lý.",
  "blockers": [ { "code": "pending_individuals", "params": { "count": 24 } } ],
  "trace_id": "01JB…"
}
```

- `code` là **ổn định** và là thứ client dùng để rẽ nhánh và dịch thông báo. `title` / `detail` tiếng Việt chỉ để đọc.
- Lỗi validation (422) có `errors[]` theo trường:

```json
{
  "status": 422, "code": "validation_failed", "title": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "egg_mass_mg", "code": "out_of_range", "message": "Phải ≥ 1", "params": { "min": 1 } },
    { "field": "collected_on", "code": "outside_batch_dates", "message": "Ngoài thời gian của batch" }
  ],
  "trace_id": "…"
}
```

- Lỗi 500 không lộ stack trace; chỉ có `trace_id`.

### 7.1 Danh mục mã lỗi

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `bad_request` | Request sai cú pháp, tham số query không hợp lệ |
| 401 | `unauthenticated` | Thiếu token hoặc token không hợp lệ |
| 401 | `token_expired` | Token hết hạn |
| 403 | `account_pending` | User chưa có vai trò |
| 403 | `platform_not_allowed` | Vai trò không được vào nền tảng này (ví dụ Worker vào web) |
| 403 | `permission_denied` | Thiếu quyền; kèm `required_permission`, `scope` |
| 404 | `not_found` | Không có hoặc không được thấy |
| 409 | `batch_closed` | Ghi vào batch đã chốt (và không trong 48 giờ mở lại) |
| 409 | `gate_not_met` | Chưa đủ điều kiện mở form / chốt; kèm `blockers[]` |
| 409 | `dq_blocking` | Còn lỗi DQ mức error chưa xử lý |
| 409 | `duplicate_code` | Mã batch / generation / container đã tồn tại |
| 409 | `duplicate_id` | `id` client gửi đã dùng cho payload khác |
| 409 | `has_children` | Xoá bản ghi cha khi còn bản ghi con |
| 409 | `generation_not_latest` | Thêm generation không từ thế hệ mới nhất |
| 409 | `invalid_transition` | Đổi trạng thái task / project không hợp lệ; kèm `allowed[]` |
| 409 | `assignee_lacks_permission` | Giao task nhập liệu cho người không có quyền form đó |
| 409 | `idempotency_key_reused` | Cùng `Idempotency-Key` với nội dung khác |
| 409 | `import_not_validated` · `import_undo_expired` | Commit import chưa validate xong · undo quá 24 giờ hoặc batch đã chốt |
| 412 | `version_conflict` | `If-Match` không khớp `version` hiện tại; kèm `current_version` |
| 413 | `payload_too_large` | File vượt giới hạn |
| 415 | `unsupported_media_type` | Loại file không hỗ trợ |
| 422 | `validation_failed` | Dữ liệu sai; kèm `errors[]` |
| 422 | `reason_required` | Sửa / xoá bản ghi người khác, quá 24 giờ, bỏ qua lỗi DQ, mở lại batch mà thiếu `reason` |
| 422 | `edit_window_expired` | Sửa bản ghi của mình quá 24 giờ mà không có quyền `record.edit` scope `all` |
| 428 | `precondition_required` | Thiếu `If-Match` ở request bắt buộc |
| 429 | `rate_limited` | Gửi quá nhanh (chỉ bật cho endpoint nặng: export, import) |
| 500 | `internal_error` | Lỗi không lường trước |
| 503 | `service_unavailable` | DB hoặc hàng đợi job không sẵn sàng |

Mã `code` của `blockers[]` và `errors[].code`:

| Nhóm | Mã |
|---|---|
| Gate | `missing_population_size`, `missing_sexing`, `missing_egg_collection`, `missing_egg_weighing`, `pending_individuals`, `missing_neonate_harvest`, `missing_neonate_weighing`, `missing_conditions`, `missing_larvae_observation`, `missing_pupae_sample`, `branch_required`, `dq_errors_open` |
| Trường | `required`, `out_of_range`, `outside_batch_dates`, `invalid_format`, `unknown_reference`, `duplicate_record`, `not_latest_generation` |

Thêm mã mới = thêm vào bảng này trong cùng PR.

## 8. Đồng thời (khoá lạc quan)

- Mọi tài nguyên sửa được có trường `version` (int) và header `ETag: "<version>"`.
- `PATCH`, `PUT`, `DELETE` và hành động đổi trạng thái (`close`, `reopen`, `transition`) **bắt buộc** `If-Match: "<version>"`. Thiếu → 428; lệch → 412 `version_conflict`.
- Client xử lý 412 bằng cách tải lại, cho người dùng xem thay đổi mới rồi quyết định. Không tự ghi đè.

## 9. Idempotency và offline

Điện thoại có thể gửi cùng một bản ghi nhiều lần (mất mạng giữa chừng, outbox gửi lại).

1. **Tài nguyên tạo được từ điện thoại nhận `id` do client sinh** (UUID v4 hoặc v7) trong body. Server:
   - `id` chưa có → tạo, 201.
   - `id` đã có, nội dung giống (so hash các trường nghiệp vụ) → trả bản ghi cũ, 200.
   - `id` đã có, nội dung khác → 409 `duplicate_id`.
2. **Các POST khác** (hành động, task transition, message) nhận header `Idempotency-Key: <uuid>`. Server lưu `(key, user_id, request_hash, response)` 72 giờ trong `idempotency_key`. Gửi lại cùng key và cùng nội dung → trả lại đúng response cũ. Cùng key khác nội dung → 409 `idempotency_key_reused`.
3. Request offline gửi kèm `client_recorded_at` (thời điểm người dùng bấm Lưu). Server lưu nhưng dùng giờ server cho `created_at`; luật 24 giờ tính từ `created_at`.
4. Lỗi mang tính nghiệp vụ khi đồng bộ (`batch_closed`, `gate_not_met`, `validation_failed`) **không tự gửi lại**: client đánh dấu bản ghi là xung đột để người dùng xử lý. Lỗi mạng, 5xx, 429, 401 sau khi làm mới token: gửi lại với backoff.

## 10. Danh sách, phân trang, lọc, sắp xếp

- Phân trang **cursor** mặc định: `?limit=50&cursor=<opaque>`. `limit` tối đa 200.
- Response danh sách:

```json
{
  "items": [ { … } ],
  "next_cursor": "eyJjcmVhdGVkX2F0Ijo…",
  "total": 128
}
```

`total` chỉ trả khi gửi `include_total=true` (đếm tốn chi phí). Bảng quản trị nhỏ được phép `?page=&page_size=` (offset) và luôn có `total`.

- Lọc bằng tham số phẳng, nhiều giá trị lặp lại tham số: `?stage=egg&status=open&strain=TMA&strain=TME&generation_from=5&generation_to=7`.
- Tìm kiếm: `?q=tma_f7_bc0` (không phân biệt hoa thường, khớp mã, tên).
- Sắp xếp: `?sort=-start_date,code` (dấu `-` là giảm dần). Mỗi endpoint khai báo trường được sort; trường lạ → 400.
- Khoảng ngày: `?from=2026-10-01&to=2026-10-31` (bao gồm hai đầu, theo giờ VN).

## 11. Job nền và file

- Việc lâu (import, export lớn, report, nhãn) trả **202** với tài nguyên job:

```json
{ "job_id": "…", "status": "queued", "poll_url": "/api/v1/jobs/…" }
```

`GET /jobs/{id}` → `queued | running | succeeded | failed`, `progress` (0–1), `result` (ví dụ `file_id`), `error` (problem). Client poll mỗi 2 giây, tối đa theo `Retry-After`.

- Upload: `multipart/form-data`, trường `file`, giới hạn 20 MB (import), 10 MB (ảnh). Kiểu cho phép: `text/csv`, `.xlsx`, `image/jpeg`, `image/png`, `application/pdf`.
- Download: `GET /attachments/{id}/download` kiểm quyền rồi trả file (`Content-Disposition: attachment`). Không có link public.

## 12. Lý do (reason)

Các thao tác sau bắt buộc trường `reason` (chuỗi ≥ 5 ký tự) trong body: sửa / xoá bản ghi người khác hoặc quá 24 giờ, bỏ qua lỗi DQ, mở lại batch, quyền riêng cho user, huỷ task. Server đưa lý do vào `SET LOCAL app.reason` để trigger audit ghi lại.

```http
PATCH /api/v1/measurements/egg_collection/9a7e…
If-Match: "3"
Content-Type: application/json

{ "egg_mass_mg": 182.0, "reason": "Nhập nhầm từ sổ, đúng là 182 mg" }
```

## 13. Header

| Header | Hướng | Ý nghĩa |
|---|---|---|
| `Authorization: Bearer` | → | Token Entra |
| `If-Match` | → | Version mong đợi (mục 8) |
| `Idempotency-Key` | → | Mục 9 |
| `X-Request-ID` | ↔ | Trace id; server sinh nếu thiếu và luôn trả lại |
| `Accept-Language` | → | `vi` (mặc định) hoặc `en` cho `title` / `detail` |
| `ETag` | ← | Version tài nguyên |
| `Location` | ← | URL tài nguyên vừa tạo |
| `Retry-After` | ← | Với 429, 503, job đang chạy |
| `Cache-Control: no-store` | ← | Mặc định cho mọi response có dữ liệu |

CORS chỉ cho phép origin của web và mobile ở từng môi trường.

## 14. Danh mục endpoint v1 (khởi đầu)

Danh sách để lập task; chi tiết request / response nằm trong OpenAPI khi hiện thực.

| Nhóm | Endpoint |
|---|---|
| Phiên | `GET /me` · `GET /me/permissions` · `GET /me/work?date=&kind=` (Việc của tôi: routine, task, nhắc) |
| User & quyền | `GET /users` · `POST /users/invite` · `PATCH /users/{id}` · `GET /roles` · `POST /roles` (tạo hoặc nhân bản) · `PATCH /roles/{id}` · `PUT /roles/{id}/permissions` · `GET /permissions` · `GET/POST /users/{id}/permission-overrides` · `DELETE /users/{id}/permission-overrides/{override_id}` |
| Tham chiếu | `/strains` · `/generations` · `/containers` · `/diets` · `/protocols` · `/protocols/{id}/versions` · `/kpi-definitions` · `/form-defs` (GET danh sách, POST tạo, PATCH sửa) |
| Batch | `GET /batches` · `POST /batches` · `GET /batches/{id}` · `GET /lookup?code=` · `GET /batches/{id}/lineage?direction=up\|down\|both` · `GET /batches/{id}/history` · `PUT /batches/{id}/setup` (population) · `PUT /batches/{id}/conditions` · `POST /batches/{id}/close` · `POST /batches/{id}/reopen` |
| Đo lường | `GET /batches/{id}/measurements/{form_code}` · `POST /batches/{id}/measurements/{form_code}` · `PATCH /measurements/{form_code}/{record_id}` · `DELETE /measurements/{form_code}/{record_id}` · `POST /batches/{id}/individuals/prepare` (tạo sẵn N cốc sexing) |
| Nhãn | `POST /batches/{id}/labels` · `GET /labels/{id}` |
| Data quality | `GET /dq-issues` · `POST /dq-issues/{id}/ignore` |
| Import | `GET /import-templates` · `POST /imports` · `GET /imports/{id}` · `GET /imports/{id}/rows?status=error\|warning\|ok` · `POST /imports/{id}/commit` · `POST /imports/{id}/undo` |
| Việc định kỳ | `GET /routine/templates` · `GET /routine/occurrences?date=&batch_id=&assignee=` · `GET/POST /batches/{id}/assignments` · `GET /routine/on-time?group_by=user\|area\|stage` |
| Dự án & task | `/projects` · `/projects/{id}/members` · `/tasks` · `POST /tasks/{id}/transition` · `GET/POST /tasks/{id}/messages` · `POST /messages/{id}/read` · `/reports` |
| Selective | `GET/POST /selection-runs` · `GET /selection-runs/{id}` · `GET/PUT /generations/{id}/allocation` |
| Phân tích | `GET /analytics/dashboard?stage=` · `GET /analytics/kpi?stage=&strain=&generation_from=&generation_to=` · `POST /exports` · `GET /exports/{id}` |
| File · thông báo · job · audit | `POST /attachments` · `GET /attachments/{id}/download` · `GET /notifications` · `POST /notifications/read` · `POST /push-subscriptions` · `GET /jobs/{id}` · `GET /audit?table=&record_id=` |

`form_code` hợp lệ (bảng `form_def`): `egg_collection`, `egg_weighing`, `sexing`, `neonate_harvest`, `neonate_weighing`, `larvae_observation`, `nursery_observation`, `pupae_sample`, `feeding`, `sb_clutch`, `sb_clutch_sampling`, `sb_hatch`, `sb_phenotype`.

Luồng trạng thái task (`POST /tasks/{id}/transition` với `{ "to": "in_progress" }`):

```
assigned → in_progress → completed
                      └→ under_review → completed | requires_amendment → in_progress
mọi trạng thái chưa xong → pending (tạm dừng) → in_progress
mọi trạng thái chưa xong → cancelled (cần reason)
```

Task `kind = data` tự sang `completed` (hoặc `under_review` nếu `review = true`) khi `done_qty ≥ target_qty`.

## 15. Thay đổi và ngừng hỗ trợ

- Thêm trường, thêm endpoint, thêm giá trị enum (client phải chịu được giá trị lạ): không breaking.
- Ngừng một endpoint: trả header `Deprecation` và `Sunset` ít nhất một bản phát hành trước khi xoá; ghi trong CHANGELOG.
- `openapi.json` được commit; PR làm đổi nó phải sinh lại `packages/api-client` trong cùng PR.

## 16. Sở hữu hợp đồng và luồng contract-first (ADR-0006)

| Artefact | Đường dẫn | Chủ sở hữu | Sinh ra bởi | Ai được sửa |
|---|---|---|---|---|
| OpenAPI spec | `contracts/openapi/openapi.json` | Codex (backend) | `uv run genetics export-openapi` | Chỉ qua đổi code backend + PR; không sửa tay |
| Quy ước API (file này) | `docs/architecture/api-standards.md` | Claude Planner | tay | PR có review của Planner |
| Danh mục mã lỗi, blocker, `form_code` | mục 7, 14 của file này + `packages/shared/src/codes.ts` | Codex đề xuất, Planner duyệt | tay (test backend so khớp hai nơi) | cùng PR với endpoint |
| TS SDK + hook + mock + zod | `packages/api-client/src/generated/**` | Claude (web) vận hành script; Codex không chạm | `pnpm --filter @genetics/api-client generate` (orval) | Không sửa tay; CI kiểm diff |
| Mutator fetch (token, header, problem+json) | `packages/api-client/src/mutator.ts` | Claude (web) + Claude (mobile) cùng dùng | tay | PR review chéo |
| Ví dụ request / response trong OpenAPI | docstring + `examples` trong schema Pydantic | Codex | sinh | — |

**Luồng cho một endpoint mới** (cho phép frontend làm song song):

1. Planner ghi task với hợp đồng mong đợi (path, method, schema mẫu, mã lỗi) trong task file; nếu đụng mã lỗi / quyền mới → cập nhật file này trong cùng PR tài liệu.
2. Codex làm **PR contract trước** (stub endpoint trả `501 not_implemented` hoặc dữ liệu giả có cờ `x-stub` trong OpenAPI) → `openapi.json` đổi → CI sinh lại SDK + mock. PR này có nhãn `contract`.
3. Claude web / mobile dùng SDK + mock MSW (`VITE_API_MOCK=1`) để làm UI.
4. Codex làm PR hiện thực thật; schema **không đổi** so với PR contract, nếu đổi → quay lại bước 1.
5. Contract test (schemathesis) và API test chạy trên PR hiện thực; e2e frontend chạy khi cả hai merge.

Không có PR contract thì frontend **không tự bịa** endpoint: agent gặp thiếu endpoint → task `blocked` + đề xuất hợp đồng trong task file.

## 17. Sinh SDK (orval)

- Config `packages/api-client/orval.config.ts`: `input: ../../contracts/openapi/openapi.json`; `output.client: 'react-query'`, `httpClient: 'fetch'`, `mode: 'tags-split'`, `mock: true` (MSW + faker), `override.mutator` → `src/mutator.ts`, `override.zod` tạo schema zod 4 cho request body (dùng trong form preview khi cần).
- Tên hook = camelCase(`operationId`): `useBatchesList`, `useBatchesCloseStage`, `getBatchesGetQueryKey`, `getBatchesGetQueryOptions`.
- `pnpm generate` ở root chạy export OpenAPI (backend) → orval; CI chạy lại và `git diff --exit-code` trên `contracts/` và `packages/api-client/src/generated`.
- Mock: handler theo `operationId` (`getBatchesListMockHandler`), dữ liệu faker **có seed cố định**; feature có thể override handler cục bộ trong test.

## 18. Mock cho phát triển song song

| Môi trường | Cách |
|---|---|
| Vitest (web, mobile) | `setupServer(...handlers)` từ `@genetics/api-client/mocks` |
| Dev server web / mobile | `setupWorker` khi `*_API_MOCK=1`; service worker MSW chỉ trong dev, không build vào PWA |
| Playwright e2e | Backend thật trên Docker Compose với seed; không mock |
| Stub backend | endpoint `501` có `x-stub: true` trong OpenAPI; CI cấm merge vào `main` khi còn `x-stub` quá 2 vòng (báo cáo tuần) |

## 19. Breaking change và tương thích

- Breaking = đổi tên / kiểu / xoá trường, đổi `operationId`, thêm trường bắt buộc vào request, bỏ giá trị enum, đổi mã lỗi. Không breaking = thêm endpoint, thêm trường response, thêm giá trị enum (client phải chịu giá trị lạ), thêm trường request tuỳ chọn.
- CI chạy `oasdiff breaking <base> <pr>`; có breaking → PR phải có nhãn `api-breaking`, mô tả kế hoạch (v2 path, hoặc deploy frontend cùng lúc vì ta kiểm soát cả hai client nội bộ). Trong giai đoạn trước go-live (W0–W3) breaking được phép khi cả ba agent deploy cùng nhau; sau go-live phải có `Deprecation` / `Sunset` một bản phát hành.
- Spectral lint `contracts/openapi/openapi.json` với ruleset `spectral:oas` + rule riêng: `operationId` theo mẫu, mọi 4xx có schema Problem, path kebab-case.

## 20. Kiểm thử hợp đồng

| Tầng | Công cụ | Kiểm gì |
|---|---|---|
| Schema hợp lệ | Spectral | Lint ruleset |
| Server đúng schema | schemathesis `from_asgi` (`call_and_validate`, stateful links khi có) | Không 5xx, response khớp schema, status code khai báo |
| Client đúng schema | TypeScript: SDK sinh từ cùng spec nên compile = kiểm; test MSW sinh từ spec | |
| Không drift | CI diff `contracts/` và `generated/` | |
| Tích hợp thật | API test (httpx + Postgres) ở backend; e2e Playwright | Quyền, idempotency, `If-Match` |
| Pact (consumer-driven) | **Không dùng** | Một backend, hai client nội bộ cùng repo: schema-based đủ; xem lại nếu có client ngoài |

## 21. Thuật ngữ dùng chung

`packages/shared/src/glossary.ts` (sinh từ `overview.md` §14): batch, stage, strain, line, generation, container, gate, close (chốt), lineage, individual, clutch, FCR, DQ, routine, outbox. Tên trường API, bảng DB, nhãn i18n đều dùng cùng từ; PR thêm khái niệm mới phải thêm vào glossary.
