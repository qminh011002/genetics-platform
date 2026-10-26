# Backend · FastAPI theo Modular Monolith + Clean Architecture

> Phạm vi: `services/backend` (tên dự án `genetics_platform_backend`, package Python `genetics`). Chủ sở hữu code: **Codex**. Chủ sở hữu tài liệu: Claude Planner.
> Đọc trước: `overview.md` (mô hình dữ liệu, luồng nghiệp vụ), `api-standards.md` (hợp đồng HTTP), `quality-standards.md` (gate kiểm tra).
> Quyết định nền: ADR-0002 (kiến trúc), ADR-0003 (persistence), ADR-0004 (auth / RBAC / RLS), ADR-0005 (job nền), ADR-0007 (lỗi). Trạng thái các ADR: **Proposed** cho tới khi được duyệt.
> Mọi mục "Bắt buộc" ở đây đều có cách kiểm chứng tự động ở mục 16; mục "Nên" là khuyến nghị.

## 1. Yêu cầu dẫn tới thiết kế

| Yêu cầu (nguồn PLAN-001) | Hệ quả kiến trúc |
|---|---|
| Luật nghiệp vụ phải có test, chạy không cần DB: sinh mã, gate, chuyển giai đoạn, KPI, DQ, luật 24 giờ (`overview.md` §1.1, F-06xx) | Domain thuần Python, không import framework |
| Một use case = một transaction; AppSheet mất dữ liệu nửa chừng khi rớt mạng (INV-50, RSK-07) | Unit of Work rõ ràng, commit ở application layer |
| Quyền là dữ liệu; batch đã chốt khoá với mọi người; RLS là lớp chặn thứ hai (F-0203, F-0204) | 3 lớp kiểm tra: dependency → use case → Postgres RLS |
| Điện thoại gửi lại được an toàn (F-0304) | id do client sinh + bảng idempotency |
| ~10 user, vài chục nghìn dòng (`overview.md` §1.3) | Một process, một DB, không cache phân tán, không microservice |
| Hai agent frontend làm song song với Codex (PLAN-002 §1) | Hợp đồng OpenAPI commit trong `contracts/`, sinh từ code, kiểm diff trong CI |

## 2. Phương án đã cân nhắc

| Phương án | Ưu | Nhược với dự án này | Kết luận |
|---|---|---|---|
| Layered (router → service → repository, một package) | Đơn giản, quen thuộc | 13 module nghiệp vụ sẽ thành 3 thư mục khổng lồ; không có ranh giới module để chia việc cho agent; import vòng dễ xảy ra | Không chọn |
| Clean Architecture thuần (4 vòng, interface cho mọi thứ) | Domain độc lập, test không DB | Quá nhiều interface / DTO cho CRUD tham chiếu; Cosmic Python cảnh báo "mỗi lớp gián tiếp tăng chi phí bảo trì" | Chỉ áp dụng cho module có luật (breeding, work, quality, imports, projects) |
| Hexagonal (ports & adapters) | Cùng mục tiêu với Clean; nhấn mạnh adapter thay được (storage, PDF, queue) | Khác tên gọi, không khác bản chất | Dùng thuật ngữ port / adapter cho infrastructure |
| DDD đầy đủ (aggregate, domain event, bounded context riêng DB) | Mô hình giàu | Event sourcing / message bus không có nhu cầu (10 user) | Lấy "pragmatic DDD": entity + value object + domain service, một DB |
| Microservice | — | Không có nhu cầu scale; tốn vận hành | Loại |
| **Modular Monolith + Clean Architecture bên trong module** | Ranh giới theo nghiệp vụ, kiểm bằng import-linter; mỗi module tự chứa 4 lớp; module CRUD được phép rút gọn | Cần kỷ luật import; thêm ~1 tuần thiết kế | **Chọn** (ADR-0002) |

Nguồn: Cosmic Python ch. 2 / 4 / 6 / epilogue, Cockburn 2005, Martin 2012, Fowler MonolithFirst 2015, Grzybek modular-monolith-with-ddd (xem `research-references.md` §B).

## 3. Nguyên tắc (bắt buộc)

