"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Shot = { src: string; alt: string };

/** Renders the doc HTML and turns every image in it into a click-to-open
 *  gallery. The doc HTML stays server-rendered (dangerouslySetInnerHTML), so
 *  we don't own those <img> nodes as React elements — instead we delegate
 *  clicks on the container and resolve the clicked image at click time. That
 *  sidesteps the timing traps of attaching listeners to nodes React injected
 *  via innerHTML during hydration. */
export function DocArticle({ html }: { html: string }) {
  const ref = React.useRef<HTMLElement>(null);
  const [shots, setShots] = React.useState<Shot[]>([]);
  const [index, setIndex] = React.useState<number | null>(null);
  // In-lightbox zoom: click the image to magnify, pointer position pans.
  const ZOOM = 2.5;
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");

  const openFrom = React.useCallback((img: HTMLImageElement) => {
    const root = ref.current;
    if (!root) return;
    const imgs = Array.from(root.querySelectorAll("img"));
    setShots(imgs.map((el) => ({ src: el.currentSrc || el.src, alt: el.alt })));
    setIndex(imgs.indexOf(img));
    setZoomed(false);
    setOrigin("50% 50%");
  }, []);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const img = (e.target as HTMLElement).closest("img");
      if (img && ref.current?.contains(img)) openFrom(img as HTMLImageElement);
    },
    [openFrom]
  );

  const close = React.useCallback(() => {
    setIndex(null);
    setZoomed(false);
    setOrigin("50% 50%");
  }, []);
  const step = React.useCallback(
    (dir: number) => {
      setIndex((i) => (i === null ? i : (i + dir + shots.length) % shots.length));
      setZoomed(false);
      setOrigin("50% 50%");
    },
    [shots.length]
  );

  // Keyboard nav + scroll lock while the gallery is open.
  React.useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, step]);

  const shot = index === null ? null : shots[index];

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <article
        ref={ref}
        className="doc-prose"
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {shot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shot.alt || "Image gallery"}
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-sm motion-safe:animate-overlay-in"
        >
          {/* Top bar: counter + close */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4">
            <span className="font-medium text-label text-muted-foreground">
              {index! + 1} / {shots.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Stage */}
          <div className="flex min-h-0 flex-1 items-center justify-center gap-4 overflow-hidden px-4 pb-6">
            {shots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              onMouseMove={(e) => {
                if (!zoomed) return;
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                setOrigin(`${x}% ${y}%`);
              }}
              style={{
                transform: zoomed ? `scale(${ZOOM})` : "scale(1)",
                transformOrigin: origin,
                transition: zoomed ? "none" : "transform 160ms var(--ds-ease-out)",
                cursor: zoomed ? "zoom-out" : "zoom-in",
              }}
              className="max-h-full max-w-full object-contain border border-border-subtle"
            />

            {shots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

        </div>
      )}
    </>
  );
}
