import hashlib

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.db import get_session
from app.models import ComposerRun
from app.services.composer import ComposerResult, compose_with_gemini
from app.services.privacy import minimize_public_text, safe_labels

router = APIRouter(tags=["gemini-composer"])


class ComposeRequest(BaseModel):
    requirement: str = Field(min_length=8, max_length=2000)
    credential_labels: list[str] = Field(default_factory=list, max_length=12)


class ComposeResponse(ComposerResult):
    redactions: list[str]
    safety_note: str


@router.post("/compose", response_model=ComposeResponse)
async def compose_proof(
    payload: ComposeRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> ComposeResponse:
    minimized = minimize_public_text(payload.requirement)
    labels = safe_labels(payload.credential_labels)
    result = await compose_with_gemini(minimized.text, labels, settings)
    safety_note = (
        "Gemini received only the public requirement and non-sensitive labels; "
        "credential values and witnesses remained local."
    )
    requirement_hash = hashlib.sha256(minimized.text.encode("utf-8")).hexdigest()
    session.add(
        ComposerRun(
            requirement_hash=requirement_hash,
            credential_labels=labels,
            plan=result.plan.model_dump(),
            provider=result.provider,
            model=result.model,
            safety_note=safety_note,
        )
    )
    await session.commit()
    return ComposeResponse(
        **result.model_dump(),
        redactions=list(minimized.redactions),
        safety_note=safety_note,
    )
