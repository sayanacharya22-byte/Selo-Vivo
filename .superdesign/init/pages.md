# Page inventory

## Proof Studio (`/`)

Purpose: allow a credential holder to connect 1AM, inspect exactly what will be disclosed, invoke a Midnight Compact proof, and store only public telemetry in the FastAPI/Neon control plane.

Dependency tree:

```text
App
└── AppShell
    ├── BrandMark
    ├── Navigation
    ├── Privacy summary
    └── ProofStudio
        ├── Wallet/network header
        ├── Requirement composer
        ├── Local credential card
        ├── Disclosure surface
        ├── Proof capsule
        │   └── ProofLayer × 3
        ├── AnimateProofResult
        ├── Privacy boundary
        ├── Metric × 3
        └── Gemini composer dock
```

State dependencies:

- `useWallet` manages 1AM discovery, connection, disconnection and network selection.
- `vault.ts` currently creates and stores a demo private credential in localStorage.
- `midnight.ts` lazily loads Midnight.js, deploys a contract in-session and calls the proof circuit.
- `api.ts` sends public requirements to Gemini through FastAPI and records public proof receipts.

Production risks visible in the current page:

- Demo private material is silently created and stored as plaintext in localStorage.
- Missing API data is replaced by plausible-looking fake metrics.
- Deployment and proof submission are conflated into one user action.
- Sidebar destinations are nonfunctional.
- Review disclosure button has no behavior.
- Long proof actions need explicit phases, recovery instructions and durable receipt history.
