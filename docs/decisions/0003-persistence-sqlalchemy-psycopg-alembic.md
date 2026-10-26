# ADR-0003 · Persistence: SQLAlchemy 2.1 async + psycopg 3, session per request, Alembic + alembic_utils, PK uuid

- Trạng thái: **Accepted** (chủ dự án duyệt qua trao đổi 26/10/2026) · Ngày: 2026-10-26 · **PostgreSQL 18, Python 3.13**

## Bối cảnh
Bản 1.0 ghi SQLAlchemy 2 + asyncpg, Python 3.12. Nghiên cứu 26/10/2026: SQLAlchemy 2.1.6 là bản hiện hành (2.0 "legacy"), mặc định driver PostgreSQL là psycopg 3, `greenlet` trong extra `[asyncio]`, autoflush vô điều kiện, `Select` typed theo cột. Alembic autogenerate không phát hiện view / function / trigger / policy RLS. Pydantic 2.14 serialize `Decimal` thành chuỗi JSON. PostgreSQL 16 còn hỗ trợ tới 11/2028; 18 có `uuidv7()`.

## Động lực
Một driver cho cả ORM và job nền (ADR-0005); migration là nguồn sự thật schema kể cả view / trigger / RLS; CI kiểm up / down / up; `SET LOCAL` cho RLS + audit bind được tham số; khoá lạc quan và `FOR UPDATE` cho chốt batch.

## Phương án
| Hạng mục | Chọn | Thay thế |
|---|---|---|
| Dòng SQLAlchemy | 2.1 (`sqlalchemy[asyncio]`) | 2.0 (legacy, vẫn maintenance) |
| Driver | psycopg 3 async (`postgresql+psycopg://`) | asyncpg (nhanh hơn trên benchmark của người khác — không dùng làm lý do; bất lợi: không bind tham số trong `SET`, hai driver nếu dùng Procrastinate) |
| Session | `async_sessionmaker(expire_on_commit=False)`, một session / request, commit ở use case | commit trong dependency `yield` (bị loại: exit code chạy sau khi response gửi) |
| Biến phiên | `SELECT set_config('app.x', :v, true)` ngay sau `BEGIN` trong UoW | `SessionEvents.after_begin` (tương đương; chọn cách tường minh) |
| Pool | QueuePool mặc định 5 + 10, `pool_pre_ping` | NullPool chỉ cho test multi-loop |
| Migration | Alembic 1.20 + `alembic_utils` (view, function, trigger) + helper `ReplaceablePolicy` cho RLS; seed trong migration; CI `alembic check` + up/down/up | SQL tay ngoài Alembic (loại: mất lịch sử) |
| PK | `uuid`; default DB `uuidv7()` (PG 18) cho bản ghi tạo ở server; client sinh v4 (`crypto.randomUUID()`) cho bản ghi offline — cả hai là `uuid` hợp lệ, không ràng buộc version | `bigint` (loại: client không sinh được) |
| Số đo | `Decimal` domain, `numeric` DB, JSON number (`PlainSerializer(float, when_used='json')`) | chuỗi JSON (mặc định Pydantic) — loại vì client phải parse |
| Postgres | **18** (cài mới; hỗ trợ tới 11/2030; `uuidv7()` sẵn; chú ý `PGDATA` theo version trong image) | 16 (khớp warehouse cũ; chỉ đọc khi migrate) |

## Quyết định đề xuất
Như cột "Chọn". Python **3.13** (dòng ổn định đang nhận bugfix, mọi thư viện có wheel; 3.14 chưa cần tính năng nào — xem lại khi 3.13 vào security-only).

## Hệ quả
- Dockerfile cài `psycopg[binary]` hoặc build `psycopg[c]`.
- SQLAlchemy 2.1 autoflush trên `text()` → `set_config` phải chạy trước khi có thay đổi ORM (đầu transaction) — đúng với thiết kế UoW.
- Mọi migration có `downgrade()`; policy RLS thay đổi = drop / create trong migration.
- Xem lại nếu: Procrastinate bị từ chối và chọn runner Redis → có thể quay lại asyncpg; nếu cần sắp xếp theo thời gian trên PK → uuid v7.

## Tham chiếu
SQLAlchemy asyncio, pooling, selectable `with_for_update`, events, migration 2.1; Alembic autogenerate / cookbook / branches / tutorial; Pydantic models / standard types / strict / performance; PostgreSQL 16 ddl-rowsecurity, sql-set, functions-admin, generated columns, uuid; PG versioning — `research-references.md` §A, truy cập 26/10/2026.