1. **Luật nghiệp vụ nằm ở domain.** Không ở router, không ở SQL rải rác. Kiểm: import-linter cấm `domain` import FastAPI / SQLAlchemy / Pydantic; coverage domain ≥ 90 %.
2. **Một use case = một transaction.** Router không commit. Kiểm: grep CI cấm `commit()` ngoài `shared_kernel/infrastructure/uow.py`.
3. **Database là lớp bảo vệ thứ hai.** FK, CHECK, UNIQUE, RLS, trigger audit có trong migration. Kiểm: test integration đăng nhập từng vai trò.
4. **Phụ thuộc chỉ đi vào trong.** Kiểm: import-linter contract `layers` cho từng module và contract `independence` giữa module.
5. **Đơn giản trước.** Không microservice, event sourcing, CQRS nặng, message broker, generic repository. Kiểm: review PR theo checklist mục 17.
6. **Hợp đồng sinh từ code.** `contracts/openapi/openapi.json` được xuất từ FastAPI và commit. Kiểm: CI so sánh file sinh lại với file đã commit.
7. **Mọi quy tắc có cách kiểm.** Quy tắc không kiểm được bằng tool thì nằm trong checklist review, không phải "nên nhớ".

## 4. Lớp và luật phụ thuộc

```
┌──────────────────────────────────────────────────────────┐
│ api            router FastAPI, schema Pydantic (request / │
│                response), dependency: auth, uow, paging   │
├──────────────────────────────────────────────────────────┤
│ application    use case (command / query), port (Protocol)│
│                DTO (@dataclass), public.py của module     │
├──────────────────────────────────────────────────────────┤
│ domain         entity, value object, domain service,      │
│                domain error                               │
└──────────────────────────────────────────────────────────┘
        ▲ implement port
┌──────────────────────────────────────────────────────────┐
│ infrastructure ORM SQLAlchemy, repository, query đọc,     │
│                adapter: JWT, storage, PDF, QR, job, mail  │
└──────────────────────────────────────────────────────────┘
```

| Lớp | Được import | Cấm import |
|---|---|---|
| `domain` | stdlib, `shared_kernel.domain`, `domain` của module khác **chỉ qua `shared_kernel`** | `application`, `infrastructure`, `api`, FastAPI, SQLAlchemy, Pydantic, httpx, `datetime.now()` trực tiếp (dùng port `Clock`) |
| `application` | `domain`, port của chính nó, `public.py` của module khác | `infrastructure`, `api`, FastAPI, SQLAlchemy |
| `infrastructure` | `domain`, `application` (để implement port) | `api` |
| `api` | `application`, schema của chính nó; `infrastructure` **chỉ** trong `bootstrap/` | `domain` trực tiếp trong router (đi qua use case) |

**Ba loại model, không trộn:**

| Loại | Ở đâu | Dùng cho | Chuyển đổi |
|---|---|---|---|
| Domain entity / value object (`@dataclass`) | `domain/` | Luật nghiệp vụ | repository: ORM ↔ entity |
| ORM model (`DeclarativeBase`, `Mapped[...]`) | `infrastructure/orm.py` | Bảng DB | không lộ ra ngoài infrastructure |
| Pydantic schema | `api/schemas.py` | Request / response, OpenAPI | `Schema.model_validate(dto)` với `from_attributes=True` |

Ngoại lệ có chủ đích:
- **Module tham chiếu đơn giản** (`reference`, `identity`, `files`, `notifications`): repository được trả entity dựng thẳng từ row; không bắt buộc tách DTO khi entity đã đủ. Ghi rõ trong docstring module.
- **Query đọc** (danh sách, chi tiết, dashboard): viết bằng SQLAlchemy Core / SQL trong `infrastructure/queries.py`, trả `@dataclass` DTO thẳng cho use case query. Không đi qua entity và repository khi chỉ đọc. Mọi **ghi** đi qua domain.

**Giao tiếp giữa module:** chỉ qua `<module>/application/public.py` (hàm async nhận `uow` hiện tại). Cấm import repository hoặc ORM của module khác. Ví dụ `breeding.CloseStage` gọi `work.public.cancel_open_items(uow, batch_id, reason)` và `quality.public.blocking_issues(uow, batch_id)` trong **cùng UoW**. Kiểm: import-linter contract `forbidden` cho mọi cặp `moduleA.* → moduleB.infrastructure`, `moduleB.domain`.

**Tránh import vòng:** (a) `shared_kernel` không import module nào; (b) module chỉ import `public.py` của module khác; (c) graph module phải là DAG theo thứ tự ở mục 6; import-linter contract `acyclic siblings` trên `genetics.modules`.

## 5. Cấu trúc thư mục

