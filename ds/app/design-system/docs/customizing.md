# Customizing

How to turn this starter into the design system for a specific company or
project. Most of it is one script and one colour ramp.

## 1. Rebrand: name, prefix, registry URL

```bash
npm run rebrand -- --name "Northwind" --prefix nw --url https://ds.northwind.com
```

| Flag | Changes |
|---|---|
| `--name` | Display name in `lib/brand.ts` (nav, page titles, top-nav wordmark) and the `package.json` name |
| `--prefix` | Token prefix and scope class: `--ds-*` → `--nw-*`, `.ds` → `.nw`, `ds-theme.css` → `nw-theme.css`, `components/ds/` → `components/nw/` |
| `--url` | Registry homepage, which every `registryDependencies` URL uses |
| `--dry` | Preview the edits without writing anything |

The script reads the current prefix from `registry.json`, so you can run it
again later. When it finishes, run `npm run registry:build` to regenerate
`public/r/`.

## 2. Colour: swap the brand ramp

Open `app/ds-tokens.css` (it will have your prefix after a rebrand) and replace
the eleven `--ds-brand-*` hex values with the company's colour, 50 → 950.
Generators like [uicolors.app](https://uicolors.app) or the
[Tailwind palette](https://tailwindcss.com/docs/colors) produce a full ramp
from one hex value.

The semantic layer (`ds-theme.css`) maps to ramp *steps*, not to hex values, so
nothing else needs to change. The steps that matter most:

- `brand-600`: the `cta` fill in light mode. Check it against white text for
  4.5:1 contrast.
- `brand-500`: the focus ring in light mode, and the `cta` fill in dark mode.
- `brand-400`: the focus ring in dark mode.

To shift the neutral temperature (cooler with slate or zinc, warmer with stone),
replace the `--ds-neutral-*` ramp the same way.

**Primary vs. CTA.** The primary button is neutral (stone-900) by default, and
the brand colour is kept for `cta`. If the brand should *be* the primary button,
point `--primary` at `--ds-brand-600` (light) and `--ds-brand-500` (dark) in
`ds-theme.css`, with `--primary-foreground: var(--ds-white)`.

## 3. Shape and type

- **Radius:** `--ds-radius` in `ds-tokens.css` (default `0.5rem`). The whole
  `rounded-sm` … `rounded-xl` scale derives from it. Use `0` for a square brand.
- **Fonts:** load the faces in `app/layout.tsx` via `next/font`, then update
  `--font-sans` / `--font-mono` in `globals.css` and the `--ds-font-*` stacks.
  Registries can't ship fonts, so consuming apps load their own.

## 4. Logo

The top nav shows a monogram built from `brand.name`. Replace the `<span>`
mark in `components/ds/top-nav.tsx` with the company's SVG (use
`fill="currentColor"` so it follows the theme), and replace `public/logo.svg`
(the favicon).

## 5. Docs

- Fill in [Brand guidelines](/design-system/docs/brand-guidelines).
- Update [Orientation](/design-system/docs/design-system) wherever you changed
  colour, type, or radius.
- Delete [Chat](/design-system/docs/chat) and the AI components if the product
  has no chat surface. Remove their `registry.json` entries and playground
  stories along with them.

Docs are markdown files in `app/design-system/docs/`. Any new `.md` file shows
up in the sidebar automatically. Set its position in `ORDER` in `docs.ts`.

## Checklist

- [ ] `npm run rebrand -- --name … --prefix … --url …`
- [ ] Brand ramp swapped, with `cta` contrast checked
- [ ] Logo mark + favicon replaced
- [ ] Fonts swapped (if not Geist)
- [ ] Brand guidelines filled in
- [ ] `npm run registry:build`, then deploy
