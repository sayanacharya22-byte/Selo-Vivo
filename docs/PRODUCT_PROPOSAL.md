# Product proposal — Selo Vivo

## Approved idea track

**Confidential Credentials — prove a credential is valid without disclosing it.**

## One-line pitch

Selo Vivo is a private sustainability passport that helps Brazilian cooperatives satisfy buyer policies with a verifiable yes/no proof instead of handing over their identity, location, audits, and operating data.

## Problem

Procurement teams need evidence that suppliers meet sustainability requirements, but their questionnaires routinely over-collect information. Small producers face an unfair tradeoff: reveal sensitive business and location data or lose access to higher-value markets.

## Product

An accredited issuer gives a cooperative a private credential. A buyer publishes a requirement such as “regenerative credential valid through 2027 for an eligible broad biome.” Gemini translates that public text into a readable, minimal proof plan. The Compact circuit—not Gemini—makes the decision from the private credential.

## Primary users

- Brazilian producer cooperatives and family-farming networks holding sustainability credentials.
- Buyers, marketplaces, and financing partners that need a narrow compliance signal.
- Credential issuers and auditors that publish trusted commitment roots.

## Core experience

1. Connect 1AM on Preview or Preprod.
2. Review the buyer's public requirement.
3. Let Gemini propose the smallest disclosure surface.
4. Select a local credential and review protected/public fields.
5. Generate the proof and share the public Midnight receipt.

## Why Midnight

A normal signed database record proves who said something but does not hide the record from the verifier. Midnight lets Selo Vivo validate private values inside a circuit, reveal only the necessary result, prevent reuse with a nullifier, and keep a publicly auditable aggregate counter.

## Gemini's bounded role

Gemini receives only the public requirement and pre-approved, non-sensitive labels. It never receives the credential, witness, identity, exact expiry, location, or holder secret. Its output is advisory UX; the deterministic Compact circuit remains the source of truth.

## MVP scope

- One issuer root and one regenerative credential class.
- Expiry and broad-biome eligibility checks.
- Request-scoped nullifier and aggregate proof count.
- Preview/Preprod selection and 1AM wallet lifecycle.
- FastAPI public receipt index backed by Neon.
- Gemini composition with deterministic local fallback.

## Success measures

- A holder completes the proof flow in under two minutes.
- At least 60% fewer public fields than the equivalent buyer questionnaire.
- No private credential value appears in the API, Gemini request, database, logs, or ledger.
- A third party can verify the public transaction independently.

## Next product increments

- Multi-issuer governance and root rotation.
- Revocation proofs and credential renewal.
- Buyer-created reusable policy templates.
- Cooperative-controlled backup of encrypted private state.
- Independent security and circuit audits before production use.
