"""Cấu hình bằng pydantic-settings (backend.md §14, getting-started.md §6).

Biến đọc từ môi trường; khi `ENV=local` đọc thêm `infra/.env` ở gốc monorepo
(file này không bao giờ được commit — `.gitignore`). `.env.example` chỉ có tên biến.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

Env = Literal["local", "test", "staging", "production"]
AuthMode = Literal["dev", "entra"]

# services/backend/src/genetics/bootstrap/settings.py → gốc monorepo (5 cấp trên `bootstrap`).
REPO_ROOT = Path(__file__).resolve().parents[5]
LOCAL_ENV_FILE = REPO_ROOT / "infra" / ".env"


class Settings(BaseSettings):
    """Toàn bộ biến môi trường của API và worker. Secret dùng `SecretStr` để không lọt vào log."""

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    env: Env = "local"
    auth_mode: AuthMode = "dev"
    log_level: str = "INFO"

    database_url: SecretStr = Field(
        default=SecretStr("postgresql+psycopg://app_rw:app_rw@localhost:5432/genetics"),
        description="Role `app_rw` (infrastructure.md §5).",
    )
    migration_database_url: SecretStr = Field(
        default=SecretStr("postgresql+psycopg://app_migrator:app_migrator@localhost:5432/genetics"),
        description="Role `app_migrator`, chỉ Alembic dùng.",
    )

    entra_tenant_id: str = ""
    entra_api_client_id: str = ""
    entra_web_client_id: str = ""
    entra_mobile_client_id: str = ""

    file_storage_root: Path = Path("./.data/files")
    public_web_url: str = "http://localhost:5173"
    public_mobile_url: str = "http://localhost:5174"
    sentry_dsn: SecretStr = SecretStr("")

    @property
    def docs_enabled(self) -> bool:
        """Swagger UI chỉ bật ở local / staging (api-standards.md §2)."""
        return self.env in ("local", "staging")

    @property
    def cors_origins(self) -> list[str]:
        return [self.public_web_url, self.public_mobile_url]


def load_settings() -> Settings:
    """Dựng `Settings`; `ENV=local` (mặc định) thì nạp thêm `infra/.env` nếu có."""
    env = os.environ.get("ENV", "local")
    env_file = LOCAL_ENV_FILE if env == "local" and LOCAL_ENV_FILE.is_file() else None
    # `_env_file` là tham số init riêng của pydantic-settings; mypy không thấy nếu không có plugin pydantic.
    init_kwargs: dict[str, Any] = {"_env_file": env_file}
    return Settings(**init_kwargs)
