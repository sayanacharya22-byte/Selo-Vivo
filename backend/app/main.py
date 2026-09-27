import logging
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.composer import router as composer_router
from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.core.config import get_settings
from app.db import engine
from app.models import Base

logger = logging.getLogger("selo_vivo.api")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    if settings.app_env == "development" and settings.database_url.startswith("sqlite+"):
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)
    app.add_middleware(GZipMiddleware, minimum_size=800)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["X-Request-ID", "Server-Timing"],
    )

    @app.middleware("http")
    async def production_headers(request: Request, call_next):
        supplied_id = request.headers.get("x-request-id", "")
        request_id = supplied_id if 8 <= len(supplied_id) <= 64 else uuid.uuid4().hex
        started = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - started) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["Server-Timing"] = f'app;dur={duration_ms:.1f}'
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.path.startswith(settings.api_prefix):
            response.headers["Cache-Control"] = "no-store"
        logger.info(
            "request completed method=%s path=%s status=%s duration_ms=%.1f request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        return response
    app.include_router(health_router)
    app.include_router(dashboard_router, prefix=settings.api_prefix)
    app.include_router(composer_router, prefix=settings.api_prefix)
    return app


app = create_app()
