import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import Settings, get_settings
from app.db import get_session
from app.main import create_app
from app.models import Base


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    app = create_app()

    async def test_session():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_session] = test_session
    app.dependency_overrides[get_settings] = lambda: Settings(
        database_url="sqlite+aiosqlite:///:memory:", gemini_api_key=None
    )
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value
    await engine.dispose()
