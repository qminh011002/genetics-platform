"""`/healthz` (process sống) và `/readyz` (DB; hàng đợi job thêm ở T0304). Ngoài `/api/v1`, không token.

Không đưa vào OpenAPI: hợp đồng `contracts/openapi/openapi.json` chỉ dành cho SDK (api-standards.md §2, §16).
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Request, Response, status
from pydantic import BaseModel

from genetics.shared_kernel.infrastructure.engine import ping

router = APIRouter(include_in_schema=False)

CheckStatus = Literal["up", "down"]


class Health(BaseModel):
    status: Literal["ok"] = "ok"


class Readiness(BaseModel):
    status: Literal["ok", "unavailable"]
    checks: dict[str, CheckStatus]


@router.get("/healthz", name="healthz")
async def healthz() -> Health:
    return Health()


@router.get("/readyz", name="readyz")
async def readyz(request: Request, response: Response) -> Readiness:
    db_up = await ping(request.app.state.container.engine)
    if not db_up:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        response.headers["Retry-After"] = "5"
    return Readiness(
        status="ok" if db_up else "unavailable", checks={"database": "up" if db_up else "down"}
    )
