"""RFC 9457 responses, exception handlers and request correlation (ADR-0007)."""

from __future__ import annotations

import secrets
import time
from collections.abc import Mapping
from http import HTTPStatus
from typing import Any
from uuid import UUID

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from starlette.datastructures import Headers, MutableHeaders
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send
from structlog.contextvars import bind_contextvars, reset_contextvars

from genetics.shared_kernel.api.titles import TITLES
from genetics.shared_kernel.domain.errors import ERROR_CODES, DomainError

MEDIA_TYPE = "application/problem+json"


class FieldError(BaseModel):
    field: str
    code: str
    message: str | None = None
    params: dict[str, Any] | None = None


class Blocker(BaseModel):
    code: str
    params: dict[str, Any] | None = None


class Problem(BaseModel):
    type: str
    title: str
    status: int
    code: str
    trace_id: str
    detail: str | None = None
    errors: list[FieldError] | None = None
    blockers: list[Blocker] | None = None
    required_permission: str | None = None
    scope: str | None = None
    current_version: int | None = None
    allowed: list[str] | None = None


def responses(*statuses: int) -> dict[int | str, dict[str, Any]]:
    """Declare Problem for errors; default covers every standard 4xx status.

    FastAPI registers the model in components; explicit problem media type is
    supplied so consumers need not infer it from the default JSON response class.
    """
    selected = statuses or tuple(s.value for s in HTTPStatus if 400 <= s.value < 500)
    return {
        status: {
            "model": Problem,
            "description": HTTPStatus(status).phrase,
            "content": {MEDIA_TYPE: {"schema": {"$ref": "#/components/schemas/Problem"}}},
        }
        for status in selected
    }


def _request_id() -> str:
    # RFC 9562 UUIDv7 layout; stdlib uuid7 is unavailable on Python 3.13.
    value = (time.time_ns() // 1_000_000) << 80
    value |= 7 << 76 | secrets.randbits(12) << 64 | 2 << 62 | secrets.randbits(62)
    return str(UUID(int=value))


class RequestContextMiddleware:
    """Pure ASGI: preserve streaming and bind/reset structlog context per request."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        trace_id = Headers(scope=scope).get("x-request-id") or _request_id()
        scope.setdefault("state", {})["trace_id"] = trace_id
        tokens = bind_contextvars(trace_id=trace_id)

        async def send_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers["X-Request-ID"] = trace_id
                headers["Cache-Control"] = "no-store"
            await send(message)

        try:
            await self.app(scope, receive, send_headers)
        finally:
            reset_contextvars(**tokens)


def _language(header: str) -> str:
    choices: list[tuple[float, str]] = []
    for item in header.lower().split(","):
        language, *params = item.strip().split(";")
        quality = 1.0
        for param in params:
            if param.strip().startswith("q="):
                try:
                    quality = float(param.strip()[2:])
                except ValueError:
                    quality = 0.0
        base = language.split("-")[0]
        if base in TITLES and 0 < quality <= 1:
            choices.append((quality, base))
    return max(choices, key=lambda item: item[0])[1] if choices else "vi"


def _response(
    request: Request,
    error: DomainError,
    *,
    status: int | None = None,
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    trace_id = getattr(request.state, "trace_id", None) or _request_id()
    if error.status >= 500:
        error = DomainError(error.code)
    body = Problem(
        type=f"https://genetics.entobel.com/errors/{error.code}",
        title=TITLES[_language(request.headers.get("accept-language", ""))][error.code],
        status=status or error.status,
        code=error.code,
        trace_id=trace_id,
        detail=error.detail if error.status < 500 else None,
        errors=[FieldError.model_validate(e) for e in error.errors]
        if error.errors and error.status < 500
        else None,
        blockers=[Blocker.model_validate(b) for b in error.blockers]
        if error.blockers and error.status < 500
        else None,
        required_permission=error.required_permission,
        scope=error.scope,
        current_version=error.current_version,
        allowed=error.allowed,
    )
    return JSONResponse(
        body.model_dump(exclude_none=True),
        status_code=body.status,
        media_type=MEDIA_TYPE,
        headers={**(headers or {}), "X-Request-ID": trace_id, "Cache-Control": "no-store"},
    )


async def domain_error_handler(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, DomainError):
        return await unexpected_error_handler(request, exc)
    return _response(request, exc)


async def validation_error_handler(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, RequestValidationError):
        return await unexpected_error_handler(request, exc)
    errors: list[dict[str, object]] = []
    for error in exc.errors():
        loc = list(error["loc"])
        if loc and loc[0] in {"body", "query", "path", "header", "cookie"}:
            loc.pop(0)
        kind = error["type"]
        code = "required" if kind == "missing" else "invalid_format"
        if kind in {
            "greater_than",
            "greater_than_equal",
            "less_than",
            "less_than_equal",
            "too_short",
            "too_long",
            "string_too_short",
            "string_too_long",
        }:
            code = "out_of_range"
        # Do not echo input/context: they may contain secrets or non-JSON objects.
        errors.append({"field": ".".join(map(str, loc)), "code": code})
    return _response(request, DomainError("validation_failed", errors=errors))


async def http_error_handler(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, HTTPException):
        return await unexpected_error_handler(request, exc)
    defaults = {status: code for code, status in ERROR_CODES.items()}
    defaults.update(
        {
            401: "unauthenticated",
            403: "permission_denied",
            409: "invalid_transition",
            422: "validation_failed",
        }
    )
    code = defaults.get(
        exc.status_code, "internal_error" if exc.status_code >= 500 else "bad_request"
    )
    detail = exc.detail if isinstance(exc.detail, str) else None
    return _response(
        request, DomainError(code, detail=detail), status=exc.status_code, headers=exc.headers
    )


async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    structlog.get_logger().error(
        "unhandled_exception", exc_info=exc, trace_id=getattr(request.state, "trace_id", None)
    )
    return _response(request, DomainError("internal_error"))


def install_problem_handlers(app: FastAPI) -> None:
    app.add_middleware(RequestContextMiddleware)
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(HTTPException, http_error_handler)
    app.add_exception_handler(Exception, unexpected_error_handler)
