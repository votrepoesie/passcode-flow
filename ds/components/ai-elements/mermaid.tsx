"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "@/app/use-theme";

let renderSeq = 0;

/**
 * DS-skinned Mermaid diagram. Renders the chart to SVG on the client and
 * themes it from the live DS tokens read off the mounted node, so it tracks
 * light / dark automatically. Flat nodes, foreground edges, mono labels; tag a node
 * with `class <id> term` to give it the brand terminal treatment.
 *
 * SSR renders an empty shell (svg state is ""), matching the first client paint,
 * so there is no hydration mismatch — the effect fills it in after mount.
 */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useTheme();
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const cs = getComputedStyle(el);
    const v = (name: string, fallback: string) =>
      cs.getPropertyValue(name).trim() || fallback;

    const bg = v("--background", "#FAFAF9");
    const card = v("--card", "#F5F5F4");
    const fg = v("--foreground", "#1C1917");
    const muted = v("--muted-foreground", "#78716C");
    const cta = v("--cta", "#2563EB");
    const ctaFg = v("--cta-foreground", "#FFFFFF");
    const term = v("--ds-brand-700", "#1D4ED8");

    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "strict",
      fontFamily: 'ui-monospace, "Geist Mono", monospace',
      flowchart: { curve: "linear", padding: 14 },
      themeVariables: {
        background: "transparent",
        primaryColor: card,
        primaryBorderColor: fg,
        primaryTextColor: fg,
        secondaryColor: card,
        tertiaryColor: card,
        lineColor: fg,
        textColor: fg,
        edgeLabelBackground: bg,
        fontSize: "12px",
      },
    });

    // Brand terminal treatment for any node tagged `class <id> term`. `classDef`
    // is flowchart-only syntax, so only append it for graph/flowchart charts —
    // adding it to a sequence/other diagram makes the whole chart invalid.
    const isFlowchart = /^\s*(flowchart|graph)\b/.test(chart);
    const source = isFlowchart
      ? `${chart}\nclassDef term fill:${cta},stroke:${term},color:${ctaFg},stroke-width:1.5px;`
      : chart;
    const id = `ds-mermaid-${renderSeq++}`;

    mermaid
      .render(id, source)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        /* invalid chart — leave empty */
      });

    return () => {
      cancelled = true;
    };
  }, [chart, dark]);

  return (
    <div
      ref={ref}
      className="mermaid-ds flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
