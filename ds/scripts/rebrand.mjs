#!/usr/bin/env node
/**
 * Rebrand the starter for a company or project.
 *
 *   npm run rebrand -- --name "Northwind" --prefix nw --url https://ds.northwind.com
 *
 * Every flag is optional; omit one to leave that part unchanged.
 *   --name    Display name (lib/brand.ts, package.json name).
 *   --prefix  Token prefix + scope class. `ds` → `nw` turns `--ds-brand-500`
 *             into `--nw-brand-500`, `.ds` into `.nw`, `ds-theme.css` into
 *             `nw-theme.css`, and `components/ds/` into `components/nw/`.
 *   --url     Where the registry will be served (registry.json homepage).
 *   --dry     Print what would change without writing anything.
 *
 * The current prefix is read from registry.json `name`, so the script can be
 * re-run. Colours are not touched — edit the ramps in app/<prefix>-tokens.css.
 * Afterwards run `npm run registry:build` to regenerate public/r/.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = fileURLToPath(import.meta.url);

// ── args ───────────────────────────────────────────────────────────────────
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith("--")) continue;
  const key = a.slice(2);
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[key] = true;
  else args[key] = argv[++i];
}
const dry = Boolean(args.dry);

if (!args.name && !args.prefix && !args.url) {
  console.log(readFileSync(SELF, "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*?/, "").replace(/^ \* ?/gm, ""));
  process.exit(1);
}

const registryPath = join(ROOT, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const from = registry.name;
const to = args.prefix ? String(args.prefix) : from;

if (!/^[a-z][a-z0-9]*$/.test(to)) {
  console.error(`--prefix must be lowercase letters/digits starting with a letter (got "${to}").`);
  process.exit(1);
}

// ── text replacement ──────────────────────────────────────────────────────
const EXTS = new Set([".ts", ".tsx", ".css", ".md", ".json", ".mjs"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);
const TARGETS = ["app", "components", "lib", "scripts", "registry.json", "README.md", "AGENTS.md"];
// Documents the before → after mapping itself, so it keeps the original names.
const SKIP_FILES = new Set(["app/design-system/docs/customizing.md"]);

function walk(p, out = []) {
  const abs = join(ROOT, p);
  if (!existsSync(abs)) return out;
  if (statSync(abs).isDirectory()) {
    if (SKIP_DIRS.has(basename(abs))) return out;
    for (const f of readdirSync(abs)) walk(join(p, f), out);
  } else if (EXTS.has(extname(abs)) && abs !== SELF && !SKIP_FILES.has(p)) {
    out.push(p);
  }
  return out;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rules = [];
if (to !== from) {
  // --ds-token  →  --nw-token
  rules.push([new RegExp(`--${esc(from)}-`, "g"), `--${to}-`]);
  // ds-theme, ds-inverse, ds-menu-in, .ds-skin …  (not preceded by a word char or dash)
  rules.push([new RegExp(`(?<![\\w-])${esc(from)}-(?=[a-z])`, "g"), `${to}-`]);
  // the bare scope class / folder / registry name: .ds, "ds dark", components/ds/
  rules.push([new RegExp(`(?<![\\w-])${esc(from)}(?![\\w-])`, "g"), to]);
}
if (args.url) {
  const url = String(args.url).replace(/\/+$/, "");
  rules.push([new RegExp(esc(registry.homepage), "g"), url]);
}

let changed = 0;
for (const file of TARGETS.flatMap((t) => walk(t))) {
  const abs = join(ROOT, file);
  const before = readFileSync(abs, "utf8");
  let after = before;
  for (const [re, rep] of rules) after = after.replace(re, rep);
  if (after !== before) {
    changed++;
    console.log(`  edit   ${file}`);
    if (!dry) writeFileSync(abs, after);
  }
}

// ── brand name ────────────────────────────────────────────────────────────
if (args.name) {
  const name = String(args.name);
  const brandPath = join(ROOT, "lib/brand.ts");
  const src = readFileSync(brandPath, "utf8");
  const next = src.replace(/(\bname:\s*)"[^"]*"/, `$1${JSON.stringify(name)}`);
  if (next !== src) {
    console.log(`  edit   lib/brand.ts (name → ${name})`);
    if (!dry) writeFileSync(brandPath, next);
  }
  const pkgPath = join(ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  pkg.name = `${slug}-design-system`;
  console.log(`  edit   package.json (name → ${pkg.name})`);
  if (!dry) writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

// ── file / folder renames ─────────────────────────────────────────────────
if (to !== from) {
  const renames = [
    [`app/${from}-theme.css`, `app/${to}-theme.css`],
    [`app/${from}-tokens.css`, `app/${to}-tokens.css`],
    [`components/${from}`, `components/${to}`],
  ];
  for (const [a, b] of renames) {
    if (!existsSync(join(ROOT, a))) continue;
    console.log(`  move   ${a} → ${b}`);
    if (!dry) renameSync(join(ROOT, a), join(ROOT, b));
  }
}

console.log(
  `\n${dry ? "Dry run: " : ""}${changed} file(s) updated.` +
    (dry ? "" : "\nNext: edit the brand ramp in app/" + to + "-tokens.css, then `npm run registry:build`."),
);
