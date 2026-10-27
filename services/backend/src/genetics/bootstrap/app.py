"""`create_app()`: lifespan (engine), router `/api/v1`, `/healthz`, `/readyz`.

Chưa có: problem+json handler (ADR-0007, T0303), auth (E02), job nền (T0304), structlog middleware.
`generate_unique_id_function=lambda r: r.name` → `operationId` = tên hàm router
(`<tag>_<verb>_<noun>`, duy nhất; api-standards.md §17).
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from genetics.bootstrap.container import Container
from genetics.bootstrap.health import router as health_router
from genetics.bootstrap.settings import Settings, load_settings

API_PREFIX = "/api/v1"


def build_api_router() -> APIRouter:
    """Router gốc `/api/v1`; mỗi module `include_router` router của nó ở đây khi có endpoint."""
    return APIRouter(prefix=API_PREFIX)


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings if settings is not None else load_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        container = Container.build(resolved)
        app.state.container = container
        try:
            yield
        finally:
            await container.aclose()

    app = FastAPI(
        title="Genetics Data Platform API",
        version="1.0.0",
        lifespan=lifespan,
        openapi_url=f"{API_PREFIX}/openapi.json",
        docs_url=f"{API_PREFIX}/docs" if resolved.docs_enabled else None,
        redoc_url=None,
        generate_unique_id_function=lambda r: r.name,
    )
    app.state.settings = resolved
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["ETag", "Location", "Retry-After", "X-Request-ID"],
    )
    app.include_router(health_router)
    app.include_router(build_api_router())
    return app
