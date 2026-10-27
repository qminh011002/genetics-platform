"""T0301 tiêu chí 3: `genetics export-openapi` in JSON OpenAPI 3.1 hợp lệ; `operationId` = tên hàm router."""

from __future__ import annotations

import json

import pytest
from fastapi import APIRouter
from pydantic import SecretStr

from genetics.bootstrap.app import API_PREFIX, create_app
from genetics.bootstrap.settings import Settings
from genetics.cli import main

pytestmark = pytest.mark.unit


def test_export_openapi_prints_openapi_31(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["export-openapi"]) == 0
    spec = json.loads(capsys.readouterr().out)
    assert spec["openapi"].startswith("3.1.")
    assert spec["info"]["title"] == "Genetics Data Platform API"
    assert spec["paths"] == {}


def test_operation_id_is_route_name() -> None:
    app = create_app(Settings(env="test"))
    probe = APIRouter(prefix=API_PREFIX)

    @probe.get("/probe", name="probe_get_item")
    async def probe_get_item() -> dict[str, str]:
        return {}

    app.include_router(probe)
    assert app.openapi()["paths"][f"{API_PREFIX}/probe"]["get"]["operationId"] == "probe_get_item"


def test_docs_disabled_outside_local_and_staging() -> None:
    assert create_app(Settings(env="production")).docs_url is None
    assert create_app(Settings(env="local")).docs_url == f"{API_PREFIX}/docs"


def test_settings_defaults_keep_secrets_hidden() -> None:
    settings = Settings(env="test", database_url=SecretStr("postgresql+psycopg://u:p@h/db"))
    assert "p@h" not in repr(settings)
    assert settings.database_url.get_secret_value().startswith("postgresql+psycopg://")


def test_stub_commands_exit_non_zero(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["worker"]) == 2
    assert main(["seed-dev"]) == 2
    assert "chưa có" in capsys.readouterr().err
