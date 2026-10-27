"""T0301 tiêu chí 2: `/healthz` 200, `/readyz` 503 khi không có DB."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.api


async def test_healthz_returns_200(client_no_db: AsyncClient) -> None:
    response = await client_no_db.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_readyz_returns_503_without_db(client_no_db: AsyncClient) -> None:
    response = await client_no_db.get("/readyz")
    assert response.status_code == 503
    assert response.headers["Retry-After"] == "5"
    assert response.json() == {"status": "unavailable", "checks": {"database": "down"}}


async def test_health_endpoints_not_in_openapi(client_no_db: AsyncClient) -> None:
    response = await client_no_db.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert "/healthz" not in response.json()["paths"]
