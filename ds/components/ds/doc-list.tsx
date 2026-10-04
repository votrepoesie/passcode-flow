"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

// A node is either a leaf doc (has `slug`) or a group (has `children`), or both.
export type DocNode = {
  slug?: string;
  title: string;
  children?: DocNode[];
};

/**
 * DS doc-list card: a bordered, optionally-nested list of docs.
 *
 * With more than 10 docs it collapses to just the active doc at rest, expanding to the
 * full list on hover (or keyboard focus) — the group holding the active doc
 * auto-opens, its nested children share a left guide line, and the active one
 * darkens its segment. With 10 or fewer there's nothing to gain from
 * hiding, so it stays fully open (no hover state). Just the navigation card —
 * pair it with TableOfContents (or use DocsNav, which composes both).
 *
 * `alwaysOpen` forces the static full list regardless of count.
 *
 * NOTE: collapsed mode (11+ docs) floats an absolutely-positioned overlay. Inside
 * a parent with `overflow: hidden` or `overflow: auto`, that overlay will be
 * clipped. Pass `alwaysOpen` to avoid this in constrained scroll containers.
 */
const OPEN_MAX = 10;
export function DocList({
  docs,
  activeSlug,
  hrefBase = "/design-system/docs",
  alwaysOpen = false,
  onSelect,
  className = "",
}: {
  docs: DocNode[];
  activeSlug: string;
  hrefBase?: string;
  alwaysOpen?: boolean;
  /** When set, a doc click calls this instead of navigating — for controlled /
   *  routerless use (the playground drives the active state this way). */
  onSelect?: (slug: string) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  // Only collapse when there's enough to hide; short lists stay open.
  const canCollapse = !alwaysOpen && countLeaves(docs) > OPEN_MAX;
  const expanded = !canCollapse || hovered;
  const active = findNode(docs, activeSlug);

  const fullList = docs.map((node, i) => (
    <DocNodeRow
      key={node.slug ?? `group-${i}`}
      node={node}
      activeSlug={activeSlug}
      hrefBase={hrefBase}
      onSelect={onSelect}
      depth={0}
    />
  ));

  // Not collapsible (forced open, or 10 docs or fewer): list sits in flow.
  if (!canCollapse) {
    return (
      <nav className={`flex flex-col border border-border-subtle bg-popover p-1.5 rounded-lg ${className}`}>
        {fullList}
      </nav>
    );
  }

  // Collapsed footprint stays in flow so whatever follows (a TOC) doesn't move;
  // the expanded list floats over it as an elevated overlay.
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false);
      }}
      className={`relative ${className}`}
    >
      {/* Resting card: just the active doc. Defines the footprint. */}
      <nav className="flex flex-col border border-border-subtle bg-popover p-1.5 rounded-lg">
        <a
          href={active?.slug ? `${hrefBase}/${active.slug}` : "#"}
          aria-current="page"
          onClick={(e) => {
            if (onSelect || !active?.slug) {
              e.preventDefault();
            }
            if (onSelect && active?.slug) {
              onSelect(active.slug);
            }
          }}
          className="block truncate px-3 py-1.5 text-sm font-medium text-foreground"
        >
          {active?.title ?? "Docs"}
        </a>
      </nav>

      {/* Expanded overlay: raised (popover) surface, drops over the content
          below without shifting it.

          Always mounted and hidden with `visibility` rather than unmounted, so
          the dismissal can animate too — and because `visibility: hidden` still
          takes it out of the tab order and the a11y tree, the collapsed rail
          isn't a duplicate nav for screen readers. Hover is fired rapidly, so
          this is a transition (retargets from wherever it is mid-fade) and not
          a keyframe animation (which would restart from zero each time).

          It grows out of the resting card it sits on: `origin-top`, scale 0.96
          -> 1 to match `ds-menu-in`. The transition names `scale`, not
          `transform` — Tailwind v4 compiles `scale-*` to the standalone `scale`
          property, which a `transform` transition never touches. Asymmetric timing — 160ms in, 120ms
          out — so it appears eagerly and gets out of the way. */}
      <nav
        data-expanded={expanded}
        className="absolute inset-x-0 top-0 z-30 flex flex-col origin-top rounded-lg border border-border-subtle bg-popover p-1.5 transition-[opacity,scale,visibility] ease-[var(--ds-ease-out)] duration-[var(--ds-duration-exit)] data-[expanded=true]:duration-[var(--ds-duration-enter)] data-[expanded=false]:invisible data-[expanded=false]:opacity-0 motion-safe:data-[expanded=false]:scale-96"
      >
        {fullList}
      </nav>
    </div>
  );
}

