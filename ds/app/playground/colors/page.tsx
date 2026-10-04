"use client";

import { useState } from "react";
import { SiteNav } from "@/app/site-nav";
import { useTheme } from "@/app/use-theme";

/* ── shared bits (match the playground's Label + Panel chrome) ──────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-medium text-label text-muted-foreground">
      {children}
    </span>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs leading-relaxed text-foreground">
      {code}
    </pre>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* ── Colors data ──────────────────────────────────────────────────────────

// Semantic roles — what components actually reference (bg-primary, text-muted…).
// Just colours; `use` = what to reach for this role for. Surfaces that carry
// text each have a matching `--<name>-foreground` (e.g. bg-primary pairs with
// text-primary-foreground) — noted in `use` where it matters.
*/
const SEMANTIC_ROLES: { name: string; use: string }[] = [
  { name: "background", use: "page canvas" },
  { name: "foreground", use: "default body text" },
  { name: "card", use: "recessed panels, cards" },
  { name: "popover", use: "floating menus, dropdowns" },
  { name: "primary", use: "primary button fill" },
  { name: "secondary", use: "quiet / secondary button" },
  { name: "cta", use: "the one loud action" },
  { name: "muted", use: "muted surfaces" },
  { name: "muted-surface", use: "shadcn compat alias for muted — vendored primitives (message-scroller)" },
  { name: "muted-foreground", use: "supporting / secondary text" },
  { name: "accent", use: "hover / active surface" },
  { name: "destructive", use: "errors, delete actions" },
  { name: "destructive-text", use: "error labels, marks, invalid field borders — lifted on dark" },
  { name: "success", use: "positive status marks" },
  { name: "warning", use: "warning status marks" },
  { name: "border", use: "dividers, hairlines" },
  { name: "border-subtle", use: "nav hairline" },
  { name: "input", use: "field edges" },
  { name: "ring", use: "focus ring" },
];

// Roles worth showing on the inverse surface (the rest follow the same swap).
const INVERSE_ROLES = ["popover", "foreground", "muted-foreground", "primary", "border", "destructive-text"];

// Base colours — the off-ramp primitives, named by colour (--ds-*). Page and
// ink are ramp steps (neutral-50 / neutral-900), shown in the Ramps panel.
const BASE_COLORS: { token: string; label: string; hex: string }[] = [
  { token: "--ds-white", label: "white", hex: "#FFFFFF" },
  { token: "--ds-black", label: "black", hex: "#000000" },
];

const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// neutral = Tailwind stone, brand = Tailwind blue (the swap point for a
// company's colour), plus the three status ramps.
const RAMPS = ["neutral", "brand", "success", "warning", "danger"] as const;

// The three naming layers, top of stack last. Each points at the one above it.
const LAYERS: { name: string; example: string; desc: string }[] = [
  {
    name: "raw hex",
    example: "#1C1917",
    desc: "The literal colour value. Never referenced directly in components — it only lives inside a token.",
  },
  {
    name: "primitive",
    example: "--ds-neutral-900",
    desc: "The palette, named by colour: the 50→950 ramps (neutral / brand / success / warning / danger) plus the off-ramp base colours (white, black). A colour, no meaning attached. This is where the hex is stored.",
  },
  {
    name: "semantic token",
    example: "--foreground",
    desc: "A role named by its job, not its colour (shadcn). Points straight at a primitive, and is what components actually paint with via bg-/text- utilities. Dark mode re-points these — so the role stays, the colour swaps.",
  },
];

// One value climbing all three layers. Same colour throughout — different names.
const INK_CHAIN: { label: string; sub: string }[] = [
  { label: "#1C1917", sub: "raw hex" },
  { label: "neutral-900", sub: "primitive" },
  { label: "foreground", sub: "semantic" },
];

