"use client";

import { useSyncExternalStore } from "react";
import { CopyButton } from "@/components/ui/button";

// The registry host: real origin on the client, placeholder during SSR.
// useSyncExternalStore keeps this client-only value out of an effect and
// hydration-safe.
const noop = () => () => {};
export function useOrigin() {
  return useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => "{registry-url}",
  );
}

export function installCommand(base: string, name: string) {
  return `npx shadcn@latest add ${base}/r/${name}.json`;
}

/** One copyable `npx shadcn add` row for a registry item. Uses the real host
 *  the page is served from, so copied commands are runnable as-is (localhost
 *  in dev, the deployed domain in prod). */
export function InstallCommand({ name }: { name: string }) {
  const cmd = installCommand(useOrigin(), name);
  return (
    <div className="flex items-center gap-3 bg-card p-3 pl-4">
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs">
        {cmd}
      </code>
      <CopyButton value={cmd} aria-label={`Copy install command for ${name}`} />
    </div>
  );
}
