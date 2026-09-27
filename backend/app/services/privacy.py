import re
from dataclasses import dataclass

EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE = re.compile(r"(?<!\d)(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}(?!\d)")
LONG_HEX = re.compile(r"\b(?:0x)?[a-fA-F0-9]{40,}\b")
COORDINATES = re.compile(r"(?<!\d)-?\d{1,3}\.\d{4,}\s*[,;/]\s*-?\d{1,3}\.\d{4,}(?!\d)")
SECRET_ASSIGNMENT = re.compile(
    r"(?i)\b(api[_ -]?key|private[_ -]?key|secret|seed phrase|mnemonic|password)\b\s*[:=]\s*\S+"
)
DOCUMENT_NUMBER = re.compile(r"\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b")


@dataclass(frozen=True)
class MinimizedText:
    text: str
    redactions: tuple[str, ...]


def minimize_public_text(value: str) -> MinimizedText:
    text = value.strip()[:2000]
    found: list[str] = []
    replacements = (
        (SECRET_ASSIGNMENT, "[SEGREDO REMOVIDO]", "secret"),
        (EMAIL, "[EMAIL REMOVIDO]", "email"),
        (PHONE, "[TELEFONE REMOVIDO]", "phone"),
        (COORDINATES, "[LOCALIZAÇÃO EXATA REMOVIDA]", "coordinates"),
        (DOCUMENT_NUMBER, "[DOCUMENTO REMOVIDO]", "document"),
        (LONG_HEX, "[IDENTIFICADOR REMOVIDO]", "identifier"),
    )
    for pattern, replacement, label in replacements:
        text, count = pattern.subn(replacement, text)
        if count:
            found.append(label)
    return MinimizedText(text=text, redactions=tuple(sorted(set(found))))


def safe_labels(labels: list[str]) -> list[str]:
    cleaned: list[str] = []
    for label in labels[:12]:
        minimized = minimize_public_text(label[:80])
        if not minimized.redactions and minimized.text:
            cleaned.append(minimized.text)
    return sorted(set(cleaned))
