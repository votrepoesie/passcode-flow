"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/* ── Banner ───────────────────────────────────────────────────────────────
   A banner is a STATE, not an event (events are toasts): "you're offline",
   "Google Drive disconnected", "payment failed". It stays until the state
   clears. DS's banner belongs to the nav: render it directly after
   <TopNav /> in the same sticky/relative wrapper. The nav's bottom edge turns
   the severity colour, and a compact tab hangs from its centre — mark · label
   · message · action. It OVERLAYS the page rather than pushing it, so the
   layout never shifts. Hover, focus or tap drops the tab open to show the
   description and every other active banner.

   Declarative: pass the banners that are true right now. Errors sort ahead of
   warnings. An action may return a Promise — the banner then runs the retry
   flow itself: pending → resolved (brief success confirmation, then
   `onResolved`) or back to the error with "Still failing · tried {time}".

   Tones: error = --destructive-text, warning = --warning (amber),
   resolved = --success (green). */

type BannerSeverity = "error" | "warning"

type BannerAction = {
  label: string
  /** Return a Promise to get the pending → resolved / failed flow. */
  onClick: () => void | Promise<unknown>
  /** Shown while the Promise is pending, e.g. "Reconnecting…". */
  pendingLabel?: string
  /** Shown briefly once it resolves, e.g. "Back online — 3 edits synced". */
  resolvedLabel?: string
}

type BannerItem = {
  id: string
  severity: BannerSeverity
  /** Context label, e.g. "Offline", "Google Drive", "Billing". */
  eyebrow: string
  title: string
  description?: string
  action?: BannerAction
  /** Omit to make the banner non-dismissible (e.g. offline). */
  onDismiss?: () => void
  /** Called after a resolved action's confirmation — remove the item here. */
  onResolved?: () => void
}

type Phase =
  | { kind: "active"; lastTried?: number }
  | { kind: "pending" }
  | { kind: "resolved" }

type Tone = BannerSeverity | "resolved"

const EASE = [0.23, 1, 0.32, 1] as const

/** Hover handlers that ignore touch/pen: a tap fires pointerenter but never a
 *  matching leave, which would leave the tab stuck open. Touch uses tap. */
function mouseHover(set: (v: boolean) => void) {
  return {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && set(true),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && set(false),
  }
}
const RESOLVED_MS = 1600

