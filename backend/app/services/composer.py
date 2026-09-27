import asyncio
import json
import logging
from typing import Literal

from google import genai
from pydantic import BaseModel, Field

from app.core.config import Settings

logger = logging.getLogger(__name__)


class ProofPlan(BaseModel):
    summary: str = Field(max_length=240)
    public_disclosures: list[str] = Field(min_length=1, max_length=5)
    private_inputs: list[str] = Field(min_length=1, max_length=8)
    circuit_checks: list[str] = Field(min_length=1, max_length=6)
    risk_notes: list[str] = Field(max_length=4)
    confidence: float = Field(ge=0, le=1)


class ComposerResult(BaseModel):
    plan: ProofPlan
    provider: Literal["gemini", "local"]
    model: str | None


def local_plan(labels: list[str]) -> ProofPlan:
    credential_class = labels[0] if labels else "classe da credencial"
    return ProofPlan(
        summary=(
            "Prove validade e compatibilidade com o requisito usando somente uma classe ampla "
            "e um resultado booleano público."
        ),
        public_disclosures=["resultado válido", credential_class, "tag pública do requisito"],
        private_inputs=[
            "identidade do titular",
            "segredo do titular",
            "data exata de expiração",
            "evidência de bioma",
            "documento da auditoria",
        ],
        circuit_checks=[
            "compromisso do emissor corresponde à raiz pública",
            "classe privada satisfaz a classe solicitada",
            "expiração privada supera o limite público",
            "grupo de bioma privado satisfaz o escopo",
            "nullifier impede reuso para o mesmo requisito",
        ],
        risk_notes=[
            "O comprador deve confirmar que a classe ampla é suficiente para sua política."
        ],
        confidence=0.86,
    )


async def compose_with_gemini(
    requirement: str,
    labels: list[str],
    settings: Settings,
) -> ComposerResult:
    if not settings.gemini_api_key:
        return ComposerResult(plan=local_plan(labels), provider="local", model=None)

    prompt = f"""
Você é o Compositor de Provas do Selo Vivo. Transforme um requisito PÚBLICO de
compras em um plano de divulgação mínima para uma credencial Midnight.

Requisito público:
{requirement}

Rótulos não sensíveis disponíveis:
{json.dumps(labels, ensure_ascii=False)}

Regras absolutas:
- Nunca peça identidade, documento, endereço, coordenadas, carteira, segredo ou witness.
- A saída pública deve ser a menor possível.
- O plano deve separar divulgações públicas, entradas privadas e checagens do circuito.
- Não afirme conformidade legal; descreva riscos quando houver ambiguidade.
- Responda em português brasileiro.
""".strip()

    def invoke() -> str:
        client = genai.Client(api_key=settings.gemini_api_key)
        interaction = client.interactions.create(
            model=settings.gemini_model,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": ProofPlan.model_json_schema(),
            },
        )
        return interaction.output_text

    try:
        raw = await asyncio.wait_for(asyncio.to_thread(invoke), timeout=12)
        plan = ProofPlan.model_validate_json(raw)
        return ComposerResult(plan=plan, provider="gemini", model=settings.gemini_model)
    except Exception as exc:
        logger.warning(
            "Gemini composer degraded to the local policy engine: %s", type(exc).__name__
        )
        return ComposerResult(plan=local_plan(labels), provider="local", model=None)
