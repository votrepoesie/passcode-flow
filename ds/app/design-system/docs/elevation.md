# Convey Dimension by Lightness

The system is flat and avoids shadows, so **surface lightness** carries depth
instead. One rule governs it:

> **Lighter = raised, darker = recessed.** A surface's lightness relative to the
> page tells you whether it sits above or below the page plane.

## The three planes

| Plane | Role | Light token | Dark token |
|---|---|---|---|
| **Recessed** | Panels, cards, inset wells, tab tracks | `--card` / `--muted` → stone-100 `#F5F5F4` | stone-900 `#1C1917` |
| **Page** | The canvas everything sits on | `--background` → stone-50 `#FAFAF9` | stone-950 `#0C0A09` |
| **Raised (floating)** | Dropdowns, popovers, menus, comboboxes, any overlay | `--popover` → **white `#FFFFFF`** | stone-800 `#292524` |

In each theme, lightness increases as a surface moves *toward the viewer*:
recessed panel, then page, then floating overlay.

## Why floating UI uses the lightest surface

A menu or popover hovers **above** the page. Without a drop shadow, tone is the
only cue left. Making the overlay the **lightest** surface in the system makes
it advance visually, so it reads as lifted off the page. An overlay that
matched the page or a recessed surface would look flat or inset.

Overlays may still carry a very soft shadow as a secondary cue (see
`components/ui/dropdown-menu.tsx`). Lightness is the primary signal, though,
and it has to work without the shadow.

## In code

`--popover` (and `--popover-foreground`) is the floating token, mapped in
`app/ds-theme.css` under `.ds` / `.ds.dark`. Every floating primitive
(`DropdownMenu`, `Select`, `HoverCard`) uses `bg-popover`. Recessed panels use
`bg-card` or `bg-muted`, and the page uses `bg-background`.

> **Portal caveat:** floating content must render **inside** the `.ds`
> scope, or these tokens won't resolve, because a portal to `document.body`
> loses them. The overlays render inline for this reason. See the note in
> `dropdown-menu.tsx` / `tooltip.tsx`.

> **Tooltips are an exception.** They're inverted chips (`bg-foreground` with
> background-coloured text), not surfaces. That high-contrast label style is
> deliberate, so they don't follow the lightest-surface rule.

> **Toasts are inverted too.** The toast panel renders inside `.ds-inverse`,
> which is dark on the light page and light on the dark page. A toast floats
> over whatever the user is working on for a few seconds, so contrast against
> the page matters more than lightness-as-elevation. See `components/ui/toast.tsx`.
