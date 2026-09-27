# Security policy

## Reporting

Do not open a public issue for a suspected vulnerability or a leaked credential. Use GitHub's private vulnerability reporting for this repository. Include the affected component, reproduction steps, impact, and whether any public testnet transaction was submitted.

## Privacy boundary

Selo Vivo treats holder identity, document data, exact location, exact expiry, wallet material, credential secrets, witness values, and Gemini/API keys as private. These values must never be sent to FastAPI, Neon, Gemini, logs, analytics, or issue reports.

Only the deliberately disclosed Compact values and public transaction metadata may cross the device boundary. The API validates public receipt shapes, but callers must still inspect the 1AM transaction before approval.

## Supported environments

The latest commit on `main` is supported. Preview and Preprod contain test assets only; do not use real personal or commercial credential data.