/** Count the navigable docs (leaves) in the tree — the "how many items" the
 *  collapse threshold is measured against. */
function countLeaves(nodes: DocNode[]): number {
  return nodes.reduce(
    (n, node) =>
      n + (node.children?.length ? countLeaves(node.children) : node.slug ? 1 : 0),
    0
  );
}

/** Depth-first search for the node whose slug matches. */
function findNode(nodes: DocNode[], slug: string): DocNode | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const found = n.children ? findNode(n.children, slug) : null;
    if (found) return found;
  }
  return null;
}

function subtreeHasActive(node: DocNode, activeSlug: string): boolean {
  if (node.slug === activeSlug) return true;
  return (node.children ?? []).some((c) => subtreeHasActive(c, activeSlug));
}

function DocNodeRow({
  node,
  activeSlug,
  hrefBase,
  onSelect,
  depth,
}: {
  node: DocNode;
  activeSlug: string;
  hrefBase: string;
  onSelect?: (slug: string) => void;
  depth: number;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const containsActive = hasChildren && subtreeHasActive(node, activeSlug);
  const [open, setOpen] = useState(containsActive);
  const on = node.slug === activeSlug;

  // Nested rows share a left guide line (each carries its own 1px border, so
  // they stack into one continuous line); the active row darkens its segment.
  const nested = depth > 0;
  const base =
    "block truncate py-1.5 text-sm transition-colors";
  const rowPad = nested ? "pl-4 pr-3" : "px-3";
  const guide = nested
    ? on
      ? "border-l border-foreground"
      : "border-l border-border-subtle"
    : "";
  const tone = on
    ? "font-medium text-foreground"
    : "text-muted-foreground hover:text-foreground";

  // Group header (has children): a toggle row. Emphasised when it holds the
  // active doc so the open section reads as current.
  if (hasChildren) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex items-center gap-2 py-1.5 text-sm transition-colors ${rowPad} ${
            nested ? "border-l border-border-subtle" : ""
          } ${
            containsActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex-1 truncate text-left">{node.title}</span>
          {/* The rotation is the open/closed indicator, so it still turns under
              reduced motion — only the tweening between the two states is
              dropped (motion-safe on the transition, not on the rotate). */}
          <ChevronRight
            className={`size-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--ds-duration-enter)] motion-safe:ease-[var(--ds-ease-out)] ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>
        {/* Accordion: 0fr -> 1fr on the grid track is the one place height wins
            over transform — there's no transform that reveals content without
            squashing it, and the rows below would otherwise teleport. Kept
            mounted for the transition, `inert` while closed so the hidden rows
            stay out of the tab order. */}
        <div
          className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--ds-duration-enter)] motion-safe:ease-[var(--ds-ease-out)] ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden" inert={!open}>
            <div className="flex flex-col pl-3">
              {children.map((c, i) => (
                <DocNodeRow
                  key={c.slug ?? `group-${i}`}
                  node={c}
                  activeSlug={activeSlug}
                  hrefBase={hrefBase}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Leaf doc.
  const href = node.slug ? `${hrefBase}/${node.slug}` : "#";
  return (
    <a
      href={href}
      aria-current={on ? "page" : undefined}
      onClick={(e) => {
        if (onSelect || !node.slug) {
          e.preventDefault();
        }
        if (onSelect && node.slug) {
          onSelect(node.slug);
        }
      }}
      className={`${base} ${rowPad} ${guide} ${tone}`}
    >
      {node.title}
    </a>
  );
}
