"use client";

import { useState } from "react";
import { Check, ChevronDown, Pause, Play } from "lucide-react";
import { TopNav } from "@/components/ds/top-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────
   Checklist sidebar / rail — ported from an earlier prototype so it can
   be exercised on a full page here before being extracted into a registry
   component. Self-contained: data + rail markup live in this file.
   ──────────────────────────────────────────────────────────────────────── */

// Four decision states, conveyed by a right-aligned mono tag (words, not a
// glyph — legible with no prior knowledge). `notstarted` carries no tag and is
// dimmed via alpha; `review` is the one attention state, so it takes the brand colour.
type DecisionState = "notstarted" | "inprogress" | "complete" | "review";
type Decision = { label: string; state: DecisionState; category: string };

// Decisions are grouped by area so people can jump to a stage.
// CATEGORY_ORDER fixes the section order in the rail.
const CATEGORY_ORDER = ["Define", "Plan", "Build", "Launch"] as const;

const DECISIONS: Decision[] = [
  { label: "Goals", state: "complete", category: "Define" },
  { label: "Audience", state: "complete", category: "Define" },
  { label: "Scope", state: "complete", category: "Plan" },
  { label: "Content & design", state: "complete", category: "Plan" },
  { label: "Timeline", state: "inprogress", category: "Plan" },
  { label: "Budget", state: "review", category: "Build" },
  { label: "Risks", state: "notstarted", category: "Build" },
  { label: "Testing", state: "notstarted", category: "Launch" },
  { label: "Launch review", state: "notstarted", category: "Launch" },
];

/** Right-aligned status tag — only the two states that need attention carry
 * one. `review` is brand-coloured to pull the eye to the row needing the user. Complete +
 * not-started stay quiet (label weight/colour alone), so a rail full of settled
 * rows isn't a column of repeated labels. */
function DecisionTag({ state, active }: { state: DecisionState; active?: boolean }) {
  const base =
    "shrink-0 rounded-sm px-1.5 py-0.5 font-medium text-[10px] leading-none";
  if (state === "review")
    return <span className={cn(base, "bg-cta text-cta-foreground")}>Review</span>;
  if (state === "inprogress")
    // The "AI thinking" shimmer only runs on the open row — the one the agent is
    // actively working — so the rail isn't perpetually in motion. Elsewhere the
    // tag is a static muted label. (globals.css freezes it under reduced-motion.)
    return (
      <span className={cn(base, active ? "text-shimmer" : "text-muted-foreground")}>In progress</span>
    );
  return null;
}

type AutoState = "idle" | "running" | "paused";

/** The auto-complete control — hands the decision to an AI agent (running),
 * which the user can pause (and later resume). */
function AutoCompleteButton({
  state,
  onClick,
  block,
}: {
  state: AutoState;
  onClick: () => void;
  block?: boolean;
}) {
  const w = block ? "w-full" : "";
  if (state === "running") {
    return (
      <Button variant="cta" size="sm" onClick={onClick} className={w} icon={<Pause className="size-4" />}>
        In progress
      </Button>
    );
  }
  if (state === "paused") {
    return (
      <Button variant="cta" size="sm" onClick={onClick} className={w} icon={<Play className="size-4" />}>
        Paused
      </Button>
    );
  }
  return (
    <Button variant="secondary" size="sm" onClick={onClick} className={w}>
      Auto-complete
    </Button>
  );
}

export default function ChecklistSidebarPreview() {
  const [dark, setDark] = useState(false);
  const [auto, setAuto] = useState<AutoState>("idle");
  const toggleAuto = () => setAuto((s) => (s === "running" ? "paused" : "running"));

  const [activeDecision, setActiveDecision] = useState("Timeline");
  const openDecision = (label: string) => setActiveDecision(label);

  // Collapsed decision categories (all expanded by default).
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const toggleCat = (c: string) =>
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  return (
    <div
      className={cn(
        dark ? "ds dark" : "ds",
        "flex h-screen flex-col overflow-hidden bg-background text-foreground"
      )}
    >
      <TopNav isDark={dark} onToggleTheme={() => setDark((d) => !d)} />

      <div className="flex min-h-0 flex-1">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="flex w-[272px] shrink-0 flex-col border-r border-border-subtle bg-background">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-base font-medium text-foreground">Checklist</h2>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {CATEGORY_ORDER.map((category) => {
              const items = DECISIONS.filter((d) => d.category === category);
              if (items.length === 0) return null;
              const open = !collapsedCats.has(category);
              return (
                <div key={category} className="mb-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCat(category)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-1 px-2 pt-3 pb-1 font-medium text-label text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90")} />
                    {category}
                  </button>
                  {open &&
                    items.map((d) => {
                      const isActive = d.label === activeDecision;
                      return (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => openDecision(d.label)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:text-foreground",
                            isActive
                              ? "bg-accent font-medium text-foreground"
                              : d.state === "inprogress"
                                ? "font-medium text-foreground"
                                : d.state === "notstarted"
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                          )}
                        >
                          {/* Reserved leading slot keeps every label's left edge
                              aligned; a quiet muted check marks only completed
                              decisions — a pre-attentive "done" signal. */}
                          <span aria-hidden className="grid size-4 shrink-0 place-items-center">
                            {d.state === "complete" && (
                              <Check className="size-3 text-muted-foreground" strokeWidth={2.5} />
                            )}
                          </span>
                          <span className="flex-1 truncate">{d.label}</span>
                          <DecisionTag state={d.state} active={isActive} />
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </nav>

          <div className="p-3">
            <AutoCompleteButton state={auto} onClick={toggleAuto} block />
          </div>
        </aside>

        {/* ── Main (placeholder so the rail sits in real page chrome) ── */}
        <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-background">
          <span className="font-medium text-xs text-muted-foreground">
            {activeDecision}
          </span>
        </main>
      </div>

      <a
        href="/playground"
        className="fixed bottom-6 right-6 font-medium text-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Playground
      </a>
    </div>
  );
}
