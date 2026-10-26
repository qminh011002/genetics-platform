---
paths: ["services/backend/**", "tools/legacy_import/**"]
---
Áp dụng `docs/architecture/backend.md`: domain thuần Python (cấm FastAPI / SQLAlchemy / Pydantic / httpx / `datetime.now`), một use case một transaction (commit chỉ trong `shared_kernel/infrastructure/uow.py`), `actor.require()` ở đầu use case, module giao tiếp qua `application/public.py`, mỗi bảng một module ghi, migration có downgrade, không generic repository, không kiểm tên vai trò. Sau khi đổi router: `uv run genetics export-openapi > ../../contracts/openapi/openapi.json` rồi `pnpm generate`. Chạy `uv run lint-imports && uv run pytest -m unit` trước khi báo xong.