function Banner({ items, className }: { items: BannerItem[]; className?: string }) {
  const reduce = useReducedMotion()
  const [phases, setPhases] = React.useState<Record<string, Phase>>({})
  const [hover, setHover] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)

  const list = React.useMemo(
    () => [...items].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1)),
    [items]
  )
  const phaseOf = (id: string): Phase => phases[id] ?? { kind: "active" }
  const top = list[0]
  const topTone = top ? toneOf(top, phaseOf(top.id)) : undefined
  const open = !!top && (hover || focused || pinned)

  const run = React.useCallback((b: BannerItem) => {
    const result = b.action?.onClick()
    if (!(result instanceof Promise)) return
    const set = (p: Phase) => setPhases((m) => ({ ...m, [b.id]: p }))
    set({ kind: "pending" })
    result.then(
      () => {
        set({ kind: "resolved" })
        setTimeout(() => {
          b.onResolved?.()
          // Forget the phase so the same banner re-raised later starts fresh.
          setPhases((m) => {
            const rest = { ...m }
            delete rest[b.id]
            return rest
          })
        }, RESOLVED_MS)
      },
      () => set({ kind: "active", lastTried: Date.now() })
    )
  }, [])

  return (
    <div data-slot="banner" role="region" aria-label="Status" className={cn("relative h-0", className)}>
      {/* The nav's bottom edge in the top banner's tone — grows from the centre. */}
      <AnimatePresence>
        {topTone && (
          <motion.div
            key="edge"
            data-tone={topTone}
            // Full transform strings — Motion's shorthands run on the main thread.
            initial={reduce ? { opacity: 0 } : { transform: "scaleX(0)" }}
            animate={reduce ? { opacity: 1 } : { transform: "scaleX(1)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { transform: "scaleX(0)", transition: { duration: 0.16, ease: EASE } }
            }
            transition={{ duration: 0.26, ease: EASE }}
            className="absolute inset-x-0 top-0 z-10 h-[2px] origin-center transition-colors duration-200 data-[tone=error]:bg-destructive-text data-[tone=resolved]:bg-success data-[tone=warning]:bg-warning"
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-[2px] z-10 flex justify-center">
        <AnimatePresence>
          {top && (
            // Outer: slides out from under the nav. Inner: layout (grows when
            // opened). Separate nodes — layout writes its own transform.
            <motion.div
              key="tab"
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-100%)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0%)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, transform: "translateY(-100%)", transition: { duration: 0.16, ease: EASE } }
              }
              transition={{ duration: 0.24, ease: EASE }}
              className="pointer-events-auto w-[560px] max-w-[calc(100vw-2rem)]"
            >
              <motion.div
                layout={!reduce}
                transition={{ layout: { duration: 0.22, ease: EASE } }}
                style={{ originY: 0 }}
                className="overflow-hidden border border-t-0 border-border bg-popover text-popover-foreground shadow-[0_12px_28px_-16px_rgb(0_0_0/0.3)]"
                {...mouseHover(setHover)}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false)
                }}
                onClick={(e) => {
                  // Tap to open/close — the touch equivalent of hover.
                  if (!(e.target as HTMLElement).closest("button")) setPinned((p) => !p)
                }}
              >
                <BannerRow b={top} phase={phaseOf(top.id)} primary onAction={run} />
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="more"
                      layout={reduce ? false : "position"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.18, ease: EASE, delay: reduce ? 0 : 0.05 }}
                    >
                      {phaseOf(top.id).kind === "active" && top.description && (
                        <p className="px-3 pb-3 pl-7 text-[13px] leading-snug text-muted-foreground">
                          {top.description}
                        </p>
                      )}
                      {list.slice(1).map((b) => (
                        <div key={b.id} className="border-t border-border-subtle">
                          <BannerRow b={b} phase={phaseOf(b.id)} onAction={run} />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {!open && list.length > 1 && (
                    <motion.div
                      key="count"
                      layout={reduce ? false : "position"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.15, ease: EASE }}
                      className="border-t border-border-subtle px-3 py-1 text-center font-medium text-label text-muted-foreground"
                    >
                      +{list.length - 1} more
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function toneOf(b: BannerItem, phase: Phase): Tone {
  return phase.kind === "resolved" ? "resolved" : b.severity
}

function time(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function BannerRow({
  b,
  phase,
  primary = false,
  onAction,
}: {
  b: BannerItem
  phase: Phase
  primary?: boolean
  onAction: (b: BannerItem) => void
}) {
  const tone = toneOf(b, phase)
  const text =
    phase.kind === "pending"
      ? b.action?.pendingLabel ?? "Working…"
      : phase.kind === "resolved"
        ? b.action?.resolvedLabel ?? "Resolved"
        : b.title

  return (
    <motion.div
      layout="position"
      data-slot="banner-row"
      data-tone={tone}
      role={b.severity === "error" && phase.kind === "active" ? "alert" : "status"}
      className="flex min-h-10 cursor-pointer items-center gap-2.5 py-1.5 pr-1.5 pl-3"
    >
      {/* Keyed on phase: "Reconnecting…" → "Back online" crossfades
          instead of teleporting. */}
      <motion.span
        key={`mark-${phase.kind}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: EASE }}
        className="flex shrink-0"
      >
        {phase.kind === "pending" ? (
          <Spinner className="size-3 shrink-0" />
        ) : (
          <span
            aria-hidden
            data-tone={tone}
            className="size-2 shrink-0 data-[tone=error]:bg-destructive-text data-[tone=resolved]:bg-success data-[tone=warning]:bg-warning"
          />
        )}
      </motion.span>
      {/* Plain class string, not cn(): tailwind-merge doesn't know the custom
          `text-label` size and would drop it against the colour classes. */}
      <span
        data-tone={tone}
        className="font-medium text-label whitespace-nowrap data-[tone=error]:text-destructive-text data-[tone=resolved]:text-success-text data-[tone=warning]:text-foreground"
      >
        {b.eyebrow}
      </span>
      <motion.span
        key={`text-${phase.kind}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: EASE }}
        className={cn("min-w-0 flex-1 truncate text-sm", primary && "font-medium")}
      >
        {text}
      </motion.span>
      {phase.kind === "active" && phase.lastTried && (
        <span className="font-medium text-label whitespace-nowrap text-muted-foreground tabular-nums">
          Still failing · tried {time(phase.lastTried)}
        </span>
      )}
      {b.action && phase.kind !== "resolved" && (
        <Button
          size="xs"
          disabled={phase.kind === "pending"}
          aria-busy={phase.kind === "pending"}
          onClick={() => onAction(b)}
        >
          {b.action.label}
        </Button>
      )}
      {b.onDismiss && phase.kind !== "resolved" && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Dismiss ${b.eyebrow} banner`}
          className="text-muted-foreground hover:text-foreground"
          onClick={b.onDismiss}
        >
          <X />
        </Button>
      )}
    </motion.div>
  )
}

export { Banner }
export type { BannerItem, BannerAction, BannerSeverity }
