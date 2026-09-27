# Layout inventory

## Application shell

`frontend/src/components/AppShell.tsx` owns the global layout.

```tsx
<div className="app-shell">
  <aside className="sidebar">brand + navigation + privacy summary + issuer</aside>
  <button className="mobile-menu">menu trigger</button>
  <AnimatePresence>{/* mobile drawer */}</AnimatePresence>
  <main className="main-canvas">{children}</main>
</div>
```

Desktop uses a fixed 244px sidebar and a fluid content canvas. At 980px the sidebar collapses into a modal drawer. Content is constrained by `.page` to 1180px and uses a 1.55fr/0.75fr studio grid. At 760px the main grid and privacy boundary stack.

## Page composition

`ProofStudio` contains:

1. Header with network selector and 1AM wallet lifecycle.
2. Inline wallet/API notices.
3. Proof-composer card plus live proof capsule.
4. Asynchronous result banner.
5. Two-sided privacy boundary explaining local versus ledger data.
6. Metrics and Gemini composer dock.

The shell is currently single-route and all navigation items other than Proof Studio are visual placeholders.