/** Swatch that copies its hex on click, with a brief "copied" overlay. */
function BrandSwatch({
  token,
  label,
  hex,
}: {
  token: string;
  label: string;
  hex: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      // held for 0.8s, then the overlay transitions back out
      setTimeout(() => setCopied(false), 800);
    } catch {
      // clipboard unavailable (e.g. non-secure context) — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label} hex ${hex}`}
      className="block w-full cursor-pointer overflow-hidden rounded-lg border border-border text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="relative h-16" style={{ background: `var(${token})` }}>
        <span
          aria-hidden={!copied}
          className={`absolute inset-0 grid place-items-center bg-white/50 font-mono text-[10px] text-black transition-opacity duration-300 ${
            copied ? "opacity-100" : "opacity-0"
          }`}
        >
          copied
        </span>
      </div>
      <div className="bg-card px-2.5 py-2">
        <div className="font-mono text-xs text-foreground">
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {hex}
        </div>
      </div>
    </button>
  );
}

export default function ColorsGuide() {
  const dark = useTheme();

  return (
    <div className={`${dark ? "ds dark" : "ds"} flex h-screen flex-col overflow-hidden bg-background`}>
      <SiteNav />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-12 py-14">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-medium leading-tight text-foreground">
            Colors
          </h1>
        </div>

        <div className="grid gap-10">
          <Panel title="atomic design 101">
            <div className="grid max-w-[760px] gap-6">
              <p className="text-base font-light leading-relaxed text-muted-foreground">
                In atomic design, a color is a raw value, a primitive, and a semantic role. 
                This creates a single source of truth for every color in the system, and makes 
                it easy to swap out the palette without touching any components.
              </p>

              {/* Worked example — one colour through every layer */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {INK_CHAIN.map((c, i) => (
                    <div key={c.sub} className="flex items-center gap-3">
                      {i > 0 && (
                        <span className="font-mono text-lg text-muted-foreground">
                          →
                        </span>
                      )}
                      <div className="w-[180px] overflow-hidden rounded-lg border border-border">
                        <div
                          className="flex h-20 items-center justify-center"
                          style={{
                            background: "var(--ds-neutral-900)",
                            color: "var(--ds-neutral-50)",
                          }}
                        >
                          <span className="font-mono text-sm">
                            {c.label}
                          </span>
                        </div>
                        <div className="bg-card px-2 py-1.5 text-center font-medium text-xs text-muted-foreground">
                          {c.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Semantic tokens">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {SEMANTIC_ROLES.map((r) => (
                <div key={r.name} className="overflow-hidden rounded-lg border border-border">
                  <div
                    className="h-16"
                    style={{ background: `var(--${r.name})` }}
                  />
                  <div className="bg-card px-2.5 py-2">
                    <div className="font-mono text-xs text-foreground">
                      {r.name}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-foreground/70">
                      {r.use}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Inverse surface (.ds-inverse)">
            {/* The same roles re-resolved inside the inverse scope — dark on the
                light page, light on the dark page. Toasts sit on this surface. */}
            <div className="ds-inverse grid grid-cols-2 gap-4 rounded-xl bg-background p-4 sm:grid-cols-3">
              {INVERSE_ROLES.map((name) => (
                <div key={name} className="overflow-hidden rounded-lg border border-border">
                  <div className="h-12" style={{ background: `var(--${name})` }} />
                  <div className="bg-card px-2.5 py-2 font-mono text-xs text-foreground">
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Primitives (--ds-*)">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {BASE_COLORS.map((b) => (
                <BrandSwatch key={b.token} {...b} />
              ))}
            </div>
          </Panel>

          <Panel title="Primitives (50 → 950 ramp)">
            <div className="grid gap-5">
              {RAMPS.map((ramp) => (
                <div key={ramp}>
                  <div className="mb-1.5 font-medium text-label text-muted-foreground">
                    {ramp}
                  </div>
                  <div className="flex overflow-hidden rounded-lg">
                    {RAMP_STEPS.map((step) => (
                      <div key={step} className="flex-1">
                        <div
                          className="h-12"
                          style={{ background: `var(--ds-${ramp}-${step})` }}
                        />
                        <div className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Usage">
            <Snippet
              code={`// components reference the semantic role\n<div className="bg-primary text-primary-foreground" />\n\n// the role maps straight to a primitive in ds-theme.css\n.ds { --primary: var(--ds-neutral-900); }`}
            />
          </Panel>
        </div>
        </div>
      </main>
    </div>
  );
}
