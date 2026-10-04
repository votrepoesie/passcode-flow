import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { marked } from "marked";

const DOCS_DIR = join(process.cwd(), "app/design-system/docs");

// git log spawns a subprocess per doc; the sidenav re-runs listDocs() on every
// navigation, so without a cache each click forks git N times. Cache the result
// keyed by mtime so an edit still refreshes the date.
const editedCache = new Map<string, { mtimeMs: number; date: string }>();

/** Last-edited date (YYYY-MM-DD) for a doc file. Prefers the commit date of the
 *  most recent git commit that touched the file; falls back to the filesystem
 *  mtime for files not yet committed, or when git is unavailable. */
function lastEditedOf(file: string): string {
  const abs = join(DOCS_DIR, file);
  const mtimeMs = statSync(abs).mtimeMs;
  const hit = editedCache.get(abs);
  if (hit && hit.mtimeMs === mtimeMs) return hit.date;

  let date: string | undefined;
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", abs],
      { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (out) date = out;
  } catch {
    // git missing or not a repo — fall through to mtime
  }
  date ??= new Date(mtimeMs).toISOString().slice(0, 10);
  editedCache.set(abs, { mtimeMs, date });
  return date;
}

// Preferred ordering for the index; anything else falls in after, alphabetical.
const ORDER = [
  "README",
  "DESIGN-SYSTEM",
  "brand-guidelines",
  "customizing",
  "elevation",
  "chat",
];

// Docs kept out of the rail/index (still reachable by direct URL).
const HIDDEN = new Set([
  "readme",
]);

const slugify = (file: string) => file.replace(/\.md$/, "").toLowerCase();

/** Drop a leading YAML front-matter block. Handles both a standard
 *  `---\n…\n---` block and DESIGN.md's variant that omits the opening `---`
 *  (any `---` line that appears before the first `#` heading closes it). */
function stripFrontmatter(raw: string): string {
  if (raw.startsWith("---\n")) {
    const end = raw.indexOf("\n---", 4);
    if (end !== -1) return raw.slice(raw.indexOf("\n", end + 1) + 1);
  }
  const lines = raw.split("\n");
  const firstHeading = lines.findIndex((l) => l.startsWith("#"));
  const firstFence = lines.findIndex((l) => l.trim() === "---");
  if (firstFence !== -1 && (firstHeading === -1 || firstFence < firstHeading)) {
    return lines.slice(firstFence + 1).join("\n");
  }
  return raw;
}

/** Parse a leading `---\n…\n---` YAML block into flat `key: value` pairs.
 *  Only the standard fenced form counts; a bare `---` body separator (as in
 *  DESIGN.md) yields no fields, so those docs fall back to their H1. */
function parseFrontmatter(raw: string): Record<string, string> {
  if (!raw.startsWith("---\n")) return {};
  const end = raw.indexOf("\n---", 4);
  if (end === -1) return {};
  const out: Record<string, string> = {};
  for (const line of raw.slice(4, end).split("\n")) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Display name for a doc: `title:` front-matter override wins, then the
 *  first H1, then the filename. */
function titleOf(body: string, file: string, fm: Record<string, string>): string {
  if (fm.title) return fm.title;
  const h1 = body.split("\n").find((l) => l.startsWith("# "));
  if (h1) return h1.replace(/^#\s+/, "").trim();
  return file.replace(/\.md$/, "");
}

function blurbOf(body: string): string {
  const para = body
    .split("\n")
    .find(
      (l) =>
        l.trim() &&
        !l.startsWith("#") &&
        !l.startsWith(">") &&
        !l.startsWith("|") &&
        !l.startsWith("```")
    );
  if (!para) return "";
  const clean = para.replace(/[*`_[\]]/g, "").replace(/\(.*?\)/g, "").trim();
  return clean.length > 130 ? clean.slice(0, 127).trimEnd() + "…" : clean;
}

export type DocMeta = {
  slug: string;
  title: string;
  blurb: string;
  lastEdited: string;
};

const ORDER_SLUGS = ORDER.map((k) => k.toLowerCase());
const rank = (slug: string) => {
  const i = ORDER_SLUGS.indexOf(slug);
  return i === -1 ? ORDER_SLUGS.length : i;
};

export function listDocs(): DocMeta[] {
  const files = readdirSync(DOCS_DIR).filter(
    (f) => f.endsWith(".md") && !HIDDEN.has(slugify(f))
  );
  const metas = files.map((file) => {
    const raw = readFileSync(join(DOCS_DIR, file), "utf8");
    const fm = parseFrontmatter(raw);
    const body = stripFrontmatter(raw);
    const slug = slugify(file);
    return {
      slug,
      title: titleOf(body, file, fm),
      blurb: blurbOf(body),
      lastEdited: lastEditedOf(file),
    };
  });
  return metas.sort(
    (a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug)
  );
}

// A heading in the "On this page" table of contents.
export type TocItem = { id: string; text: string; level: number };

/** Give every h2/h3 a stable slug id and collect them into a TOC, so the docs
 *  sidebar can deep-link + scrollspy. Ids are de-duped within a doc. */
function injectHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>();
  const out = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_m, lvl: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      let id =
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
        `section-${toc.length + 1}`;
      while (seen.has(id)) id += "-1";
      seen.add(id);
      toc.push({ id, text, level: Number(lvl) });
      return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
    }
  );
  return { html: out, toc };
}

export function getDoc(
  slug: string
): { title: string; html: string; toc: TocItem[]; lastEdited: string } | null {
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
  const file = files.find((f) => slugify(f) === slug);
  if (!file) return null;
  const raw = readFileSync(join(DOCS_DIR, file), "utf8");
  const fm = parseFrontmatter(raw);
  const body = stripFrontmatter(raw);
  // Relative image paths resolve to /public/docs/<slug>/. Authors keep writing
  // `![](name.png)`; drop the file in public/docs/<slug>/ and it serves.
  const rendered = (marked.parse(body, { gfm: true, async: false }) as string).replace(
    /(<img\b[^>]*\bsrc=")(?!https?:|\/|data:)/g,
    `$1/docs/${slug}/`
  );
  const { html, toc } = injectHeadingIds(rendered);
  return { title: titleOf(body, file, fm), html, toc, lastEdited: lastEditedOf(file) };
}

export function allSlugs(): string[] {
  return readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(slugify);
}
