# Selo Vivo — Product and Design System

## Product context

Selo Vivo is a Midnight-powered confidential credential passport for Brazilian producer cooperatives. It helps a producer prove that a sustainability or compliance credential is valid, current, and relevant to a buyer's requirement without publishing the producer's identity, exact farm or workshop location, audit document, registration number, production volume, or revenue.

Approved hackathon track: **Confidential Credentials**.

Core privacy promise: **Prove the standard. Protect the source.**

The product is a production-minded web dApp, not a generic crypto dashboard. It uses Midnight Preview as the primary demo network and supports Preprod as a deployment target. The wallet is 1AM through the Midnight DApp Connector API. Gemini is a server-side "Proof Composer": it converts public procurement language plus non-sensitive credential labels into a minimal-disclosure checklist. Raw credential values, secrets, document bodies, exact location, wallet addresses, and Compact witnesses never leave the browser and are never sent to Gemini.

## Audience and jobs to be done

- Producer or cooperative member: keep sensitive business and identity data local while creating a buyer-verifiable proof.
- Buyer or verifier: confirm that a supplier meets a requirement without accumulating unnecessary personal or commercial data.
- Credential issuer / program operator: register a public issuer commitment and inspect aggregate proof activity.
- Hackathon judge: understand the public/private boundary, connect 1AM, and run the proof journey within one minute.

## Initial product surface

The first design is the authenticated **Proof Studio dashboard** at desktop width, responsive down to mobile. It must show the entire demo story without feeling like a landing page.

Persistent shell:

- Left rail with the Selo Vivo seal mark and product name.
- Navigation: Overview, Proof Studio (active), Credentials, Verify, Intelligence.
- Bottom area: Privacy model shortcut, Preview/Preprod environment switch, compact 1AM wallet state.

Main content:

1. A compact welcome/header row: "Boa tarde, Cooperativa Sol"; subtitle "Prepare uma prova sem abrir seus dados"; Preview network pulse; Connect 1AM button.
2. A large two-column proof-composer workspace.
3. Left column is a three-step guided flow with a visible progress rail:
   - Requirement: editable buyer request such as "Valid regenerative agriculture credential, current through 2027; biome must be Amazon or Cerrado."
   - Match: locally held credential card with labels only, sensitive values visually masked.
   - Disclosure: toggles/chips showing the exact public outputs and protected inputs.
4. Right column is a tactile "proof capsule" card with an animated seal, readiness ring, and three layers: local witness, zero-knowledge circuit, public result. Primary action: "Gerar prova privada". Secondary action: "Revisar divulgação".
5. Below, a horizontal privacy boundary strip: "Fica no seu dispositivo" versus "Vai para o ledger", with clear examples.
6. Compact recent proof activity and aggregate metrics: proofs verified, disclosure fields saved, and active issuer roots. No crypto-price charts.
7. A collapsed Gemini assistant dock labeled "Compositor Gemini" with the promise "Lê o requisito; nunca a credencial" and a visible local/fallback state.

Key demo states that the eventual implementation will support: disconnected, connecting, wallet connected, credential loaded locally, requirement analyzed, proving, submitted, verified, failure/retry.

## Brand direction: Brazilian contemporary modernism

Brazilian identity should feel designed and culturally literate, not like a flag-themed skin. Combine the optimistic geometry of Brazilian modernism, the rhythm of azulejo modules, warm craft-paper surfaces, tropical color accents, and landscape-inspired curves. Use asymmetry, large rounded architectural forms, and one or two confident color moments. Avoid literal flag graphics, carnival clip art, soccer imagery, rainforest stock photography, neon cyberpunk, glassmorphism overload, and generic Web3 purple.

Brand mark: a simple code-native seal made from two interlocking curved leaves around a small star/verification point. It may be rendered as geometric CSS/SVG in implementation. The wordmark is "selo vivo" in lowercase.

Voice: warm, clear, respectful, locally grounded, and precise. Product UI may use natural Brazilian Portuguese labels with brief English privacy explanations where helpful. Avoid slang and legal guarantees.

## Color tokens

- `--ink: #17231F` — near-black forest ink, primary text.
- `--forest: #175C45` — deep jacaranda/forest green, primary brand and verified states.
- `--leaf: #40A66B` — fresh green, progress and success accent.
- `--sun: #F2C94C` — warm yellow, attention and optimistic highlights.
- `--clay: #E66A3F` — terracotta/orange, sparing accent and motion trail.
- `--azulejo: #2D6D9F` — blue, network and ledger states.
- `--paper: #F7F2E8` — warm canvas background.
- `--paper-strong: #EFE6D4` — nested surfaces.
- `--white: #FFFDF8` — cards and high-contrast surfaces.
- `--muted: #66736D` — secondary text.
- `--line: rgba(23, 35, 31, 0.14)` — borders.

Never use gradients as a default fill. One restrained radial wash using forest/leaf at low opacity may appear behind the proof capsule. Success is forest/leaf, network is azulejo, caution is sun/clay, errors are a deeper brick `#B74832`.

## Typography

