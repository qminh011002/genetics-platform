"""Async engine SQLAlchemy 2.1 + psycopg 3 (ADR-0003, backend.md §7.1).

QueuePool mặc định (5 + 10) với `pool_pre_ping`; `NullPool` chỉ dùng trong test chạy nhiều event loop.
"""

from __future__ import annotations

import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

PING_TIMEOUT_SECONDS = 2.0


def create_engine(database_url: str) -> AsyncEngine:
    """Tạo engine; chưa mở kết nối nào cho tới lần dùng đầu."""
    return create_async_engine(database_url, pool_pre_ping=True)


async def ping(engine: AsyncEngine) -> bool:
    """`SELECT 1` trong `PING_TIMEOUT_SECONDS`; trả `False` khi DB không với tới (dùng cho `/readyz`)."""
    try:
        async with asyncio.timeout(PING_TIMEOUT_SECONDS), engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        # Readiness chỉ cần biết up / down: lỗi kết nối, timeout, xác thực đều là "down".
        return False
    return True
