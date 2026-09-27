from fastapi import APIRouter, Depends, Response
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import ComposerRun, Issuer, ProofEvent
from app.schemas import DashboardRead, ProofEventCreate, ProofEventRead

router = APIRouter(tags=["public-ledger"])


@router.get("/dashboard", response_model=DashboardRead)
async def dashboard(session: AsyncSession = Depends(get_session)) -> DashboardRead:
    proof_count = await session.scalar(select(func.count()).select_from(ProofEvent))
    issuer_count = await session.scalar(
        select(func.count()).select_from(Issuer).where(Issuer.active.is_(True))
    )
    composer_count = await session.scalar(select(func.count()).select_from(ComposerRun))
    proofs = list(
        (
            await session.scalars(
                select(ProofEvent).order_by(ProofEvent.created_at.desc()).limit(5)
            )
        ).all()
    )
    issuers = list(
        (await session.scalars(select(Issuer).where(Issuer.active.is_(True)))).all()
    )
    return DashboardRead(
        verified_proofs=proof_count or 0,
        active_issuers=issuer_count or 0,
        composer_runs=composer_count or 0,
        recent_proofs=proofs,
        issuers=issuers,
    )


@router.post("/proofs", response_model=ProofEventRead, status_code=201)
async def record_public_proof(
    payload: ProofEventCreate,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> ProofEvent:
    existing = await session.scalar(
        select(ProofEvent).where(ProofEvent.transaction_id == payload.transaction_id)
    )
    if existing is not None:
        response.status_code = 200
        return existing
    proof = ProofEvent(**payload.model_dump())
    session.add(proof)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        existing = await session.scalar(
            select(ProofEvent).where(ProofEvent.transaction_id == payload.transaction_id)
        )
        if existing is None:
            raise
        response.status_code = 200
        return existing
    await session.refresh(proof)
    return proof
