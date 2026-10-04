/**
 * Emits public/r/registry.json — the registry *index*.
 *
 * `shadcn build` writes one file per item but no index, so this used to be
 * hand-maintained and silently rotted (it sat at 13 of 32 items, with the old
 * homepage and bare registryDependencies, from the initial commit until it was
 * caught in review). It is a pure derivation of registry.json — the same
 * document with file `content` stripped — so it is generated instead.
 *
 * Runs as part of `npm run registry:build`. Do not edit the output by hand.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "registry.json";
const OUT = "public/r/registry.json";

const registry = JSON.parse(readFileSync(SRC, "utf8"));
const names = new Set(registry.items.map((i) => i.name));

// A bare dep name resolves against ui.shadcn.com, not this registry — which
// 404s for DS-only items and, worse, silently substitutes upstream shadcn
// components for ones we ship under the same name (button, input, dialog…).
const bare = registry.items.flatMap((item) =>
  (item.registryDependencies ?? [])
    .filter((d) => names.has(d))
    .map((d) => `${item.name} -> ${d}`),
);
if (bare.length) {
  console.error(
    `${SRC}: these registryDependencies name local items but are not absolute URLs:\n  ${bare.join("\n  ")}\n` +
      `Use ${registry.homepage}/r/<name>.json instead.`,
  );
  process.exit(1);
}

const index = {
  ...registry,
  items: registry.items.map((item) => ({
    ...item,
    // Keep the file manifest (path/type/target), drop the payload — consumers
    // fetch the per-item JSON for content.
    files: item.files?.map(({ content, ...rest }) => rest),
  })),
};

writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n");
console.log(`✔ ${OUT} — ${index.items.length} items`);
