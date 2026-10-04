# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# This repo is a design system starter + shadcn registry

- Brand-agnostic source of truth for tokens, theme, UI primitives, and components. Consuming projects install items via `npx shadcn add <url>/r/<item>.json`.
- Registry items are defined in `registry.json`; `npm run registry:build` emits `public/r/*.json`.
- The app renders the **playground** at `/playground` and docs at `/design-system/docs` from the same source files the registry publishes — one source of truth. Keep them in sync.
- Tokens: primitives in `app/ds-tokens.css` (`--ds-*` ramps), semantic shadcn roles in `app/ds-theme.css` under the `.ds` scope. Components reference semantic roles (`bg-primary`, `text-muted-foreground`, `bg-success`…), never raw ramps or hex.
- Fonts: **Geist** (titles, body, labels — sentence case, weight 500 for labels) and **Geist Mono** (code / tokens / tabular values only). No uppercase mono eyebrows.
- Radius: `--radius` = 8px; use `rounded-sm/md/lg/xl`, not arbitrary pixel radii.
- `npm run rebrand` rewrites the `ds` prefix / `.ds` class / brand name; avoid using `ds` as a bare identifier for anything else.
- When changing tokens/components, keep the Colors + Typography playground pages and `app/design-system/docs/*.md` in sync.