```
services/backend/
├─ pyproject.toml                 # [project] name = "genetics-platform-backend"; uv; ruff; mypy; pytest
├─ uv.lock
├─ .python-version                # 3.13
├─ .importlinter                  # contract lớp + module
├─ alembic.ini
├─ alembic/
│  ├─ env.py                      # async engine, include_schemas, alembic_utils entities
│  └─ versions/                   # 0001_schemas.py … (một migration một mục đích)
├─ src/genetics/
│  ├─ bootstrap/                  # composition root
│  │  ├─ app.py                   # create_app(): lifespan, router, handler lỗi, middleware
│  │  ├─ container.py             # factory use case: nối port ↔ adapter
│  │  └─ settings.py              # pydantic-settings
│  ├─ shared_kernel/
│  │  ├─ domain/                  # Entity base, DomainError, Clock, IdGenerator, MassMg, Ratio, DateRange, Program, Stage
│  │  ├─ application/             # UnitOfWork (Protocol), Actor, PermissionSet, Page, Cursor
│  │  ├─ infrastructure/          # engine, session, UoW SQLAlchemy, session vars (SET LOCAL), idempotency store
│  │  └─ api/                     # problem+json handler, pagination params, deps chung, require()
│  ├─ modules/
│  │  ├─ identity/                # app_user, auth.* , /me
│  │  ├─ reference/               # strain, scheme, line, generation, container, diet, protocol, kpi_definition, form_def
│  │  ├─ breeding/                # batch, lineage, đo lường, gate, chốt, mở lại, sinh mã
│  │  ├─ selective/               # selection run, allocation
│  │  ├─ quality/                 # luật DQ, dq_issue
│  │  ├─ imports/                 # import_batch
│  │  ├─ labels/                  # label_print, template nhãn
│  │  ├─ work/                    # routine_*, batch_assignment, "Việc của tôi"
│  │  ├─ projects/                # project, task, message, report
│  │  ├─ analytics/               # chỉ đọc analytics.*, export
│  │  ├─ notifications/
│  │  ├─ files/                   # attachment, FileStorage port
│  │  └─ audit/                   # đọc audit_log
│  ├─ jobs/                       # đăng ký job nền, lịch cron (gọi use case)
│  └─ templates/                  # Jinja2 HTML cho nhãn, report
└─ tests/
   ├─ unit/                       # domain + application (fake port), không DB
   ├─ integration/                # Postgres thật (testcontainers): repository, RLS, trigger, migration up/down/up
   ├─ api/                        # httpx AsyncClient + ASGITransport + LifespanManager
   ├─ contract/                   # schemathesis trên openapi.json
   └─ fixtures/legacy/            # từ Data Migration.xlsx (ẩn danh) + KPI AppSheet
```

Cấu trúc một module (ví dụ `breeding`):

```
modules/breeding/
├─ domain/
│  ├─ batch.py                    # Batch, BatchStatus
│  ├─ codes.py                    # sinh mã (BatchCode, GenerationCode, container_code)
│  ├─ gates.py                    # can_add(form), can_close() → GateResult(blockers)
│  ├─ transitions.py              # close_stage() → CloseOutcome
│  ├─ measurements.py             # EggCollection, EggClutch, Individual, NeonateHarvest …
│  ├─ edit_policy.py              # luật 24 giờ
│  ├─ kpi.py                      # bản Python của công thức (parity với view SQL)
│  └─ errors.py
├─ application/
│  ├─ ports.py                    # BatchRepository, MeasurementRepository, LabelQueue (Protocol)
│  ├─ public.py                   # hàm cho module khác gọi
│  ├─ commands/                   # create_batch, record_measurement, edit_measurement, delete_measurement,
│  │                              #   set_conditions, close_stage, reopen_batch
│  └─ queries/                    # list_batches, get_batch, lookup_code, batch_lineage
├─ infrastructure/
│  ├─ orm.py
│  ├─ repositories.py
│  └─ queries.py                  # SQL đọc
└─ api/
   ├─ router.py                   # /batches, /measurements, /lookup
   └─ schemas.py
```

## 6. Module, bảng sở hữu, thứ tự phụ thuộc

Thứ tự dưới là DAG cho phép (module sau được gọi `public.py` của module trước, không ngược lại).

