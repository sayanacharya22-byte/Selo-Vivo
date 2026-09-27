# Theme inventory

Source: `frontend/src/styles.css` (215 lines).

## Visual direction

Brazilian modernism expressed through editorial off-white surfaces, forest green, cobalt, warm coral and sun yellow. Rounded cards, azulejo-like geometric patterning, soft grain, and compact uppercase labels create a crafted institutional tone rather than a generic Web3 dashboard.

## Core tokens

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #16352d;
  background: #efeee5;
  --ink: #16352d;
  --muted: #7d887f;
  --paper: #fbfaf3;
  --line: #d9ddd2;
  --forest: #12553f;
  --forest-2: #0b3c2e;
  --lime: #b7ef6c;
  --sun: #f6c344;
  --coral: #ef7256;
  --blue: #2c5dce;
  --shadow: 0 18px 50px rgba(26, 55, 45, .08);
}
```

## Typography

- Typeface: Inter/system sans only.
- Display heading: clamp(2.1rem, 4vw, 4rem), 900 weight, tight tracking.
- Card headings: 1.45rem, 850 weight.
- UI labels: 0.62–0.75rem, uppercase where semantic.

## Shape and elevation

- Primary cards: 22px radius, 1px muted green border, gentle green shadow.
- Controls: 11–14px radius.
- Status pills: fully rounded.
- Proof capsule: dark forest gradient with a deep inset shadow and clipped decorative layers.

## Motion

- Page children rise 18px with 450ms ease-out and 80ms stagger.
- Proof readiness orb floats 5px over 3.2 seconds.
- Drawers use spring motion; result banners expand and fade.
- Production work must honor `prefers-reduced-motion` and avoid continuous motion when requested.

## Responsive behavior

- Below 980px: fixed sidebar becomes an overlay drawer.
- Below 760px: proof grid, privacy boundary, and footer stack.
- Below 520px: outer padding and hero type reduce; proof capsule buttons and metrics adapt.

## Accessibility gaps to address

- Some sidebar buttons have no action but look interactive.
- Continuous motion lacks a reduced-motion override.
- Several small muted labels need contrast verification.
- Status announcements need `aria-live`; focus states need a consistent visible token.
