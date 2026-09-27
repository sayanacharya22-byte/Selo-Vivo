# Component inventory

Source: `frontend/src/components` and `frontend/src/pages/ProofStudio.tsx`.

## Shared components

- `AppShell` (`frontend/src/components/AppShell.tsx`): persistent desktop sidebar, responsive mobile drawer, main canvas, privacy card, issuer status. Props: `{ children: ReactNode }`.
- `BrandMark` (`frontend/src/components/BrandMark.tsx`): three-shape CSS brand symbol used in the shell. No props.

## Page-local components

- `ProofLayer`: status row in the proof capsule. Props: `icon`, `title`, `note`, `state`.
- `Metric`: number and label pair in the operational footer. Props: `value`, `label`.
- `AnimateProofResult`: asynchronous proof result banner. Props: proof state, message, receipt.

## Dependencies

- React 19
- Framer Motion 12 for route entrance, proof state, and mobile drawer transitions
- Lucide React for interface icons

The current page has several page-local primitives that can become reusable production components: `AsyncNotice`, `DisclosureCard`, `MetricCard`, and `ProofProgress`.
