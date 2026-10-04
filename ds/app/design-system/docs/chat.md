---
title: Chat (composer)
---

# Chat (composer)

The chat surface DS ships in the platform, documented here so the design
system publishes the primitives it composes from and the architecture reads as
one thing.

The composer has **three presentations, same props, same paint** — a host swaps
between them with one flag and compares like for like:

| Presentation | What it is |
|---|---|
| **minimal** | The "Ask me anything" pill, floating over the content |
| **expanded** | The pill grew a transcript above it and a toolbar above that |
| **docked** | The same card as a resizable right sidebar |

## The primitives the design system ships

Two primitives — `Message` from `ai-elements`, `MessageScroller` vendored
from shadcn `new-york-v4`. Any DS chat surface, current or future,
composes from these.

**One paint rule, on purpose:** assistant turns have no bubble — the answer
sits directly on the page so markdown, mermaid diagrams and code blocks lay
out edge-to-edge. User turns are the only ones that get a surface — a
subtle secondary pill, no variants to pick between. If you find yourself
reaching for a coloured or outlined bubble, it belongs somewhere else
(a callout, a card, a toast) — not the chat row.

### `Message` — `components/ai-elements/message.tsx`

The row wrapper. `<Message from="user" | "assistant">` sets the alignment
and per-role paint; `<MessageContent>` is where the row's text lives (user
side draws the pill, assistant side draws nothing). `MessageResponse`
streams markdown through Streamdown with the DS plugin set (mermaid,
math, code, ```mockup fences via `HtmlPreview`). Actions, branching
(prev/next alternate replies) and a toolbar row are available for turns
that need them.

### `MessageScroller` — `components/ui/message-scroller.tsx`

The transcript container. Not just a scroll div — it's a headless engine from
`@shadcn/react` with a state machine:

- **Follows the live edge only while the reader is at it.** Any signal of
  intent (scroll up, select text, click a link) drops the follow, so a
  streaming answer does not fight a reader who has scrolled back to re-read
  the question.
- **Anchors a new turn near the viewport top** with the previous turn still
  peeking, instead of shoving it off-screen.
- **Preserves the visible row when older messages prepend** — history paging
  does not move what the reader is looking at.
- **`defaultScrollPosition="last-anchor"`** opens a rehydrated transcript at
  the last real turn, not the absolute bottom.
- **Streaming does not re-render the tree on every scroll event** — state
  lives in `data-*` attributes, rows opt out of paint with
  `content-visibility: auto`.

Wire the surface at three points: `MessageScrollerProvider` (owns the state,
so any child that needs `scrollToMessage` can reach it), `MessageScroller` +
`MessageScrollerViewport` + `MessageScrollerContent` (the scroll shell), and
`MessageScrollerItem messageId={stableId}` per row.

**Watch out:** the item's id must be **stable for the life of the row**. See
`turnIdentity.ts` in the platform for the pattern — a live turn's id changes
from `'streaming'` to `qa-<ts>` on the done frame, and keying rows on that
re-identifies the live row at the exact moment the scroller is settling it,
which reads as a scroll jump.

## `PanelChat` — the composed surface

The design system also ships the whole composer as one component:
`components/ds/panel-chat/`. It is the same shape the platform mounts —
three presentations, one prop shape, one paint file — packaged so a
prototype can `shadcn add panel-chat` and drop it into a page.

Three presentations, controlled by a single `presentation` prop (or an
internal state if uncontrolled):

| Presentation | What it is |
|---|---|
| **minimal** | Fixed to the bottom of the viewport — the pill only |
| **expanded** | The pill grew a transcript above it and a toolbar above that |
| **docked** | The card as a resizable right sidebar, inline flex sibling of the page |

The component is deliberately dumb about *which* conversation it renders:
the host passes `messages`, `isStreaming` and `onSend`; anything
conversation-specific (mode toggle, pending-change chip) arrives as a slot.
Answers are `ReactNode`, so a consumer can pass plain text, a
`<MessageResponse>` for streamed markdown, or a whole tree of rendered
blocks — the surface doesn't care.

v1 ships the shell only: no activity trace, no reasoning, no tool phrasing.
Those are still described below as the shape the platform's version takes,
but they are not exposed as DS primitives yet.

### Paint

The surface's CSS lives in `app/panel-chat.css` (registered as a file in the
`panel-chat` registry entry and imported from `app/globals.css`). Every rule
is scoped under `.ds-panel-chat`, uses `display: contents` so the scope
element contributes no layout, and reaches for the DS semantic tokens
(`--card`, `--border`, `--foreground`, `--muted`, `--cta`) — not any
platform-specific `--rdx-*` token.

### Mounting the docked panel

Docked `PanelChat` is a **flex sibling of the whole app column** — no
`position: fixed`, no CSS-variable reservation dance. Wrap the app (nav +
rail + main) and the panel in one viewport-height flex row, so the panel
spans the full viewport height (nav row included) and the app column
shrinks as the panel grows:

```tsx
<div className="flex h-screen overflow-hidden">
  {/* app column */}
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    <TopNav />
    <main className="flex min-h-0 flex-1 overflow-y-auto">
      {/* your page content */}
    </main>
  </div>

  <PanelChat {...props} />
</div>
```

`min-w-0` on the app column is load-bearing: without it a `max-w` region
inside refuses to give way and the panel just crowds the viewport
instead of shrinking the app. The panel enforces its own min/max drag
width and caps against `MIN_MAIN_CONTENT` so it can't squeeze the shell
to nothing.

Minimal pill and expanded card are still `position: fixed` inside the
component — they render into a zero-width flex slot without claiming
layout space.

### Focus + presentation swap

The minimal → expanded swap is a different React tree: the input field
unmounts and a fresh one mounts inside the composer. That leaves the caret
nowhere, so PanelChat imperatively refocuses on the two paths where the
user was already typing (focusing the pill, sending from it). Unconditional
refocus would steal the caret when the chat opens itself (which it does the
moment a stream starts — see below).

### "Open when a stream starts"

If a reply begins arriving while the surface is minimal, PanelChat opens
itself to the expanded presentation — the answer isn't streaming into
something invisible. Keyed on the stream STARTING, not on the transcript
growing: stored history arriving on mount is a 0 → N change indistinguishable
from a new turn, so keying on growth would pop the chat open on every load
that had any history.

## What the platform layers on top

These live in `platform/components/chat/` — tightly coupled to the platform's
state (Jotai atoms), types (`QAPair`, `ActivityStep`, `TurnActivity`) and its
`.rdx-chat-*` paint. The DS `PanelChat` component is a simplified port of
the same surface; the sections below describe the extra layers the platform
carries and the DS does not (yet).

### `ChatSurface.tsx`

Root. Owns the collapsed / card / docked switch, drag-to-resize for the
docked panel, focus carry across the collapsed → open remount, and the
"open when a stream starts" rule. Deliberately dumb about *which*
conversation it renders: the host passes `qaPairs`, `isStreaming`, `onSend`
and slots for `modeToggle` / `banner`.

### `ChatTranscript.tsx`

Scroller-driven transcript. Uses `MessageScroller`, keys items with
`useTurnIds(qaPairs)`, degrades to a starters list when empty. Rows are
**not** `scrollAnchor`s — anchoring one row would trap the scroller in
`anchored-to-message` and a streaming answer would stop following the edge.

### `ChatTurn.tsx`

One Q/A turn. Question renders as a `Message from="user"` (the pill); answer
renders as a `Message from="assistant"` — no surface, so mermaid diagrams,
code blocks and tables get the full width. Activity trace sits **above** the
answer, inside its `MessageContent` — reasoning and tool calls are what
happened *before* the answer, not part of it.

### `ChatInput.tsx` + `ChatSendButton.tsx` + `ChatScope.tsx`

Composer. One `textarea` that lives in the collapsed pill and the open
card's composer; Enter sends, Shift+Enter newline, Escape closes. Send
button carries the in-flight state via `LogoSweep` (the product mark as a
waiting animation), replacing the spinner-and-"Thinking…" row. `ChatScope`
is `display: contents` around the whole thing so the `.rdx-*` tokens
resolve wherever the chat is mounted.

### `ThinkingState.tsx` + `ThinkingDots.tsx` + `ReasoningMarkdown.tsx`

The activity / reasoning trace. Chronological — reasoning, tool calls, then
sometimes reasoning again — with the **gap between steps** rendered as
labelled `inferring` / `writing` spans (that's where a long turn spends
most of itself, and unlabelled absence is what made a three-minute turn feel
stuck). Collapsed while settled, expanded while working, manual override
wins once expressed. `ThinkingDots` is the product mark as a 119-dot matrix
with a left-to-right CSS wave; reduced motion holds it still.

### `LogoSweep.tsx`

Send-button animation. The product mark's six tiles fly in from
off-canvas left and exit right, staggered, on a loop. `motion` library.
Same geometry as `LogoMark`, so idle → waiting is the same six shapes
starting to move rather than a crossfade between two drawings.

### `toolPhrasing.ts`

Tool call → human phrasing + icon. `mcp__trd__get_section` becomes
"Reading the technical design"; the verb also picks the glyph so the two
can never disagree. Internal identifiers (section keys, compound ids) are
deliberately not shown — they tell a customer nothing.

### `turnIdentity.ts`

Stable per-turn ids for `MessageScrollerItem`. See the "watch out" note under
`MessageScroller` above.

## Shared deps the platform pulls in

Not in the design system today; documented so the shape is legible.

- `components/document/MarkdownRenderer.tsx` — document-scale markdown
  (mermaid, heading observers, code fences)
- `components/DynamicContentRenderer.tsx` — renders structured content blocks
  (multiple choice, follow-ups, dynamic cards)
- `store/atoms.ts` — Jotai atoms for surface state: `chatDockedAtom`,
  `chatOpenAtom`, `chatDockWidthAtom`, `chatMountedAtom`

## Local deviations from upstream shadcn

Recorded so a future upgrade knows what to preserve:

- `bg-muted` → **`bg-muted-surface`**. Alias kept as a compat shim so the
  vendored source stays byte-identical across repos (some downstream
  consumers rebind `--muted` to an ink; the design system's `--muted` is
  already a surface, so here it is a pass-through). See `app/globals.css`.
- `inset-s-1/2` → `start-1/2` (stock Tailwind v4 logical inset; upstream
  relies on a custom utility from the shadcn site).
- `scroll-fade-b`, `scrollbar-thin`, `scrollbar-none`,
  `scrollbar-gutter-stable` — declared as `@utility` in `app/globals.css`.
  They are not stock Tailwind.
