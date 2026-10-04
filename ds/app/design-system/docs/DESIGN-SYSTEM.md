# Orientation

This document is a human-readable companion to the design system. It does not
replace the actual tokens and components. It's edited by hand and kept short on
purpose.

> **Starter defaults.** Everything below describes the brand-agnostic starter:
> stone neutrals, a blue brand accent, Geist type, and 8px corners. When you
> scaffold a system for a real company, update this page as part of the
> rebrand. See [Customizing](/design-system/docs/customizing).

## The feel in one paragraph

Calm, neutral, and precise. The canvas is a soft off-white (stone-50
`#FAFAF9`) with near-black ink (stone-900 `#1C1917`). One clean sans (Geist)
carries titles, body, and labels, and Geist Mono is kept for code. Colour shows
up rarely and on purpose: the brand blue marks focus, links, and the one loud
action on a screen. Surfaces are flat, depth comes from lightness rather than
shadow, and corners are softly rounded (8px).

## Colors

The palette is mostly neutral (Tailwind **stone**), with one **brand** ramp
(Tailwind blue by default) and three status ramps (success, warning, danger).

| Role | Light | Dark | Use |
|---|---|---|---|
| `background` | stone-50 | stone-950 | Page canvas |
| `foreground` | stone-900 | stone-50 | Body text |
| `primary` | stone-900 | stone-50 | Primary button: solid near-black |
| `secondary` | stone-100 | stone-800 | Quiet button |
| `cta` | brand-600 | brand-500 | The one loud action per screen |
| `ring` | brand-500 | brand-400 | Focus ring |
| `muted-foreground` | stone-500 | stone-400 | Supporting text |
| `border` | stone-200 | white / 12% | Dividers, hairlines |
| `destructive` | danger-600 | danger-600 | Errors, delete actions |

Reference **semantic tokens** only (`--background`, `--foreground`,
`--primary`…), through the `bg-*` and `text-*` utilities. Each is named for its
job and carries both the light and dark values. Underneath, they resolve to the
primitive `--ds-*` ramps, but components never reference those directly.

**[See the complete list →](/playground/colors)**

## Typography

Geist carries everything: titles, body, and labels. Geist Mono is only for
code, token names, and tabular values. Labels are **sentence case**, weight
500. There are no uppercase eyebrows. Headings use weight 500 with slightly
tight tracking (`tracking-tight`). Body text uses default tracking.

### UI scale

All sizes are in rem, so the whole scale grows from the root font-size. The
playground sets the root to `1.0625rem` (17px).

| Token | Size | Face | Used for |
|---|---|---|---|
| `text-[32px]` | 32px / 2rem | Geist 500 | Page titles |
| `text-2xl` | 24px / 1.5rem | Geist 500 | Section headings |
| `text-xl` | 20px / 1.25rem | Geist 500 | Subsection headings |
| `text-base` | 16px / 1rem | Geist 500 | Panel / card titles |
| `text-body` | 15px / .938rem | Geist 400 | Primary in-product body |
| `text-sm` | 14px / .875rem | Geist 400 | Secondary copy, inputs, buttons |
| `text-label` | 12px / .75rem | Geist 500 | Nav / tab labels, eyebrows, table headers |
| `font-mono text-xs` | 12px / .75rem | Geist Mono 400 | Code, tokens |

`text-label` and `text-body` are design-system tokens (`@theme` in
`globals.css`). The others are Tailwind defaults. The `.ds-body-*` and
`.ds-label-*` pattern classes in `ds-tokens.css` cover larger or denser
surfaces.

**[Typography guide →](/playground/typography)**

## Shape and depth

- **Radius:** `--radius` is 8px. The scale is `rounded-sm` (4px) for menu
  items, `rounded-md` (6px) for buttons and fields, `rounded-lg` (8px) for
  cards and menus, `rounded-xl` (12px) for large panels. Avatars and switches
  are `rounded-full`.
- **Shadow:** none by default. Depth comes from surface lightness. See
  [Elevation](/design-system/docs/elevation).
- **Focus:** always visible, using a 3px `ring` at 50% opacity in the brand colour.

## Long-form text uses the `.doc-prose` container

For a page of prose (rendered markdown, help or legal copy, changelogs), wrap
it in **`.doc-prose`**. It maps every HTML element onto the scale:

```tsx
<article className="doc-prose" dangerouslySetInnerHTML={{ __html }} />
```

- **Body / list items:** 16px, 1.6 line-height, capped at about 68ch.
- **Headings** (`h1`–`h4`): Geist 500, stepping down from 1.75rem to 1rem.
- **Inline code / `pre`:** Geist Mono at `text-sm`, on a flat `secondary` fill.
- **Tables:** `text-label` headers, `text-sm` cells, hairline rows.
- **Blockquotes:** flat `secondary` block with muted text and no side-stripe.

The container is defined in `app/globals.css`, and the docs pages render into
it, so these pages show exactly how long-form text should look.
