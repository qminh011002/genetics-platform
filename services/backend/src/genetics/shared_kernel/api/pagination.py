"""Cursor / offset list parameters and sort allowlist (api-standards §10)."""

from __future__ import annotations

import base64
import binascii
import json
from dataclasses import dataclass
from typing import Annotated, Any

from fastapi import Query
from pydantic import BaseModel, SerializerFunctionWrapHandler, model_serializer

from genetics.shared_kernel.domain.errors import BadRequest


class Page[T](BaseModel):
    items: list[T]
    next_cursor: str | None = None
    total: int | None = None

    @model_serializer(mode="wrap")
    def omit_absent_total(self, handler: SerializerFunctionWrapHandler) -> dict[str, Any]:
        data: dict[str, Any] = handler(self)
        if self.total is None:
            data.pop("total", None)
        return data


def encode_cursor(values: dict[str, Any]) -> str:
    payload = json.dumps(values, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    return base64.urlsafe_b64encode(payload.encode()).decode()


def _reject_nonfinite(value: str) -> None:
    raise ValueError(f"Non-finite JSON number: {value}")


def decode_cursor(value: str) -> dict[str, Any]:
    try:
        if len(value) > 8192:
            raise ValueError("cursor too long")
        raw = base64.b64decode(value, altchars=b"-_", validate=True)
        data = json.loads(raw, parse_constant=_reject_nonfinite)
        if not isinstance(data, dict) or not data:
            raise ValueError("cursor must be a nonempty object")
        return data
    except (ValueError, UnicodeError, binascii.Error, RecursionError) as exc:
        raise BadRequest(detail="Invalid cursor") from exc


@dataclass(frozen=True)
class SortField:
    field: str
    descending: bool = False


def parse_sort(value: str | None, *, allowed: set[str]) -> list[SortField]:
    if value is None:
        return []
    result = []
    for token in value.split(","):
        field = token.removeprefix("-")
        if field not in allowed:
            raise BadRequest(detail="Unknown sort field")
        result.append(SortField(field, token.startswith("-")))
    return result


@dataclass(frozen=True)
class Pagination:
    limit: int
    cursor: dict[str, Any] | None
    include_total: bool
    sort: str | None
    q: str | None
    page: int | None
    page_size: int | None

    @property
    def offset(self) -> int | None:
        return (self.page - 1) * self.limit if self.page is not None else None


def pagination(
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    cursor: str | None = None,
    include_total: bool = False,
    sort: str | None = None,
    q: str | None = None,
    page: Annotated[int | None, Query(ge=1)] = None,
    page_size: Annotated[int | None, Query(ge=1, le=200)] = None,
) -> Pagination:
    if (page is None) != (page_size is None) or (page is not None and cursor is not None):
        raise BadRequest(detail="Use cursor or both page and page_size")
    return Pagination(
        limit=page_size if page_size is not None else limit,
        cursor=decode_cursor(cursor) if cursor is not None else None,
        include_total=include_total or page is not None,
        sort=sort,
        q=q,
        page=page,
        page_size=page_size,
    )
