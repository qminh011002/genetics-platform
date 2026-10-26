# Backend · hướng dẫn agent (Codex)

Đọc `docs/architecture/backend.md` (§3 nguyên tắc, §4 luật lớp, §6 module, §7 persistence, §10 use case, §17 checklist) và `docs/architecture/api-standards.md`.

Lệnh (trong `services/backend` hoặc qua pnpm filter `@genetics/backend`): `uv run pytest -m unit` · `uv run pytest` (cần Docker) · `uv run lint-imports` · `uv run ruff check . && uv run ruff format .` · `uv run mypy src` · `uv run alembic revision -m "<muc dich>"` · `uv run genetics export-openapi > ../../contracts/openapi/openapi.json` · `uv run genetics api|worker|seed-dev`.

Cấu trúc: `src/genetics/{bootstrap,shared_kernel,modules/<module>/{domain,application,infrastructure,api},jobs,templates}`; mỗi bảng có đúng một module ghi (bảng ở `backend.md` §6).

Bắt buộc: luật nghiệp vụ ở `domain` (không import FastAPI / SQLAlchemy / Pydantic); commit chỉ trong UoW; `actor.require()` đầu use case; migration có `downgrade`; view / trigger / policy qua alembic_utils / `ReplaceablePolicy`; tên hàm router duy nhất theo `<tag>_<verb>_<noun>`; mã lỗi mới thêm vào `api-standards.md` §7 và `packages/shared/src/codes.ts`.

Cấm: generic repository, base class use case, `if role.code == …`, `datetime.now()` trong domain, sửa `contracts/openapi/openapi.json` tay, thêm Redis / broker.
