"""T0303 acceptance and HTTP boundary regression tests; no database required."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

import pytest
from fastapi import Depends, FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse
from structlog.contextvars import get_contextvars

from genetics.bootstrap.app import build_api_router
from genetics.shared_kernel.api.concurrency import IfMatch, etag, require_if_match
from genetics.shared_kernel.api.pagination import (
    Page,
    Pagination,
    decode_cursor,
    encode_cursor,
    pagination,
    parse_sort,
)
from genetics.shared_kernel.domain.errors import ERROR_CODES, DomainError

pytestmark = pytest.mark.api


class Input(BaseModel):
    name: str
    count: int = Field(ge=1)


@pytest.fixture
async def problem_client(app_no_db: FastAPI):
    router = build_api_router()

    @router.post("/probe", name="probe_create")
    async def create(body: Input) -> Input:
        return body

    @router.patch("/probe", name="probe_patch")
    async def patch(match: Annotated[IfMatch, Depends(require_if_match)]):
        match.check(3)
        return JSONResponse({"version": 3}, headers={"ETag": etag(3)})

    @router.get("/error/{code}", name="probe_error")
    async def error(code: str):
        raise DomainError(
            code,
            detail="safe detail",
            errors=[{"field": "name", "code": "required"}],
            blockers=[{"code": "pending_individuals", "params": {"count": 24}}],
            required_permission="record.edit",
            scope="all",
            current_version=3,
            allowed=["completed"],
        )

    @router.get("/unexpected", name="probe_unexpected")
    async def unexpected():
        raise RuntimeError("secret-token-must-not-leak")

    @router.get("/http/{status}", name="probe_http")
    async def http_error(status: int):
        raise HTTPException(
            status,
            detail="private" if status >= 500 else "safe",
            headers={"WWW-Authenticate": "Bearer", "Retry-After": "5"},
        )

    @router.get("/list", name="probe_list")
    async def listing(params: Annotated[Pagination, Depends(pagination)]):
        fields = parse_sort(params.sort, allowed={"start_date", "code"})
        return {
            "limit": params.limit,
            "cursor": params.cursor,
            "total": params.include_total,
            "offset": params.offset,
            "q": params.q,
            "sort": [(f.field, f.descending) for f in fields],
        }

    @router.get("/context", name="probe_context")
    async def context():
        return get_contextvars()

    app_no_db.include_router(router)
    async with AsyncClient(
        transport=ASGITransport(app=app_no_db, raise_app_exceptions=False), base_url="http://test"
    ) as client:
        yield client


async def test_real_app_404(client_no_db: AsyncClient):
    response = await client_no_db.get("/api/v1/does-not-exist")
    assert response.status_code == 404
    assert response.headers["content-type"] == "application/problem+json"
    body = response.json()
    assert body["code"] == "not_found"
    assert body["status"] == 404
    assert UUID(body["trace_id"]).version == 7
    assert response.headers["x-request-id"] == body["trace_id"]
    assert response.headers["cache-control"] == "no-store"


async def test_validation_field_errors(problem_client: AsyncClient):
    response = await problem_client.post("/api/v1/probe", json={"count": 0})
    assert response.status_code == 422
    assert response.json()["code"] == "validation_failed"
    assert response.json()["errors"] == [
        {"field": "name", "code": "required"},
        {"field": "count", "code": "out_of_range"},
    ]
    assert "input" not in response.text


@pytest.mark.parametrize(
    ("header", "status"),
    [(None, 428), ('"2"', 412), ('W/"3"', 412), ("3", 412), ("*", 412), ('"3"', 200)],
)
async def test_if_match(problem_client: AsyncClient, header, status):
    response = await problem_client.patch(
        "/api/v1/probe", headers={"If-Match": header} if header else {}
    )
    assert response.status_code == status
    if status == 428:
        assert response.json()["code"] == "precondition_required"
    elif status == 412:
        assert response.json()["code"] == "version_conflict"
        assert response.json()["current_version"] == 3
    else:
        assert response.headers["etag"] == '"3"'


@pytest.mark.parametrize("code", ERROR_CODES)
async def test_catalogue_errors(problem_client: AsyncClient, code):
    response = await problem_client.get(f"/api/v1/error/{code}")
    assert response.status_code == ERROR_CODES[code]
    assert response.headers["content-type"] == "application/problem+json"
    assert response.json()["code"] == code
    assert response.json()["type"].endswith(f"/errors/{code}")
    if ERROR_CODES[code] < 500:
        assert response.json()["detail"] == "safe detail"
        assert response.json()["blockers"][0]["params"] == {"count": 24}
        assert response.json()["required_permission"] == "record.edit"
        assert response.json()["scope"] == "all"
        assert response.json()["allowed"] == ["completed"]
    else:
        assert "detail" not in response.json()


@pytest.mark.parametrize(
    ("language", "title"),
    [
        ("", "Không tìm thấy dữ liệu"),
        ("en-US", "Not found"),
        ("en;q=0.1,vi;q=0.9", "Không tìm thấy dữ liệu"),
        ("vi;q=0,en;q=1", "Not found"),
        ("fr", "Không tìm thấy dữ liệu"),
    ],
)
async def test_localized_titles(problem_client: AsyncClient, language, title):
    response = await problem_client.get("/api/v1/missing", headers={"Accept-Language": language})
    assert response.json()["title"] == title


@pytest.mark.parametrize("path", ["/healthz", "/api/v1/missing", "/api/v1/unexpected"])
async def test_request_headers_including_500(problem_client: AsyncClient, path):
    response = await problem_client.get(path, headers={"X-Request-ID": "upstream-123"})
    assert response.headers["x-request-id"] == "upstream-123"
    assert response.headers["cache-control"] == "no-store"
    if response.status_code == 500:
        assert response.json()["trace_id"] == "upstream-123"
        assert response.json()["code"] == "internal_error"
        assert "secret-token" not in response.text
        assert "detail" not in response.json()


async def test_structlog_context_reset(problem_client: AsyncClient):
    before = get_contextvars()
    first = await problem_client.get("/api/v1/context", headers={"X-Request-ID": "bound"})
    assert first.json()["trace_id"] == "bound"
    assert get_contextvars() == before
    second = await problem_client.get("/api/v1/context")
    assert UUID(second.json()["trace_id"]).version == 7
    assert get_contextvars() == before


@pytest.mark.parametrize(
    ("status", "code"),
    [
        (401, "unauthenticated"),
        (403, "permission_denied"),
        (405, "bad_request"),
        (503, "service_unavailable"),
    ],
)
async def test_http_errors_keep_status_and_headers(problem_client: AsyncClient, status, code):
    response = await problem_client.get(f"/api/v1/http/{status}")
    assert response.status_code == status
    assert response.json()["status"] == status
    assert response.json()["code"] == code
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.headers["retry-after"] == "5"
    if status >= 500:
        assert "private" not in response.text


async def test_openapi_errors(problem_client: AsyncClient):
    schema = (await problem_client.get("/api/v1/openapi.json")).json()
    responses = schema["paths"]["/api/v1/probe"]["post"]["responses"]
    for status, response in responses.items():
        if status.startswith("4"):
            assert response["content"]["application/problem+json"]["schema"] == {
                "$ref": "#/components/schemas/Problem"
            }
    assert {"type", "title", "status", "code", "trace_id"} <= set(
        schema["components"]["schemas"]["Problem"]["required"]
    )


async def test_cursor_sort_search_and_offset(problem_client: AsyncClient):
    values = {"start_date": "2026-10-01", "id": "opaque"}
    cursor = encode_cursor(values)
    assert decode_cursor(cursor) == values
    response = await problem_client.get(
        "/api/v1/list",
        params={
            "cursor": cursor,
            "limit": 200,
            "include_total": "true",
            "sort": "-start_date,code",
            "q": "tma",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "limit": 200,
        "cursor": values,
        "total": True,
        "offset": None,
        "sort": [["start_date", True], ["code", False]],
        "q": "tma",
    }
    response = await problem_client.get("/api/v1/list", params={"page": 3, "page_size": 20})
    assert response.json()["offset"] == 40
    assert response.json()["limit"] == 20
    assert response.json()["total"] is True
    response = await problem_client.get("/api/v1/list")
    assert response.json()["limit"] == 50
    assert response.json()["total"] is False
    assert Page[int](items=[1]).model_dump() == {"items": [1], "next_cursor": None}
    assert Page[int](items=[], total=0).model_dump()["total"] == 0


@pytest.mark.parametrize(
    ("params", "status"),
    [
        ({"limit": 201}, 422),
        ({"limit": 0}, 422),
        ({"page_size": 201, "page": 1}, 422),
        ({"page": 0, "page_size": 20}, 422),
        ({"cursor": "%%%bad"}, 400),
        ({"cursor": "W10="}, 400),
        ({"cursor": "e30="}, 400),
        ({"cursor": "a" * 8193}, 400),
        ({"page": 1}, 400),
        ({"page_size": 20}, 400),
        ({"page": 1, "page_size": 20, "cursor": "e30="}, 400),
        ({"sort": "unknown"}, 400),
    ],
)
async def test_invalid_list_parameters(problem_client: AsyncClient, params, status):
    response = await problem_client.get("/api/v1/list", params=params)
    assert response.status_code == status
    assert response.json()["code"] == ("bad_request" if status == 400 else "validation_failed")