| # | Module | Sở hữu bảng | Gọi public của | Feature PLAN-001 |
|---|---|---|---|---|
| 1 | `identity` | `core.app_user`, `auth.*` | — | F-02xx |
| 2 | `files` | `core.attachment` | identity | F-0307 |
| 3 | `notifications` | `core.notification` | identity | F-0308 |
| 4 | `reference` | `strain`, `scheme`, `line`, `generation`, `container`, `diet`, `protocol`, `protocol_version`, `kpi_definition`, `form_def` | identity, files | F-05xx |
| 5 | `quality` | `dq_issue` | reference | F-07xx |
| 6 | `work` | `routine_template`, `routine_occurrence`, `batch_assignment` | reference, notifications | F-10xx |
| 7 | `labels` | `label_print` | files | F-08xx |
| 8 | `breeding` | `batch`, `batch_transfer`, `breeding_setup`, `rearing_condition`, `batch_reopen`, mọi bảng đo lường, `feeding_record` | reference, quality, work, labels, notifications | F-06xx |
| 9 | `selective` | `selection_run`, `selection_result` | breeding, reference | F-15xx |
| 10 | `imports` | `import_batch` | breeding, quality, files | F-09xx |
| 11 | `projects` | `project`, `project_member`, `task`, `task_assignee`, `message`, `message_recipient`, `report` | identity, breeding, work, notifications, files | F-14xx |
| 12 | `analytics` | (chỉ đọc `analytics.*`) | — (đọc view) | F-11xx |
| 13 | `audit` | (đọc `audit.audit_log`) | — | F-0305 |

### 6.1 Bảng bổ sung so với blueprint

| Bảng | Lý do |
|---|---|
| `core.feeding_record` (`batch_id`, `fed_at`, `diet_id`, `wet_feed_kg`, `replicate_no`, `note`) | Wireframe có màn Cho ăn Larvae / Nursery và lịch "Cho ăn theo lịch"; blueprint chưa có bảng (DN-10) |
| `core.label_print` (`owner_table`, `owner_id`, `status`, `file_id`, `requested_by`, `requested_at`) | Thay cờ `label_trigger` của AppSheet, theo dõi job sinh nhãn |
| `core.notification` (`user_id`, `kind`, `payload jsonb`, `read_at`) | Inbox web và điện thoại |
| `core.idempotency_key` (`key`, `user_id`, `request_hash`, `response jsonb`, `created_at`) | Gửi lại an toàn từ outbox (`api-standards.md` §9) |
| `core.protocol_version` | Tách `protocol` (định danh) và `protocol_version` (params, valid_from) |
| schema `procrastinate` | Bảng hàng đợi của thư viện job (ADR-0005), quản lý bằng migration của thư viện |

Quy tắc sở hữu bảng: **mỗi bảng có đúng một module ghi**. Module khác chỉ đọc qua view / query hoặc qua `public.py`. Kiểm: test `test_table_ownership.py` đối chiếu `orm.py` của từng module với danh sách này.

## 7. Persistence

### 7.1 Thư viện và phiên bản

| Thành phần | Chọn | Lý do (nguồn) |
|---|---|---|
| ORM | SQLAlchemy **2.1** (`sqlalchemy[asyncio]`), kiểu `Mapped[...]` / `mapped_column` | 2.1 là bản hiện hành, 2.0 đã "legacy"; `greenlet` nằm trong extra `[asyncio]`; `Select`/`Row` typed theo cột |
| Driver | **psycopg 3** (async) qua `postgresql+psycopg://` | Mặc định của SQLAlchemy 2.1; dùng chung driver với job nền (ADR-0005); asyncpg vẫn được nếu đổi job runner |
| Migration | Alembic ≥ 1.20 + `alembic_utils` cho view / function / trigger; policy RLS bằng `op.execute` qua helper `ReplaceablePolicy` | Autogenerate không phát hiện view / trigger / policy |
| Validation | Pydantic 2.14+ | `model_validate(..., from_attributes=True)`; `Decimal` serialize thành string JSON mặc định → ta ép `float` khi `when_used='json'` cho số đo (api-standards §4) |
| Pool | QueuePool mặc định (`pool_size=5`, `max_overflow=10`), `pool_pre_ping=True` | Một process Uvicorn, 10 user; `NullPool` chỉ trong test chạy nhiều event loop |

### 7.2 Session, transaction, Unit of Work

- Một request = một `AsyncSession` (`async_sessionmaker(engine, expire_on_commit=False)`), mở trong dependency `get_uow()` với `yield`. **Commit ở use case**, không ở dependency (exit code của dependency chạy sau khi response đã gửi nên không đổi được status nếu commit lỗi).
- `UnitOfWork` là lớp mỏng bọc session: `async with uow:` → `BEGIN`; `await uow.commit()`; `uow.after_commit(callable)` để xếp job sau commit. Repository của các module được gắn vào UoW (`uow.batches`, `uow.measurements`, …) để một transaction dùng được nhiều module.
- Không viết UoW / repository "generic". Mỗi repository chỉ có phương thức mà use case cần (`get_for_update`, `facts`, `save_close`…). Nguồn: Cosmic Python ch. 2, 6 ("có thể đi rất xa chỉ bằng cách truyền session").

