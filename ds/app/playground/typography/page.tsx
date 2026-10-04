"use client";

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

function Panel({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-14 first:pt-0">
      <Label>{title}</Label>
      {intro && (
        <p className="mt-2 max-w-[560px] text-sm font-light leading-relaxed text-muted-foreground">
          {intro}
        </p>
      )}
      <div className="mt-7">{children}</div>
    </section>
  );
}

/** One specimen row: live text on the left, its spec on the right. */
function Row({
  sample,
  sampleClass,
  token,
  size,
  family,
  use,
}: {
  sample: string;
  sampleClass: string;
  token: string;
  size: string;
  family: string;
  use: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-8 border-t border-border-subtle py-5 first:border-t-0">
      <p className={`${sampleClass} min-w-0 flex-1 truncate text-foreground`}>
        {sample}
      </p>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <span className="font-medium text-label text-foreground">
          {token}
        </span>
        <span className="font-mono text-label text-muted-foreground">
          {size} · {family}
        </span>
        <span className="max-w-[280px] text-xs text-muted-foreground">
          {use}
        </span>
      </div>
    </div>
  );
}

/* ── product-UI scale (the working, in-product sizes) ───────────────────── */

const PRODUCT = [
  {
    token: "text-[32px]",
    sample: "Page title",
    sampleClass: "text-[32px] font-medium leading-tight tracking-tight",
    size: "32px / 2rem",
    family: "Geist 500",
    use: "Page titles (h1)",
  },
  {
    token: "text-2xl",
    sample: "Section heading",
    sampleClass: "text-2xl font-medium tracking-tight",
    size: "24px / 1.5rem",
    family: "Geist 500",
    use: "Section headings (h2)",
  },
  {
    token: "text-xl",
    sample: "Subsection heading",
    sampleClass: "text-xl font-medium tracking-tight",
    size: "20px / 1.25rem",
    family: "Geist 500",
    use: "Subsection headings (h3)",
  },
  {
    token: "text-base",
    sample: "Project details",
    sampleClass: "text-base font-medium",
    size: "16px / 1rem",
    family: "Geist 500",
    use: "Panel / card titles",
  },
  {
    token: "text-body",
    sample: "How long should the first phase take?",
    sampleClass: "text-body",
    size: "15px / .938rem",
    family: "Geist 400",
    use: "Primary in-product body",
  },
  {
    token: "text-sm",
    sample: "Phased rollout — start small, then expand",
    sampleClass: "text-sm",
    size: "14px / .875rem",
    family: "Geist 400",
    use: "Options, secondary copy, inputs, buttons",
  },
  {
    token: "text-label",
    sample: "Recent activity",
    sampleClass: "text-label font-medium",
    size: "12px / .75rem",
    family: "Geist 500",
    use: "Nav / tab labels, eyebrows, table headers",
  },
  {
    token: "font-mono text-xs",
    sample: "npm run dev",
    sampleClass: "font-mono text-xs",
    size: "12px / .75rem",
    family: "Geist Mono 400",
    use: "Code, tokens, tabular values",
  },
];

/* ── families ───────────────────────────────────────────────────────────── */

const FAMILIES = [
  { name: "Geist", glyph: "Ag", style: { fontFamily: "var(--font-geist-sans), var(--ds-font-sans)" }, use: "All titles, body, and labels. Weight 400 for text, 500 for hierarchy, 600 sparingly." },
  { name: "Geist Mono", glyph: "Ag", style: { fontFamily: "var(--font-geist-mono), var(--ds-font-mono)" }, use: "Code, token names, and tabular numbers only." },
];

export default function TypographyGuide() {
  const dark = useTheme();

  return (
    <div className={`${dark ? "ds dark" : "ds"} flex h-screen flex-col overflow-hidden bg-background`}>
      <SiteNav />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-12 py-14">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-medium leading-tight text-foreground">
            Typography
          </h1>
        </div>

        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {FAMILIES.map((f) => (
            <div key={f.name} className="flex flex-col gap-3 rounded-lg border border-border-subtle p-5">
              <span
                className="text-[52px] leading-none text-foreground"
                style={f.style}
              >
                {f.glyph}
              </span>
              <span className="text-sm font-medium text-foreground">
                {f.name}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {f.use}
              </span>
            </div>
          ))}
        </div>
        

        <Panel title="Product UI Scale" 
        intro="The working sizes used in the product, with their specs and uses.">
          <div className="flex flex-col">
            {PRODUCT.map((r) => (
              <Row key={r.token} {...r} />
            ))}
          </div>
        </Panel>
        </div>
      </main>
    </div>
  );
}
