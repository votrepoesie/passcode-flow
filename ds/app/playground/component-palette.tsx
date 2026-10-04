"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "@/app/use-theme";

type Story = { id: string; name: string; blurb: string };

// Other DS surfaces worth jumping to straight from the palette.
const PAGES = [
  { href: "/playground/colors", name: "Colors" },
  { href: "/playground/typography", name: "Typography" },
  { href: "/playground/checklist-sidebar", name: "Checklist sidebar (full page)" },
  { href: "/playground/top-nav", name: "Top nav (full page)" },
  { href: "/design-system/docs", name: "Docs" },
];

// Mono group headings to match the rail's section labels.
const GROUP =
  "[&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-label";

/** ⌘K / Ctrl+K palette for jumping between playground stories and DS pages. */
export function ComponentPalette({
  groups,
  active,
  onSelect,
}: {
  groups: { heading: string; items: Story[] }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Radix portals the dialog out of the page's `.ds` scope, so re-declare
  // the theme on the portaled content.
  const dark = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      // PanelChat binds ⌘K to its own history palette; leave the keystroke to
      // it while focus is inside the chat.
      const target = e.target as Element | null;
      if (target?.closest?.(".ds-panel-chat")) return;
      e.preventDefault();
      e.stopPropagation();
      setOpen((o) => !o);
    };
    // Capture phase so this runs before PanelChat's document listener.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Go to component"
      description="Search playground components and design-system pages"
      showCloseButton={false}
      className={`${dark ? "ds dark" : "ds"} sm:max-w-[560px]`}
    >
      <CommandInput placeholder="Search components…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No components found.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g.heading} heading={g.heading} className={GROUP}>
            {g.items.map((s) => (
              <CommandItem
                key={s.id}
                value={s.name}
                keywords={[s.id, s.blurb]}
                onSelect={() => run(() => onSelect(s.id))}
                className="flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center gap-2 text-sm text-foreground">
                  {s.name}
                  {s.id === active && (
                    <span className="ml-auto font-medium text-label text-muted-foreground">
                      Current
                    </span>
                  )}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {s.blurb}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Pages" className={GROUP}>
          {PAGES.map((p) => (
            <CommandItem
              key={p.href}
              value={p.name}
              keywords={[p.href]}
              onSelect={() => run(() => router.push(p.href))}
            >
              <span className="text-sm text-foreground">{p.name}</span>
              <ArrowUpRight className="ml-auto" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