### 7.3 Biến phiên cho RLS và audit (`SET LOCAL`)

Ngay sau `BEGIN` của mỗi transaction, UoW đặt:

```sql
SELECT set_config('app.user_id',    :user_id,    true);
SELECT set_config('app.device',     :device,     true);   -- 'web' | 'app' | 'system'
SELECT set_config('app.reason',     :reason,     true);   -- '' nếu không có
SELECT set_config('app.request_id', :request_id, true);
```

- Dùng `set_config(name, value, true)` (tương đương `SET LOCAL`, hết hiệu lực khi transaction kết thúc) vì nó bind được tham số; `SET LOCAL` không bind tham số được với driver async.
- Đăng ký bằng `SessionEvents.after_begin` trên `AsyncSession.sync_session` (chạy đúng lúc transaction bắt đầu, dùng `connection` được cấp) **hoặc** gọi tường minh trong `UoW.__aenter__` ngay sau `session.begin()`. Chọn cách tường minh (dễ đọc, dễ test); ghi lý do trong code.
- Policy RLS đọc `current_setting('app.user_id', true)` (`missing_ok = true` → NULL → ẩn dòng, không lỗi).
- Job nền chạy với `Actor.system()` → `app.user_id = '00000000-…-0001'` (user hệ thống có trong seed), `app.device = 'system'`.

### 7.4 Role database và RLS

| Role | Dùng bởi | Quyền |
|---|---|---|
| `app_migrator` | Alembic | Owner của 4 schema |
| `app_rw` | API, worker | `SELECT/INSERT/UPDATE/DELETE` trên `core`, `auth`; **không** phải owner → RLS áp dụng; thêm `ALTER TABLE … FORCE ROW LEVEL SECURITY` để an toàn nếu sau này owner trùng |
| `app_analytics_ro` | export lớn, notebook | chỉ `SELECT` trên `analytics` |

- RLS bật trên: mọi bảng đo lường, `batch`, `project`, `task`, `message`, `attachment`. Bảng tham chiếu không bật (ai cũng xem).
- Policy dùng `auth.has_perm(perm, scope)` (SQL function `STABLE`, đọc `app.user_id`, `app.device`) và chỉ so sánh **cột của chính dòng** (`created_by`, `created_at`, `batch_id`) để tránh sub-select lồng nhau — tài liệu Postgres cảnh báo sub-select trong policy có thể rò rỉ và chậm. Cần join (ví dụ batch chốt chưa) thì làm bằng function `SECURITY DEFINER` nhỏ, có test.
- Lưu ý FK và `LEAKPROOF`: policy không chặn kiểm tra khoá ngoại; không dựa vào RLS để giấu *sự tồn tại* của id ở bảng con. API trả 404 thay vì 403 cho tài nguyên không được thấy.

### 7.5 Đồng thời và toàn vẹn

| Tình huống | Cơ chế |
|---|---|
| Hai người chốt cùng batch | `SELECT … FOR UPDATE` dòng batch (`with_for_update()`) trong use case; `version` + `If-Match` ở API (412) |
| Cấp `seq` bản ghi con | `FOR UPDATE` dòng batch cha rồi `coalesce(max(seq),0)+1`; `UNIQUE (batch_id, ngày, seq)` chặn trùng |
| Gửi lại từ outbox | `id` client sinh là PK; so hash → 200 / 409 `duplicate_id` |
| Sinh routine đêm chạy trùng | `UNIQUE (template_id, batch_id, due_at)` + `ON CONFLICT DO NOTHING` |
| Khoá lạc quan | cột `version int` tăng mỗi UPDATE (trigger hoặc ORM `version_id_col`) |

### 7.6 Khoá chính và mã

- PK `uuid`; mặc định `gen_random_uuid()` (v4) ở DB; bản ghi tạo từ client dùng `crypto.randomUUID()` (v4). UUID v7 **không** bắt buộc: khối lượng nhỏ, không cần sắp xếp theo thời gian trong khoá. Nếu server cài PostgreSQL 18, có thể đổi default sang `uuidv7()` bằng một migration (ADR-0003, ghi điều kiện revisit).
- Mã nghiệp vụ (`code`) là cột `UNIQUE` riêng, sinh ở domain (`codes.py`), không bao giờ cắt chuỗi để suy ra generation (INV-43).

### 7.7 Index và hiệu năng

