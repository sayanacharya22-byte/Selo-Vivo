# Selo Vivo Compact contract

`src/selo-vivo.compact` verifies a confidential credential against a public
issuer commitment. It deliberately discloses only a request-scoped nullifier,
the broad credential class, and request tag. The holder secret, exact expiry,
biome evidence, and source credential remain private witnesses.

Compile on Linux/macOS, or through WSL on Windows:

```bash
npm run contracts:compile
```

The constructor binds the public issuer root atomically at deployment. The
compiler output is written to `contract/managed/selo-vivo/`, then the proof keys
and ZKIR are copied to `frontend/public/` for browser proving through 1AM.
