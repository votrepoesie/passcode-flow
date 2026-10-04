"use client";

import { useState } from "react";
import type { CustomRendererProps } from "streamdown";
import { CodeBlock } from "streamdown";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * HtmlPreview — a Streamdown custom renderer that turns a ```mockup fenced
 * block into a live, sandboxed UI preview (parallel to how ```mermaid renders a
 * diagram instead of code). Register it via the `renderers` plugin slot:
 *
 *   plugins={{ …, renderers: [{ language: "mockup", component: HtmlPreview }] }}
 *
 * The model emits self-contained HTML + CSS inside a ```mockup fence; it renders
 * in an isolated iframe (no scripts) with the DS brand tokens + fonts
 * injected so mockups read on-brand. A Preview / Code toggle exposes the source.
 *
 * Fence meta is parsed for optional `height=<px>` and `title="…"`, e.g.
 *   ```mockup height=560 title="Reservation approval"
 */
export function HtmlPreview({ code, isIncomplete, meta }: CustomRendererProps) {
  const [view, setView] = useState<"preview" | "code">("preview");

  const { height, title } = parseMeta(meta);

  return (
    <div
      className={cn(
        "my-4 grid w-full grid-cols-[minmax(0,1fr)] overflow-hidden border border-border bg-popover",
        // Flatten CodeBlock's own chrome so the source reads as one panel, not a
        // box-in-box: drop its container border/radius/bg + hide its language
        // header; keep padding and cap the height so it scrolls.
        "[&_[data-streamdown=code-block-header]]:hidden",
        "[&_[data-streamdown=code-block]]:m-0 [&_[data-streamdown=code-block]]:max-h-[520px] [&_[data-streamdown=code-block]]:gap-0 [&_[data-streamdown=code-block]]:overflow-auto [&_[data-streamdown=code-block]]:rounded-none [&_[data-streamdown=code-block]]:border-0 [&_[data-streamdown=code-block]]:bg-transparent [&_[data-streamdown=code-block]]:p-4"
      )}
    >
      {/* Three zones: label left, tabs centered, copy right. */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b bg-card px-3 py-2">
        <span className="min-w-0 truncate justify-self-start font-medium text-label text-muted-foreground">
          Mockup
        </span>
        {/* Toggle + copy — hidden while the fence is still streaming. */}
        {!isIncomplete && (
          <>
            <Tabs
              className="justify-self-center"
              value={view}
              onValueChange={(v) => setView(v as "preview" | "code")}
            >
              <TabsList className="h-6">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
            </Tabs>
            <CopyButton
              value={code}
              size="icon-xs"
              aria-label="Copy HTML"
              className="justify-self-end text-muted-foreground"
            />
          </>
        )}
      </header>

      {isIncomplete ? (
        // Fence not closed yet — don't render half-parsed HTML mid-stream.
        <div className="grid h-24 place-items-center bg-popover">
          <span className="text-shimmer font-medium text-label">
            Building preview…
          </span>
        </div>
      ) : view === "preview" ? (
        <iframe
          // sandbox="" → opaque origin, no scripts, no same-origin: the strongest
          // isolation for model-generated markup. Subresources (fonts, images,
          // stylesheets) still load.
          sandbox=""
          srcDoc={wrapMockup(code)}
          title={title ?? "UI mockup preview"}
          className="w-full resize-y border-0 bg-white"
          style={{ height }}
        />
      ) : (
        // CodeBlock brings its own chrome + scrolling. The card's minmax(0,1fr)
        // track caps the width so long lines scroll instead of stretching it.
        <CodeBlock code={code} language="html" />
      )}
    </div>
  );
}

/** Parse the fence metastring for `height=<px>` and `title="…"`. */
function parseMeta(meta?: string): { height: number; title?: string } {
  const DEFAULT_HEIGHT = 420;
  if (!meta) return { height: DEFAULT_HEIGHT };
  const h = meta.match(/height=(\d+)/)?.[1];
  const title = meta.match(/title="([^"]*)"/)?.[1];
  return { height: h ? Number(h) : DEFAULT_HEIGHT, title };
}

/* Brand tokens for the preview document — resolved light-mode values mirroring
   .ds in app/ds-theme.css. Kept inline so the iframe is self-contained
   (an opaque-origin sandbox can't reach the parent's stylesheets). Mockups can
   use var(--foreground), var(--secondary), etc. */
const PREVIEW_HEAD = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --background: #FAFAF9; --foreground: #1C1917;
    --card: #F5F5F4; --popover: #FFFFFF;
    --primary: #1C1917; --primary-foreground: #FAFAF9;
    --secondary: #F5F5F4; --secondary-foreground: #1C1917;
    --cta: #2563EB; --cta-foreground: #FFFFFF;
    --muted: #F5F5F4; --muted-foreground: #78716C;
    --accent: #F5F5F4; --border: #E7E5E4; --border-subtle: #F5F5F4;
    --input: #D6D3D1; --radius: 8px;
    --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
    --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
  }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-body);
    letter-spacing: -0.02em;
    /* Flush by default — mockups are full screens that own their own padding. */
    padding: 0;
  }
</style>`;

/** Wrap raw mockup markup in a full, brand-themed document for the iframe. */
export function wrapMockup(code: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">${PREVIEW_HEAD}</head><body>${code}</body></html>`;
}
