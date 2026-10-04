"use client";

import Link from "next/link";
import registry from "@/registry.json";
import { SiteNav } from "@/app/site-nav";
import { InstallCommand } from "@/app/install-command";
import { brand } from "@/lib/brand";

// Dynamic item index — derived from registry.json so it never drifts.
// Grouped by category (what the item IS), which is more useful than the raw
// shadcn type or the title (which just echoes the name).
const GROUPS: { label: string; types: string[] }[] = [
  { label: "Foundations", types: ["registry:theme", "registry:file"] },
  { label: "Primitives", types: ["registry:ui"] },
  { label: "Components", types: ["registry:component"] },
  { label: "Utilities", types: ["registry:lib"] },
];

const ITEM_INDEX = GROUPS.map((group) => ({
  label: group.label,
  items: registry.items
    .filter((item) => group.types.includes(item.type))
    .map((item) => item.name),
})).filter((group) => group.items.length > 0);

const ITEM_COUNT = registry.items.length;

export default function Home() {
  const examples = ["ds-theme", "top-nav"];

  return (
    <main className="ds min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-8 py-20">
        <p className="font-medium text-xs text-muted-foreground">
          {brand.name}
        </p>
        <h1 className="mt-2 text-[40px] font-medium leading-tight">
          Design System
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Canonical tokens, theme, and components — published as a shadcn
          registry and browsable in the playground.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/playground"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Open the playground
          </Link>
          <Link
            href="/playground/typography"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Typography
          </Link>
          <Link
            href="/design-system/docs"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Docs
          </Link>
        </div>

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-medium tracking-tight">Install</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add any item to a shadcn project (registry served at{" "}
            <span className="font-mono text-xs">/r/&lt;name&gt;.json</span>):
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {examples.map((name) => (
              <InstallCommand key={name} name={name} />
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-border pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-medium tracking-tight">
              Registry items
            </h2>
            <span className="font-medium text-xs text-muted-foreground">
              {ITEM_COUNT} items
            </span>
          </div>
          <div className="mt-8 grid gap-8">
            {ITEM_INDEX.map((group) => (
              <div
                key={group.label}
                className="grid gap-3 sm:grid-cols-[140px_1fr]"
              >
                <p className="font-medium text-xs text-muted-foreground">
                  {group.label}
                </p>
                <p className="font-mono text-sm leading-relaxed">
                  {group.items.map((name, i) => (
                    <span key={name}>
                      {name}
                      {i < group.items.length - 1 && (
                        <span className="text-muted-foreground">, </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
