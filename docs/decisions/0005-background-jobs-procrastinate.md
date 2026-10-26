# ADR-0005 · Job nền chạy trên PostgreSQL (Procrastinate), không dùng Redis

- Trạng thái: **Accepted** (chủ dự án duyệt qua trao đổi 26/10/2026) · Ngày: 2026-10-26 · thay arq + Redis của overview 1.0

## Bối cảnh
Job: in nhãn PDF, parse / validate import, report PDF, sinh việc định kỳ 00:15, đánh dấu trễ 10 phút, khoá lại batch 5 phút, DQ đêm, export lớn (`backend.md` §13). Khối lượng: vài chục job / ngày. Nghiên cứu 26/10/2026: arq 0.28 "In maintenance only mode" (PyPI); Procrastinate 3.10 (PostgreSQL 13+, async psycopg 3, cron `@app.periodic`, chạy đúng một lần dù nhiều worker); SAQ 0.26 (Redis hoặc Postgres); Taskiq 0.13 (Redis / AMQP / NATS); Celery 5.6 (không async-native); Dramatiq 2.2 (cần APScheduler cho cron).

## Động lực
Ít service phải vận hành / backup; async-native; cron; retry; job chỉ gọi use case; không mất job khi restart.

## Phương án
| | Procrastinate (Postgres) | arq (Redis) | SAQ (Redis / Postgres) | Taskiq | Celery |
|---|---|---|---|---|---|
| Service thêm | **không** | Redis | Redis hoặc không | Redis / AMQP | Redis / AMQP |
| Async | có (psycopg 3) | có | có | có | không native |
| Cron | có | có | có | có (scheduler riêng) | beat |
| Bảo trì | hoạt động (9/2026) | maintenance-only | hoạt động | hoạt động | hoạt động |
| Driver trùng với ORM | có (psycopg 3, ADR-0003) | — | — | — | — |
| Backup / transaction | job trong cùng DB: enqueue trong transaction nghiệp vụ, rollback là mất job (đúng ý muốn) | cần `after_commit` | | | |

## Đánh đổi
- Procrastinate dùng bảng + `LISTEN/NOTIFY` trong DB nghiệp vụ → thêm tải nhỏ, hoàn toàn chấp nhận được với khối lượng này; schema riêng `procrastinate` do migration của thư viện quản lý (chạy `procrastinate schema --apply` trong entrypoint, hoặc nhúng vào Alembic).
- Mất "kinh nghiệm cộng đồng" của Celery; đổi lại ít vận hành.
- Nếu sau này cần job stream / pub-sub thời gian thực → Redis vẫn thêm được.

## Quyết định đề xuất
Procrastinate 3.x, worker chạy cùng image API (`genetics worker`), cron khai báo trong `jobs/`, job gọi use case với `Actor.system()`. Enqueue trong cùng transaction nghiệp vụ khi hợp lý (nhãn sau chốt) — thay cơ chế `after_commit` bằng "job được commit cùng dữ liệu".

## Hệ quả
- Bỏ `redis` khỏi Compose; `/readyz` kiểm bảng job thay vì Redis.
- `backend.md` §13, `infrastructure.md` cập nhật (đã làm). Nếu ADR bị từ chối: quay lại SAQ (Redis) + `after_commit`, giữ asyncpg hoặc psycopg.
- Xem lại nếu: > 1 máy worker với thông lượng > 100 job / phút, hoặc cần hàng đợi ngoài DB.

## Tham chiếu
PyPI / docs của arq, Procrastinate (connector, cron), SAQ, Taskiq, Dramatiq, Celery — `research-references.md` §A.
