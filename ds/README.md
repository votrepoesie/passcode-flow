# Design System Starter

A brand-agnostic starting point for a company or project design system:
tokens, a shadcn theme, UI primitives and composed components, published as a
**shadcn registry**, with a **playground** and **docs** you can browse.

- **Colour:** Tailwind stone neutrals, a blue `brand` ramp (accent, focus ring,
  CTA), and green / amber / red status ramps. The primary button is stone-900.
- **Type:** Geist for everything, and Geist Mono for code.
- **Shape:** 8px radius, flat surfaces, depth by lightness.

## Develop

```bash
npm install
npm run dev              # http://localhost:3010  (registry home /, playground /playground, docs /design-system/docs)
npm run registry:build   # emits public/r/*.json from registry.json
npm run lint
```

## Scaffold a new design system

```bash
npm run rebrand -- --name "Northwind" --prefix nw --url https://ds.northwind.com
```

Then swap the `--nw-brand-*` ramp in `app/nw-tokens.css`, replace the logo,
fill in the brand guidelines doc, and run `npm run registry:build`. The full
walkthrough is in [`app/design-system/docs/customizing.md`](app/design-system/docs/customizing.md)
(rendered at `/design-system/docs/customizing`).

## Consume from a project

Serve or deploy this app, then in a shadcn project:

```bash
# theme + tokens (import the css in your globals, after `@import "tailwindcss"`)
npx shadcn@latest add {registry-url}/r/ds-theme.json

# a component (pulls its registry + npm deps)
npx shadcn@latest add {registry-url}/r/top-nav.json
```

Wrap product UI in a `.ds` element (add `dark` for dark mode). Load **Geist**
and **Geist Mono** in your layout, exposed as `--font-geist-sans` and
`--font-geist-mono` (registries can't ship fonts).

## Structure

- `app/ds-tokens.css`: primitives (`--ds-neutral-*`, `--ds-brand-*`, status ramps, type, motion)
- `app/ds-theme.css`: shadcn semantic mapping (`.ds` / `.dark` / `.ds-inverse`), shipped as `ds-theme`
- `lib/brand.ts`: display name
- `components/ui/*`, `components/ds/*`, `components/ai-elements/*`: primitives + components
- `registry.json`: registry item definitions (`npm run registry:build` → `public/r/*.json`)
- `app/page.tsx`: registry home (install instructions + item index)
- `app/playground/**`: component stories, Colors, Typography
- `app/design-system/docs/*.md`: design docs
- `scripts/rebrand.mjs`: renames the prefix, scope class, brand name, and registry URL

When you change tokens or components, keep the Colors / Typography playground
pages and `app/design-system/docs/*.md` in sync.
