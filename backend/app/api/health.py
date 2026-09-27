from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session

router = APIRouter(tags=["system"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "selo-vivo-api",
        "time": datetime.now(UTC).isoformat(),
    }


@router.get("/ready")
async def readiness(session: AsyncSession = Depends(get_session)) -> dict[str, str]:
    try:
        await session.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc
    return {"status": "ready", "database": "reachable"}
