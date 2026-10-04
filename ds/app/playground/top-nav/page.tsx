"use client";

import { useState } from "react";
import { TopNav } from "@/components/ds/top-nav";

/** Empty page to view the TopNav as real page chrome, at full width.
    The nav's moon icon drives the theme. */
export default function TopNavPreview() {
  const [dark, setDark] = useState(false);

  return (
    <div className={`${dark ? "ds dark" : "ds"} flex min-h-screen flex-col`}>
      <TopNav isDark={dark} onToggleTheme={() => setDark((d) => !d)} />

      <main className="flex flex-1 items-center justify-center bg-background">
        <span className="font-medium text-xs text-muted-foreground">
          Empty page
        </span>
      </main>

      <a
        href="/playground"
        className="fixed bottom-6 right-6 font-medium text-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Playground
      </a>
    </div>
  );
}
