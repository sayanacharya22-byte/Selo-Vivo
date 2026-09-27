from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings


def normalize_async_url(url: str) -> str:
    if url.startswith("postgresql+psycopg://") or url.startswith("sqlite+"):
        return url
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def build_engine(url: str | None = None) -> AsyncEngine:
    settings = get_settings()
    database_url = normalize_async_url(url or settings.database_url)
    options: dict[str, object] = {"pool_pre_ping": True}
    if not database_url.startswith("sqlite+"):
        options.update(pool_size=5, max_overflow=5, pool_recycle=300)
    return create_async_engine(database_url, **options)


engine = build_engine()
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