- Index theo truy vấn thực: `batch(stage, status)`, `batch(strain_id, generation_id)`, mọi FK, `measurement(batch_id, ngày)`, `audit_log(table_name, record_id)`, `routine_occurrence(assignee_id, due_at)`, `notification(user_id, read_at)`.
- View `analytics.*` là view thường (không materialized) vì dữ liệu nhỏ; nếu dashboard > 1 giây thì chuyển `MATERIALIZED VIEW` + refresh sau commit — ghi ngưỡng này trong `quality-standards.md` §7.
- Không cache ứng dụng. Redis / cache chỉ cân nhắc khi có số đo cho thấy DB là nút cổ chai (xem mục 13).

## 8. Migration (Alembic)

- `env.py` dùng async engine với role `app_migrator`; `include_schemas=True` cho `core`, `auth`, `audit`, `analytics`.
- Một migration một mục đích, tên `NNNN_<muc_dich>.py`; `downgrade()` phải chạy được (CI: `upgrade head → downgrade base → upgrade head`).
- View, function (`auth.has_perm`, trigger audit), trigger: khai báo bằng `alembic_utils` (`PGView`, `PGFunction`, `PGTrigger`) để autogenerate so sánh được. Policy RLS: helper `ReplaceablePolicy` theo recipe "replaceable object" của Alembic cookbook, `op.execute` `CREATE POLICY` / `DROP POLICY`.
- Seed dữ liệu cấu hình (permission, form_def, 4 vai trò, user hệ thống, KPI v1) nằm trong migration riêng `NNNN_seed_*.py` (idempotent, `ON CONFLICT DO NOTHING`).
- CI chạy `alembic check` (autogenerate không được sinh thay đổi) và script head-check.
- Không sửa migration đã merge. Đổi công thức KPI = migration tạo view version mới + dòng `kpi_definition` mới.

## 9. Domain

- Entity là `@dataclass` có hành vi; đổi trạng thái qua method có tên nghiệp vụ (`batch.close(at, by)`), không gán thuộc tính tự do.
- Value object `frozen=True`: `BatchCode`, `GenerationNo`, `MassMg`, `Ratio`, `DateRange`.
- Domain service là hàm thuần: `gates.can_close(batch, facts, dq_errors) -> GateResult`, `transitions.close_stage(...) -> CloseOutcome`, `codes.batch_code(...)`, `kpi.hatching_rate(...)`, `dq_rules.run(record, protocol) -> list[Issue]`.
- Thời gian qua port `Clock`; id qua `IdGenerator`.
- Lỗi là subclass `DomainError` có `code` ổn định (trùng bảng `api-standards.md` §7).
- Số đo dùng `Decimal` ở domain, `numeric` ở DB, JSON number ở API.
- Docstring của hàm domain ghi **luật và nguồn** (ví dụ "AppSheet Platform Documentation §8.2, sửa theo ERD; PLAN-001 INV-50").

Luật cụ thể (gate, sinh mã, KPI, 24 giờ) giữ nguyên như `overview.md` §7; không lặp lại ở đây.

## 10. Application

- Use case là class `async def __call__(self, cmd, actor) -> Result`. Command / Result là `@dataclass`.
- Kiểm quyền **ở đầu use case** (`actor.require(perm, scope, device)`) ngoài dependency của router, vì use case còn được gọi từ job và import.
- Transaction boundary = use case. Mẫu:

```python
class RecordMeasurement:
    def __init__(self, uow: UnitOfWork, clock: Clock, quality: QualityPublic, work: WorkPublic): ...

    async def __call__(self, cmd: RecordMeasurementCmd, actor: Actor) -> MeasurementDTO:
        actor.require(f"{cmd.form_code}.add", scope="all")
        async with self.uow:                                   # BEGIN + set_config(app.*)
            batch = await self.uow.batches.get_for_update(cmd.batch_id)
            gate = gates.can_add(batch, cmd.form_code, await self.uow.batches.facts(batch.id))
            if not gate.allowed:
                raise GateNotMet(gate.blockers)
            record = measurements.build(cmd, batch, self.clock.now(), actor)
            issues = await self.quality.check(self.uow, record, batch)      # error → raise, warning → lưu
            seq = await self.uow.measurements.next_seq(batch.id, record.day)
            saved = await self.uow.measurements.add(record.with_seq(seq))
            await self.work.on_record_added(self.uow, batch.id, cmd.form_code, saved.id)
            await self.uow.commit()
        return MeasurementDTO.from_entity(saved)
```

- Query use case trả DTO có sẵn cờ `can_*` cho UI.
- `public.py` chỉ export hàm async nhận `uow`; không export repository.

