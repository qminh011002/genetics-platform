"""Container: giữ tài nguyên sống suốt process và factory use case (nối port ↔ adapter).

Chưa có use case nào (T0301 chỉ dựng khung); mỗi module thêm factory ở đây khi có endpoint.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncEngine

from genetics.bootstrap.settings import Settings
from genetics.shared_kernel.infrastructure.engine import create_engine


@dataclass(frozen=True, slots=True)
class Container:
    settings: Settings
    engine: AsyncEngine

    @classmethod
    def build(cls, settings: Settings) -> Container:
        return cls(
            settings=settings, engine=create_engine(settings.database_url.get_secret_value())
        )

    async def aclose(self) -> None:
        await self.engine.dispose()
