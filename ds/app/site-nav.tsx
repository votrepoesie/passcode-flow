"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { brand } from "@/lib/brand";
import { toggleTheme, useTheme } from "./use-theme";

// App-level nav for the design-system surfaces. Render as the first child of a
// `.ds` container so its tokens resolve (and inherit `.dark` when set).
const LINKS = [
  { href: "/playground", label: "Playground" },
  { href: "/playground/colors", label: "Colors" },
  { href: "/playground/typography", label: "Typography" },
  { href: "/design-system/docs", label: "Docs" },
];

// Both theme icons share one grid cell; crossfade + rotate on the swap.
const THEME_ICON =
  "col-start-1 row-start-1 size-4 transition-[opacity,rotate] duration-(--ds-duration-enter) ease-out";

export function SiteNav() {
  const pathname = usePathname();
  // Playground is matched exactly so its own sub-routes (typography) don't light
  // it up; the others match their whole subtree (docs slug pages included).
  const isActive = (href: string) =>
    href === "/playground" ? pathname === "/playground" : pathname.startsWith(href);

  const headerRef = useRef<HTMLElement>(null);
  const dark = useTheme();

  // Pages that control their own `.ds` className already reflect the theme;
  // docs pages render a static wrapper, so mirror the class onto the nearest
  // `.ds` ancestor here too. Re-run on navigation since each route remounts.
  useEffect(() => {
    const root = headerRef.current?.closest(".ds");
    root?.classList.toggle("dark", dark);
  }, [dark, pathname]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-5 border-b border-border-subtle bg-background/95 px-6 backdrop-blur"
    >
      <Link
        href="/"
        className="font-medium text-label text-foreground"
      >
        {brand.name} <span className="text-muted-foreground">/ Design System</span>
      </Link>
      <nav className="flex items-stretch self-stretch">
        {LINKS.map((l) => {
          const on = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={on ? "page" : undefined}
              className={`relative flex items-center px-3 font-medium text-label transition-colors ${
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
              {on && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 bg-cta" />
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark}
        className="ml-auto grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {/* Both faces stay mounted in one grid cell so the swap crossfades and
            rotates as one dial; rotation is
            motion-safe so reduced-motion keeps the fade only. */}
        <Sun
          aria-hidden
          className={`${THEME_ICON} ${
            dark ? "opacity-100" : "opacity-0 motion-safe:-rotate-90"
          }`}
        />
        <Moon
          aria-hidden
          className={`${THEME_ICON} ${
            dark ? "opacity-0 motion-safe:rotate-90" : "opacity-100"
          }`}
        />
      </button>
    </header>
  );
}