## 11. API

- Router mỏng: parse schema → gọi use case → trả schema. Khai báo `responses` cho 403 / 404 / 409 / 412 / 422.
- `operation_id` theo `generate_unique_id_function=lambda r: r.name` với tên hàm `<tag>_<verb>_<noun>` duy nhất toàn app (FastAPI yêu cầu tên hàm duy nhất).
- Lỗi: handler chung chuyển `DomainError` thành `application/problem+json` (RFC 9457) — FastAPI không có sẵn, tự viết trong `shared_kernel/api/problem.py` (ADR-0007).
- Xuất OpenAPI: lệnh `uv run genetics export-openapi > ../../contracts/openapi/openapi.json`; CI so sánh.

## 12. Xác thực và phân quyền

- Token Entra ID v2 (`requestedAccessTokenVersion = 2` trong app registration API). Kiểm `iss` = `https://login.microsoftonline.com/{tid}/v2.0`, `aud` = client id của API, chữ ký qua JWKS (`PyJWT` `PyJWKClient`, cache 24 giờ theo khuyến nghị Microsoft), `exp`.
- Nền tảng phiên = `azp` (v2). Mỗi nền tảng một app registration SPA: web, mobile. Token web gọi endpoint chỉ cho app → 403 `platform_not_allowed`.
- Lần đầu: tạo `app_user` từ `oid` (bất biến giữa app), `preferred_username` / `email`, `name`. Chưa có vai trò → 403 `account_pending`.
- RBAC: `auth.role`, `permission`, `role_permission(scope, device)`, `user_permission(effect grant|deny, batch_id, valid_until, reason)`, `user_scope`. Quyền hiệu lực = vai trò ∪ grant − deny, lọc theo device. **Deny thắng.** Code chỉ dùng mã quyền; cấm `if role == "manager"` (ruff custom rule hoặc grep CI).
- Ba lớp kiểm tra: dependency `require()` (403 sớm) → `actor.require()` trong use case → RLS. UI chỉ ẩn nút.
- Refresh token SPA hết hạn sau 24 giờ (Microsoft Learn): client phải chạy lại auth code flow mỗi ngày; API không làm gì thêm, nhưng tài liệu mobile ghi rõ outbox giữ dữ liệu trong lúc chờ đăng nhập lại.

## 13. Job nền

- Runner: **Procrastinate** (hàng đợi trên chính PostgreSQL, psycopg 3 async, có cron `@app.periodic`), thay cho arq + Redis trong bản docs trước (ADR-0005). Lý do: arq ở chế độ "maintenance only"; bỏ được Redis → ít một service phải vận hành / backup; cùng driver với SQLAlchemy 2.1.
- Job **gọi use case** với `Actor.system()`, không chứa logic riêng. Job được xếp **sau commit** (`uow.after_commit`) để không in nhãn cho batch chưa tồn tại.
- Danh sách job và lịch (cron chạy đúng một lần dù nhiều worker — Procrastinate đảm bảo):

| Job | Kích hoạt | Ghi chú |
|---|---|---|
| `render_labels` | sau chốt / tạo batch / bấm In nhãn | retry 3 lần |
| `parse_import` · `validate_import` | sau upload | |
| `generate_report` | người dùng yêu cầu (tuần / tháng / quý / năm; báo cáo batch) | PDF WeasyPrint |
| `generate_routine` | cron 00:15 VN + khi tạo batch | idempotent (`UNIQUE`) |
| `mark_late_routine` | cron 10 phút | |
| `relock_batches` | cron 5 phút | |
| `nightly_dq` | cron 01:00 VN | 3σ, hand-off |
| `export_large` | export > 10.000 dòng | file tạm 7 ngày |
- Điều kiện xem lại: nếu cần > 1 worker trên nhiều máy với thông lượng cao, hoặc cần job stream / pub-sub, cân nhắc lại Redis-based (SAQ / Taskiq).

## 14. Cấu hình, secret, quan sát

- `pydantic-settings` đọc biến môi trường; `.env.example` chỉ có tên biến; secret trong env của server / GitHub Environments. Không có secret trong repo, log, fixture (gitleaks trong pre-commit và CI).
- Log JSON bằng `structlog` với `contextvars` (`clear_contextvars()` đầu request, bind `trace_id`, `user_id`, `route`); cảnh báo: contextvars không chảy giữa sync và async — handler đều async.
- `trace_id` từ `X-Request-ID` hoặc sinh mới; trả lại trong header và body lỗi.
- `/healthz` (process sống), `/readyz` (DB + hàng đợi). Sentry SDK (tự bật integration FastAPI khi cài). OpenTelemetry FastAPI instrumentation còn ở dòng beta → không bắt buộc ở bản đầu, ghi ở `open-questions.md`.
- Chạy: `fastapi run` / `uvicorn --workers 1` trong container; scale bằng replicas nếu cần (API stateless).

