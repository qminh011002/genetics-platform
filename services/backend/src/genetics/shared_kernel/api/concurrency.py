"""Strong ETag / If-Match optimistic concurrency (api-standards §8)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Header

from genetics.shared_kernel.domain.errors import PreconditionRequired, VersionConflict


def etag(version: int) -> str:
    return f'"{version}"'


class IfMatch:
    """Dependency result; call check after loading the resource's current version."""

    def __init__(self, value: str) -> None:
        self.value = value

    def check(self, current_version: int) -> None:
        if self.value != etag(current_version):
            raise VersionConflict(current_version=current_version)


def require_if_match(if_match: Annotated[str | None, Header()] = None) -> IfMatch:
    if if_match is None:
        raise PreconditionRequired()
    return IfMatch(if_match)
