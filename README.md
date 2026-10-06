# Passcode flow

A 4-digit passcode entry built from the [Figma file](https://www.figma.com/design/8SQs2c7pOqHHCCzopdXLax/passcode-flow): empty → filling in → verifying → authenticated (or wrong code), with full keyboard support. The correct passcode is `1234`.

## Run

```bash
cd prototype
npm install
npm run dev        # http://localhost:3020
```

| Script | |
| --- | --- |
| `npm test` | Playwright suite in your installed Chrome (starts the dev server if needed) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run build` | Production build |

## Structure

```
prototype/
├─ app/                     layout (Inter 3.19), page, globals.css (Figma tokens)
├─ components/
│  ├─ passcode/
│  │  ├─ passcode.tsx       composes the flow; passcode ↔ authenticated swap
│  │  ├─ use-passcode.ts    state + keyboard/paste/soft-keyboard handling
│  │  ├─ passcode-cell.tsx  one digit cell (Input restyled as the Figma cell)
│  │  ├─ status-slot.tsx    "Press Enter to verify" ↔ "Verifying..." line
│  │  ├─ check-icon.tsx     drawn check on success
│  │  ├─ keycap.tsx         inline Enter keycap
│  │  ├─ motion.ts          shared easing + reduced-motion-aware fades
│  │  └─ constants.ts       length, timings, copy
│  └─ ui/                   shadcn Field + Input (vendored from the design-system template)
├─ lib/verify-passcode.ts   simulated server check (1.5s latency)
├─ public/                  Figma spinner + check SVGs
└─ tests/                   keyboard, flow and Figma-comparison specs; Figma frames in tests/figma
```

## Keyboard

| Key | Behaviour |
| --- | --- |
| `0`–`9` | Fills the cell and moves to the next; other keys show "Numbers only (0–9)" |
| `Enter` | Submits a complete code; an incomplete one shows "Enter all 4 digits" |
| `Backspace` / `Delete` | Clears the cell; on an empty cell moves back; held, clears the whole code and the focus box glides back to the first cell |
| `←` `→` `Home` `End` | Move between cells |
| Paste | Fills from the focused cell, ignoring non-digits |

## Decisions

- **Pixel fidelity.** Colours, sizes and type come from the Figma variables. Figma renders Inter 3.x, which is ~2px narrower than Google's Inter 4 at 24px, so Inter 3.19 is self-hosted. Digits carry small padding offsets to sit where Figma places them. `tests/figma.spec.ts` checks every state against the exported frames.
- **Enter to submit.** The code never auto-submits. Since the design has no button, a complete code shows "Press [Enter ↵] to verify" in the status line, which turns into "Verifying..." on Enter.
- **Focus highlight.** The green "type here" border hides once the code is complete (nothing left to type) and returns on the next edit.
- **Motion.** Typing and focus moves are instant. State changes fade/rise in 150–250ms; success gets a drawn check with a spring. Reduced motion keeps fades only.
- **Undesigned states** (wrong code, hints, Enter prompt) reuse the Field's error/hint line and the Figma palette.

## Known limitations

- The passcode check is simulated client-side; a real flow would verify on the server.
- Android soft keyboards send no event for Backspace on an already-empty cell, so moving back from an empty cell needs a physical keyboard there.
