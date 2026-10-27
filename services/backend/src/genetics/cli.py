"""CLI `genetics` (argparse, không thêm dependency): `api`, `worker`, `export-openapi`, `seed-dev`, `db-current`.

`worker` (T0304) và `seed-dev` (T0302 / seed) là stub: báo rõ và thoát mã 2 để không chạy ngầm "thành công".
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from collections.abc import Sequence

EXIT_OK = 0
EXIT_FAILURE = 1
EXIT_NOT_IMPLEMENTED = 2


def cmd_api(args: argparse.Namespace) -> int:
    import uvicorn

    uvicorn.run(
        "genetics.bootstrap.app:create_app",
        factory=True,
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=1,
    )
    return EXIT_OK


def cmd_worker(_: argparse.Namespace) -> int:
    print(
        "genetics worker: chưa có — hàng đợi Procrastinate thêm ở T0304 (ADR-0005).",
        file=sys.stderr,
    )
    return EXIT_NOT_IMPLEMENTED


def cmd_export_openapi(_: argparse.Namespace) -> int:
    """In OpenAPI 3.1 JSON ra stdout; `pnpm --filter @genetics/backend export-openapi` ghi vào contracts/."""
    from genetics.bootstrap.app import create_app
    from genetics.bootstrap.settings import Settings

    spec = create_app(Settings(env="test")).openapi()
    json.dump(spec, sys.stdout, indent=2, ensure_ascii=False, sort_keys=False)
    sys.stdout.write("\n")
    return EXIT_OK


def cmd_seed_dev(_: argparse.Namespace) -> int:
    print(
        "genetics seed-dev: chưa có — seed dữ liệu dev theo blueprint §5 sau khi có migration (T0302).",
        file=sys.stderr,
    )
    return EXIT_NOT_IMPLEMENTED


async def _db_current() -> int:
    from sqlalchemy import text
    from sqlalchemy.exc import OperationalError, ProgrammingError

    from genetics.bootstrap.settings import load_settings
    from genetics.shared_kernel.infrastructure.engine import create_engine

    engine = create_engine(load_settings().database_url.get_secret_value())
    try:
        async with engine.connect() as conn:
            try:
                rows = (
                    (await conn.execute(text("SELECT version_num FROM alembic_version")))
                    .scalars()
                    .all()
                )
            except ProgrammingError:
                print("alembic_version: chưa có bảng (chưa chạy migration).")
                return EXIT_OK
        print("\n".join(rows) if rows else "alembic_version: trống (chưa upgrade).")
        return EXIT_OK
    except OperationalError as exc:
        print(f"db-current: không kết nối được DATABASE_URL — {exc.orig}", file=sys.stderr)
        return EXIT_FAILURE
    finally:
        await engine.dispose()


def cmd_db_current(_: argparse.Namespace) -> int:
    """In revision Alembic hiện tại của DB (`alembic current` không cần alembic.ini — có ở T0302)."""
    return asyncio.run(_db_current())


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="genetics", description="Genetics Data Platform · backend CLI"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    api = sub.add_parser("api", help="Chạy API bằng uvicorn (1 worker; scale bằng replicas).")
    api.add_argument("--host", default="0.0.0.0")  # noqa: S104 — chạy trong container, nginx ở trước
    api.add_argument("--port", type=int, default=8000)
    api.add_argument("--reload", action="store_true", help="Chỉ dùng ở local.")
    api.set_defaults(func=cmd_api)

    sub.add_parser("worker", help="Worker job nền (stub, T0304).").set_defaults(func=cmd_worker)
    sub.add_parser("export-openapi", help="In OpenAPI JSON ra stdout.").set_defaults(
        func=cmd_export_openapi
    )
    sub.add_parser("seed-dev", help="Seed dữ liệu dev (stub).").set_defaults(func=cmd_seed_dev)
    sub.add_parser("db-current", help="In revision Alembic hiện tại của DB.").set_defaults(
        func=cmd_db_current
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    code: int = args.func(args)
    return code


if __name__ == "__main__":
    sys.exit(main())
