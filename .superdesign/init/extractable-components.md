# Extractable component candidates

## High-value shared components

1. `AppShell`
   - Source: `frontend/src/components/AppShell.tsx`
   - Why: global responsive layout and navigation container.
   - Production API: active route, navigation items, issuer summary, privacy panel action, children.

2. `BrandMark`
   - Source: `frontend/src/components/BrandMark.tsx`
   - Why: canonical product identity used in app chrome and future auth/error screens.

3. `AsyncNotice`
   - Source concept: `AnimateProofResult` plus wallet notice in `ProofStudio.tsx`.
   - Why: consistent success, loading, warning and error semantics with live-region support.

4. `DisclosureCard`
   - Source concept: `.disclosure-grid` in `ProofStudio.tsx`.
   - Why: a reusable privacy primitive for every proof flow showing public and protected fields.

5. `MetricCard`
   - Source concept: `Metric` in `ProofStudio.tsx`.
   - Why: supports loading, unavailable and verified metric states without fake fallback values.

6. `ProofProgress`
   - Source concept: `.proof-layers` and `ProofLayer` in `ProofStudio.tsx`.
   - Why: makes wallet approval, local proving, submission and finalization phases explicit.

## Do not extract yet

The full composer card and proof capsule are product-specific organisms. Keep them page-level until a second proof workflow establishes a stable shared API.
