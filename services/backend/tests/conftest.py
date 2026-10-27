"""Fixture chung. Test API: httpx AsyncClient + ASGITransport + asgi-lifespan (backend.md §5)."""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
from asgi_lifespan import LifespanManager
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from pydantic import SecretStr

from genetics.bootstrap.app import create_app
from genetics.bootstrap.settings import Settings

# Cổng 1 không có gì lắng nghe → kết nối bị từ chối ngay, không phụ thuộc Postgres local.
UNREACHABLE_DB_URL = "postgresql+psycopg://nobody:nobody@127.0.0.1:1/genetics"


@pytest.fixture
def settings_no_db() -> Settings:
    return Settings(env="test", database_url=SecretStr(UNREACHABLE_DB_URL))


@pytest.fixture
async def app_no_db(settings_no_db: Settings) -> AsyncIterator[FastAPI]:
    app = create_app(settings_no_db)
    async with LifespanManager(app):
        yield app


@pytest.fixture
async def client_no_db(app_no_db: FastAPI) -> AsyncIterator[AsyncClient]:
    async with AsyncClient(
        transport=ASGITransport(app=app_no_db), base_url="http://test"
    ) as client:
        yield client
