# Privacy model

## Assets and boundaries

| Asset | Location | Public? |
|---|---|---|
| Holder secret | Ephemeral browser memory / Compact witness | No |
| Holder identity and credential ID | Ephemeral browser memory | No |
| Exact expiry epoch | Compact witness | No |
| Biome evidence group | Compact witness | No |
| Issuer commitment held by credential | Compact witness | No |
| Registered issuer root | Midnight ledger | Yes |
| Requested credential class | Buyer request / Midnight ledger | Yes |
| Request tag | SHA-256 of public requirement / ledger | Yes |
| Request-scoped nullifier | Derived in circuit / ledger | Yes |
| Verified-proof count | Midnight ledger and public API | Yes |

## Deliberate disclosure

The proof circuit uses `disclose()` for exactly three derived or already-public values:

1. `nullifier` — lets the ledger reject reuse for the same public request without identifying the holder.
2. `required_class` — the buyer selected this class before proving; disclosing it binds the public receipt to that policy.
3. `request_tag` — binds the proof to a hash of the public requirement.

The exact expiry and biome group are checked against public thresholds but are not disclosed. The issuer commitment witness is compared with the public root without publishing the witness separately. The holder secret is used only to derive the nullifier.

## Gemini boundary

The browser sends the FastAPI composer:

- public buyer requirement text;
- three safe labels: regenerative, validity, and broad biome.

FastAPI redacts obvious emails, phone numbers, coordinates, document numbers, long identifiers, and secret assignments before invoking Gemini. The database stores only a SHA-256 requirement hash, safe labels, generated plan, provider/model, and a safety note. It does not retain the raw requirement.

## Database boundary

Neon stores issuer public metadata, finalized public proof receipts, composer-run metadata, and aggregate metrics. Model validation recursively rejects fields named `secret`, `holder_id`, `document`, `exact_location`, or `wallet_address` from public receipt payloads. Receipt writes are idempotent by transaction ID, and API responses are marked `no-store`.

## Threats and mitigations

- **Requirement linkability:** the same requirement produces the same tag. Buyers should use unique request wording or a public nonce when unlinkability matters.
- **Device compromise:** private demo material exists only in memory, but a malicious extension or compromised origin can still inspect a live page. Real credentials should use a reviewed encrypted or wallet-managed provider.
- **Issuer trust:** the issuer root is constructor-bound so there is no first-writer window. Root rotation still requires a governed contract version and audit trail.
- **Metadata correlation:** timing and network metadata remain observable. Batching or relaying can reduce correlation in a later version.
- **AI prompt injection:** Gemini does not control circuit inputs or calls. Its plan is advisory and constrained to structured output.
- **Frontend compromise:** compiled artifacts are checked in CI and the hosted configuration applies CSP and anti-framing headers. Reproducible-build attestation remains future work.