## 15. Ví dụ luồng xuyên suốt: Chốt Egg → Neonate (F-0617)

1. Web gọi `POST /api/v1/batches/{id}/close` với `If-Match: "14"`, body `{end_date, note}`.
2. `require("stage.close", scope="all", device="web")` kiểm token, nền tảng, quyền → 403 nếu thiếu.
3. Use case `CloseStage`: `actor.require(...)` lại; `async with uow` (BEGIN, `set_config(app.*)`); `batches.get_for_update(id)`; `check_version(14)` → 412 nếu lệch; `facts = batches.facts(id)`; `dq = quality.public.blocking_issues(uow, id)`.
4. Domain `transitions.close_stage(batch, facts, …)` → `GateNotMet(blockers)` (409) hoặc `CloseOutcome(closed, created=[neonate F+1], transfers, label_requests)`.
5. `batches.save_close(outcome)` (UPDATE batch, INSERT batch + batch_transfer; trigger audit ghi 3 dòng cùng `request_id`); `work.public.on_batch_closed` (huỷ routine, cancel task data), `work.public.on_batch_created` (sinh routine hôm nay + mai).
6. `uow.after_commit(labels.enqueue(label_requests))`; `commit()`; job `render_labels` chạy sau.
7. Response 200 `{closed, created[], transfers[]}`; web invalidate query `batches.detail(id)`, `batches.list(stage=egg|neonate)`, `me.work`.
8. Test: unit (gate mọi blocker, plan_children), integration (rollback khi exception sau INSERT, RLS Worker bị chặn, audit có reason), API (200 / 403 / 409 / 412), contract (schemathesis).

## 16. Kiểm chứng tự động (rule → cách kiểm)

| Quy tắc | Công cụ | Chạy ở |
|---|---|---|
| Lớp và module không import sai hướng | import-linter (`layers`, `forbidden`, `independence`, `acyclic siblings`) | pre-commit, CI |
| Domain không I/O | import-linter forbidden (`datetime.now` kiểm bằng ruff `DTZ` + grep) | CI |
| Kiểu đầy đủ | mypy `--strict` cho `domain`, `application`; chuẩn cho phần còn lại | CI |
| Format / lint | ruff (format + lint, rule `B`, `UP`, `ASYNC`, `S` chọn lọc) | pre-commit, CI |
| Commit chỉ trong UoW | grep `\.commit\(` ngoài `shared_kernel/infrastructure/uow.py` → fail | CI |
| Không kiểm tên vai trò | grep `role\.code ==\|role == "` → fail | CI |
| Migration up/down/up và `alembic check` | pytest integration + testcontainers | CI |
| RLS đúng cho 4 vai trò | pytest integration: đăng nhập từng vai trò, thử đọc / sửa | CI |
| Audit có reason | pytest integration | CI |
| OpenAPI khớp code | `export-openapi` rồi `git diff --exit-code contracts/openapi/openapi.json` | CI |
| Không breaking change không khai báo | `oasdiff breaking` giữa base và PR | CI |
| Contract | schemathesis (`from_asgi`), không 5xx | CI |
| Coverage domain ≥ 90 % | pytest-cov với ngưỡng theo path | CI |
| Secret | gitleaks | pre-commit, CI |

## 17. Checklist khi thêm một endpoint ghi

- [ ] Use case có command, `actor.require` ở đầu, chạy trong UoW, trả DTO.
- [ ] Router khai báo `require(perm, scope)`, schema có ví dụ, `responses` 403 / 404 / 409 / 412 / 422, tên hàm duy nhất.
- [ ] Luật nằm ở domain, có unit test cho mọi nhánh lỗi.
- [ ] RLS / CHECK / UNIQUE tương ứng có trong migration, có test integration.
- [ ] Audit có lý do khi sửa bản ghi người khác.
- [ ] Ảnh hưởng tới `done_qty`, DQ, thông báo xử lý trong cùng transaction.
- [ ] `contracts/openapi/openapi.json` và `packages/api-client` được sinh lại trong cùng PR.
- [ ] Mã lỗi mới (nếu có) thêm vào `api-standards.md` §7 và `packages/shared` i18n.
