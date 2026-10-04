"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";

export type TocItem = { id: string; text: string; level: number };

/**
 * DS "On this page" table of contents: anchors into the article's headings
 * and scrollspy-highlights whichever sits nearest the top as you read.
 *
 * Works out of the box — by default it scans the page's `<article>` on mount,
 * assigns any missing heading `id`s, and builds the list itself. Pass `toc`
 * only if you already extract headings on the server (then it stays as given).
 *
 * Options:
 *  - `toc`             pre-built list; skips DOM scanning (controlled).
 *  - `contentRef` /    where to scan when `toc` is omitted. A ref wins over the
 *    `contentSelector`  selector (default `"article"`).
 *  - `levels`          heading levels to include (default `[2, 3]`).
 *  - `topOffset`       sticky-chrome height to clear when picking the active
 *                      heading, in px (default 64). Also add a matching
 *                      `scroll-margin-top` to your headings so anchor jumps
 *                      don't hide under fixed chrome.
 */
export function TableOfContents({
  toc: tocProp,
  contentRef,
  contentSelector = "article",
  levels = [2, 3],
  label = "On this page",
  topOffset = 64,
  activeId: activeIdProp,
  onSelect,
  className = "",
}: {
  toc?: TocItem[];
  contentRef?: RefObject<HTMLElement | null>;
  contentSelector?: string;
  levels?: number[];
  label?: string;
  topOffset?: number;
  /** Override which item is highlighted — disables the built-in scroll tracking. */
  activeId?: string | null;
  /** Called when an item is clicked — replaces the default anchor navigation. */
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const levelsKey = levels.join(",");
  const [scanned, setScanned] = useState<TocItem[]>([]);
  const controlled = activeIdProp !== undefined;

  // Auto-derive from the DOM when no explicit `toc` is supplied.
  useEffect(() => {
    if (tocProp) return;
    const root = contentRef?.current ?? document.querySelector(contentSelector);
    if (root) setScanned(buildToc(root as HTMLElement, levels));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocProp, contentRef, contentSelector, levelsKey]);

  const toc = tocProp ?? scanned;
  // Pass empty array when controlled so useActiveHeading returns early without
  // registering scroll/resize listeners that would produce unused work.
  const scrollActiveId = useActiveHeading(
    useMemo(() => (controlled ? [] : toc.map((t) => t.id)), [toc, controlled]),
    topOffset
  );
  const activeId = controlled ? activeIdProp : scrollActiveId;

  if (toc.length === 0) return null;

  return (
    <nav aria-label={label} className={`flex flex-col ${className}`}>
      <p className="mb-2 px-3 font-medium text-label text-muted-foreground">
        {label}
      </p>
      {toc.map((t) => {
        const on = t.id === activeId;
        return (
          <a
            key={t.id}
            href={`#${t.id}`}
            aria-current={on ? "location" : undefined}
            onClick={onSelect ? (e) => { e.preventDefault(); onSelect(t.id); } : undefined}
            className={`truncate py-1 text-xs transition-colors ${
              t.level >= 3 ? "pl-6" : "pl-3"
            } ${on ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.text}
          </a>
        );
      })}
    </nav>
  );
}

/** kebab-case slug from heading text, for anchor ids. */
function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Read headings from `root`, assigning any missing `id`s so anchors resolve. */
function buildToc(root: HTMLElement, levels: number[]): TocItem[] {
  const selector = levels.map((l) => `h${l}`).join(",");
  const seen = new Set<string>();
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
    const text = (el.textContent ?? "").trim();
    let id = el.id;
    if (!id) {
      id = slugify(text);
      while (seen.has(id)) id += "-1";
      el.id = id;
    }
    seen.add(id);
    return { id, text, level: Number(el.tagName[1]) };
  });
}

/** Highlight the heading nearest the top of the viewport as you scroll.
 *  Uses scroll position rather than IntersectionObserver so it follows the read
 *  position deterministically (IO's band never advances when sections are tall
 *  or short). The listener is registered in the capture phase so it fires
 *  whether the window or an inner `overflow` container is the scroller. */
// How close to the bottom (px) counts as "at the end" for activating the last
// heading — leeway so short final sections light up before the exact bottom.
const BOTTOM_LEEWAY = 240;

export function useActiveHeading(ids: string[], topOffset = 64): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) return;

    const pick = (e?: Event) => {
      // A short final section can't scroll its heading up to the top line, so it
      // would never activate. When the scroller nears the bottom, force the last
      // one — the leeway means the last item lights up a bit before the very end.
      const sc = scrollerOf(e);
      if (sc && sc.scrollTop + sc.clientHeight >= sc.scrollHeight - BOTTOM_LEEWAY) {
        setActive(ids[ids.length - 1] ?? null);
        return;
      }
      let current = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        // The last heading whose top has scrolled past the sticky chrome wins.
        if (el.getBoundingClientRect().top - topOffset <= 1) current = id;
        else break;
      }
      setActive(current);
    };

    pick();
    // capture: true catches scroll from any element (scroll doesn't bubble).
    window.addEventListener("scroll", pick, true);
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick, true);
      window.removeEventListener("resize", pick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, topOffset]);

  return active;
}

/** The element that actually scrolled for this event — the event target when
 *  it's a scrollable element, otherwise the document scroller (window scroll
 *  fires on `document`). Falls back to the document scroller with no event. */
function scrollerOf(e?: Event): Element | null {
  const t = e?.target;
  if (t instanceof Element) return t;
  return document.scrollingElement ?? document.documentElement;
}
