# Overview

The design-system source lives in a few places:

```
app/
  ds-tokens.css          primitives: neutral / brand / status ramps (--ds-*)
  ds-theme.css           shadcn semantic roles mapped onto the primitives (.ds / .dark)
  globals.css            Tailwind entry, type steps, .doc-prose
  playground/            /playground (component stories, colors, typography)
  design-system/docs/    ← you are here (markdown, rendered at /design-system/docs)
components/
  ui/                    primitives (button, input, dialog …)
  ds/                    composed components (top-nav, select, panel-chat …)
  ai-elements/           chat / message primitives
lib/brand.ts             display name
registry.json            shadcn registry definitions → public/r/*.json
```

- dev: http://localhost:3010
- The **Colors** page (`/playground/colors`) is the live catalog of tokens.

## Docs

- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md): the rules for colour, type, shape, and long-form text
- [brand-guidelines.md](brand-guidelines.md): a template to fill in for the company
- [customizing.md](customizing.md): how to rebrand the starter
- [elevation.md](elevation.md): how surfaces convey depth by lightness
- [chat.md](chat.md): the chat (composer) surface and the message primitives it's built from