- Display and feature headings: `Bricolage Grotesque`, 600–700. Rounded, expressive, modern.
- UI and body: `Manrope`, 400–700. Compact and highly legible.
- Hashes, timestamps, contract addresses, and witness labels: `IBM Plex Mono`, 400–600.

Use a strong type scale: page title 42–48px desktop, section headings 24–30px, card titles 16–20px, body 14–16px, metadata 11–13px. Keep line length under 70 characters. Sentence case only.

## Layout and spacing

- Desktop canvas: 1440×1000, fluid.
- Sidebar: 232px; main content max width about 1240px.
- 12-column grid with 24px gutters.
- Outer main padding: 32px desktop, 20px tablet, 16px mobile.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Primary cards: 24–32px padding, 24–28px corner radius.
- Nested panels: 16–20px padding, 16–20px radius.
- Buttons: 44–48px height, 14–18px horizontal padding, 14–16px radius.

Favor horizontal breathing room and short, scannable clusters. The proof flow should feel like a calm guided instrument panel rather than a collection of disconnected cards.

## Component language

- Cards are matte paper/white surfaces with 1px ink-tinted borders and subtle directional shadows (`0 12px 30px rgba(23,35,31,.07)`).
- A signature azulejo pattern can appear as a low-contrast 16px modular line motif in empty corners and as a proof-progress texture, never behind body text.
- Step indicators are rounded square tiles connected by a thin line; complete steps fill forest, active step uses sun with ink, future steps use paper-strong.
- Sensitive values use elegant striped redaction bars or masked mono text, not blur.
- Privacy chips explicitly use eye/eye-off, device, circuit, and ledger icons from Lucide; no emojis.
- The proof capsule is a tall architectural card with a concave/arched top or nested oval, evoking Niemeyer curves without imitation.
- Buttons have a small arrow or wallet icon, strong hover lift, and visible keyboard focus.
- Network switch is compact and unambiguous; Preview is the initial selected state.
- Avoid excessive pills. Use pills only for status, network, and disclosure labels.

## Motion

Motion must explain state change and privacy boundaries, not decorate randomly.

- Page entrance: 360–500ms staggered fade/translate of header, composer, boundary strip, then metrics.
- Proof generation: a leaf-shaped point travels from the local witness layer through the circuit ring to the public result; 1.2–1.8s, spring-smoothed, reduced-motion alternative uses opacity only.
- Disclosure toggles: masked value compresses into a small labeled public chip; 220ms ease-out.
- Readiness ring: SVG stroke draw, 600ms.
- Wallet connection: button contracts into a status capsule; address appears with a soft 180ms crossfade.
- Card hover: maximum 3px lift and slight shadow expansion; no constant floating.
- Network switch: a blue indicator slides between Preview and Preprod; switching forces a visible reconnect state.
- Success: seal rotates no more than 12 degrees and stamps once; never confetti.
- Honor `prefers-reduced-motion` across every animation.

## Accessibility

- WCAG AA contrast for text and interactive controls.
- Do not encode privacy or proof state by color alone; pair with icon and label.
- 44px minimum hit targets, visible focus rings, semantic buttons, logical tab order.
- Status changes use an ARIA live region.
- Motion has reduced-motion equivalents.
- Portuguese copy uses concise labels; tooltips explain ZK terms in plain language.

## Privacy model to communicate in UI

Observer can learn:

- The issuer commitment/root registered on the public ledger.
- The public proof scope selected by the producer (for example: credential class and valid/invalid result).
- That a proof was successfully verified, aggregate verification count, timestamp, and normal public transaction metadata.

Observer cannot learn from the proof:

- Producer identity or legal registration number.
- Exact farm/workshop coordinates or biome evidence document.
- Audit document content, score, production volume, revenue, secret salt, or Compact witness.
- Unselected credential attributes.

Gemini can learn only the public buyer requirement and non-sensitive credential labels explicitly selected for matching. It cannot receive raw credentials, document text, wallet addresses, hashes, secrets, or witness data.

## Technology constraints reflected in the interface

- React + TypeScript, motion with Framer Motion.
- Midnight.js 4.x and DApp Connector API 4.x.
- 1AM wallet discovery through enumerating `window.midnight`; never rely on a hardcoded injection key.
- Preview and Preprod network IDs with a required reconnect on network change.
- Compact language 0.23 and toolchain 0.31.x, ledger 8 compatible.
- Private state persists locally; secret material is never put in server logs or sent to Gemini.
- Gemini API runs server-side with structured JSON output, strict schema validation, timeout, redaction, and deterministic local fallback.
- Final repository will include the Compact source, generated-artifact workflow, 3+ tests, CI, README privacy section, product proposal, and deployment/video placeholders.

## Design constraints

- Design the working app dashboard, not a marketing landing page.
- The primary action and proof boundary must be understandable within five seconds.
- Make the privacy split visibly central.
- Keep the screen information-rich but calm.
- Use only the fonts, colors, spacing, and component styles defined here. Do not introduce purple, magenta, neon, serif fonts, heavy glass blur, or unrelated visual styles.
