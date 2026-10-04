"use client";

import { DocList, type DocNode } from "./doc-list";
import { TableOfContents, type TocItem } from "./table-of-contents";

export type { DocNode, TocItem };

/**
 * DS docs side navigation — composes the two pieces a docs layout needs:
 * a DocList card (which doc you're on) and a TableOfContents (where you are in
 * the page). Use this for the whole rail, or drop in either half on its own.
 *
 * `docs` + `activeSlug` come from the server; `toc` is the current doc's
 * heading list (see getDoc). Headings need matching `id`s for the TOC anchors
 * + scrollspy — getDoc injects them, or TableOfContents can scan for them.
 */
export function DocsNav({
  docs,
  activeSlug,
  toc,
  hrefBase = "/design-system/docs",
  alwaysOpen = false,
  onSelect,
}: {
  docs: DocNode[];
  activeSlug: string;
  toc: TocItem[];
  hrefBase?: string;
  alwaysOpen?: boolean;
  onSelect?: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <DocList
        docs={docs}
        activeSlug={activeSlug}
        hrefBase={hrefBase}
        alwaysOpen={alwaysOpen}
        onSelect={onSelect}
      />
      <TableOfContents toc={toc} />
    </div>
  );
}
