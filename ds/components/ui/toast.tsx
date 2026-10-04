"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/* ── Store ────────────────────────────────────────────────────────────────
   Module-level, Sonner-shaped: call `toast.*` from anywhere, render one
   <Toaster /> per app. Newest first. */

type ToastKind = "message" | "success" | "error" | "loading"

type ToastAction = { label: string; onClick: () => void }

type ToastItem = {
  id: string
  kind: ToastKind
  title: string
  description?: string
  /** Short mono context label shown in the detail, e.g. "Sync", "Export · 413". */
  eyebrow?: string
  action?: ToastAction
  createdAt: number
}

type ToastInput = Omit<ToastItem, "id" | "kind" | "createdAt"> & {
  /** Reuse an id to update a toast in place (how `promise` resolves). */
  id?: string
}

let items: ToastItem[] = []
const listeners = new Set<() => void>()
let seq = 0

function emit() {
  for (const l of listeners) l()
}

function upsert(kind: ToastKind, input: ToastInput): string {
  const id = input.id ?? `toast-${++seq}`
  const next: ToastItem = { ...input, id, kind, createdAt: Date.now() }
  items = items.some((t) => t.id === id)
    ? items.map((t) => (t.id === id ? next : t))
    : [next, ...items]
  emit()
  return id
}

const toast = {
  message: (input: ToastInput) => upsert("message", input),
  success: (input: ToastInput) => upsert("success", input),
  error: (input: ToastInput) => upsert("error", input),
  loading: (input: ToastInput) => upsert("loading", input),
  /** Shows `loading`, then swaps the same toast to `success` or `error`. */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    msgs: { loading: ToastInput; success: ToastInput; error: ToastInput }
  ) {
    const id = upsert("loading", msgs.loading)
    const p = typeof promise === "function" ? promise() : promise
    p.then(
      () => upsert("success", { ...msgs.success, id }),
      () => upsert("error", { ...msgs.error, id })
    )
    return id
  },
  dismiss(id: string) {
    items = items.filter((t) => t.id !== id)
    emit()
  },
  clear() {
    items = []
    emit()
  },
}

const EMPTY: ToastItem[] = []
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
function useToasts() {
  return React.useSyncExternalStore(subscribe, () => items, () => EMPTY)
}

/* ── Timing ───────────────────────────────────────────────────────────────
   Errors never auto-dismiss: they carry work the user has to act on. */

const DURATION: Record<ToastKind, number | null> = {
  message: 5000,
  success: 5000,
  error: null,
  loading: null,
}

/** Auto-dismiss that pauses while `paused` (hover/focus) or while the tab is
 *  hidden, resuming with the time left rather than a fresh timer. */
function useAutoDismiss(
  duration: number | null,
  paused: boolean,
  onDone: () => void,
  resetKey: unknown
) {
  const remaining = React.useRef(duration ?? 0)
  const done = React.useRef(onDone)
  React.useEffect(() => {
    done.current = onDone
  })

  React.useEffect(() => {
    remaining.current = duration ?? 0
  }, [duration, resetKey])

  React.useEffect(() => {
    if (duration == null || paused) return
    let hidden = document.visibilityState === "hidden"
    let start = Date.now()
    let timer: ReturnType<typeof setTimeout> | undefined
    const run = () => {
      start = Date.now()
      timer = setTimeout(() => done.current(), remaining.current)
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(timer)
        remaining.current -= Date.now() - start
        hidden = true
      } else if (hidden) {
        hidden = false
        run()
      }
    }
    if (!hidden) run()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      clearTimeout(timer)
      if (!hidden) remaining.current -= Date.now() - start
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [duration, paused, resetKey])
}

/* ── Toaster ──────────────────────────────────────────────────────────────
   DS toast: one joined panel, bottom-right, 320px. Each toast is a row
   (status square · title · time · inline action); hovering, focusing or
   tapping a row opens its detail in place. Errors arrive open with their
   actions. The panel sits on the inverse surface (`.ds-inverse`) — dark on
   the light page, light on the dark page — so it never blends into the page.

   Must render inside a `.ds` scope (it reads the theme tokens), so it is
   not portalled. Motion: 240ms strong ease-out in, 140ms out; reduced motion
   keeps the fades and drops the travel. */

const EASE = [0.23, 1, 0.32, 1] as const

/** Hover handlers that ignore touch/pen: a tap fires pointerenter but never a
 *  matching leave, which would pin hover state on forever. */
function mouseHover(set: (v: boolean) => void) {
  return {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && set(true),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && set(false),
  }
}

// Full transform strings, not Motion's x/y shorthands: the shorthands run on
// the main thread and drop frames exactly when toasts fire (the app is busy).
const PANEL_IN = { opacity: 0, transform: "translateY(12px)" }
const PANEL_OUT = { opacity: 0, transform: "translateY(8px)" }
const PANEL_REST = { opacity: 1, transform: "translateY(0px)" }

function Toaster({ max = 5, className }: { max?: number; className?: string }) {
  const toasts = useToasts()
  const [paused, setPaused] = React.useState(false)
  const reduce = useReducedMotion()
  const shown = toasts.slice(0, max)
  const hidden = toasts.length - shown.length

  return (
    <section
      data-slot="toaster"
      aria-label="Notifications"
      aria-live="polite"
      className={cn("ds-inverse fixed right-4 bottom-4 z-50 w-[320px] max-w-[calc(100vw-2rem)]", className)}
      {...mouseHover(setPaused)}
    >
      <AnimatePresence>
        {shown.length > 0 && (
          // Outer: enter/exit transform. Inner: layout (resize as rows come
          // and go). Kept on separate nodes — layout writes its own transform.
          <motion.div
            key="panel"
            initial={reduce ? { opacity: 0 } : PANEL_IN}
            animate={reduce ? { opacity: 1 } : PANEL_REST}
            exit={{ ...(reduce ? { opacity: 0 } : PANEL_OUT), transition: { duration: 0.14, ease: EASE } }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <motion.div
              layout={!reduce}
              transition={{ duration: 0.24, ease: EASE }}
              style={{ originY: 1 }}
              className="overflow-hidden border border-border bg-popover text-popover-foreground shadow-[0_12px_32px_-14px_rgb(0_0_0/0.4)]"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((t, i) => (
                  <motion.div
                    key={t.id}
                    layout={reduce ? false : "position"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className={cn(i > 0 && "border-t border-border-subtle")}
                  >
                    <ToastRow t={t} paused={paused} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {toasts.length > 1 && (
                  <motion.div
                    key="footer"
                    layout={reduce ? false : "position"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="flex items-center justify-between border-t border-border bg-card px-3 py-1.5 font-medium text-label text-muted-foreground"
                  >
                    <span>
                      {toasts.length} notifications{hidden > 0 ? ` · ${hidden} hidden` : ""}
                    </span>
                    <button
                      className="cursor-pointer underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"
                      onClick={toast.clear}
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function time(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function ToastRow({ t, paused }: { t: ToastItem; paused: boolean }) {
  const reduce = useReducedMotion()
  const [hover, setHover] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  // Tap/click pins the row open — the touch equivalent of hover.
  const [pinned, setPinned] = React.useState(false)
  const hold = paused || focused || pinned
  useAutoDismiss(DURATION[t.kind], hold, () => toast.dismiss(t.id), t.kind)

  const isError = t.kind === "error"
  const hasAction = !!t.action && t.kind !== "loading"
  // Errors carry their actions in the detail; everything else keeps its
  // action on the row so a time-limited Undo is never behind a hover.
  const inlineAction = hasAction && !isError
  const hasDetail = !!t.description || (isError && hasAction)
  const open = hasDetail && (isError || hover || focused || pinned)
  const duration = DURATION[t.kind]

  const run = () => {
    t.action!.onClick()
    toast.dismiss(t.id)
  }

  return (
    <div
      data-slot="toast"
      data-kind={t.kind}
      data-paused={hold ? "" : undefined}
      role={isError ? "alert" : "status"}
      className="group/toast relative"
      {...mouseHover(setHover)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false)
      }}
      onClick={(e) => {
        if (hasDetail && !(e.target as HTMLElement).closest("button")) setPinned((p) => !p)
      }}
    >
      <div className={cn("flex min-h-10 items-center gap-2 py-2 pr-1.5 pl-3", hasDetail && "cursor-pointer")}>
        {/* Keyed on kind: a promise resolving crossfades instead of teleporting. */}
        <motion.span
          key={`mark-${t.kind}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="flex shrink-0"
        >
          <StatusMark kind={t.kind} />
        </motion.span>
        <motion.span
          key={`title-${t.kind}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug font-medium"
        >
          {t.title}
        </motion.span>
        {inlineAction && (
          <Button
            size="xs"
            variant="secondary"
            className="border border-border"
            onClick={run}
          >
            {t.action!.label}
          </Button>
        )}
        <span className="font-mono text-label text-muted-foreground tabular-nums">
          {time(t.createdAt)}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss"
          className="text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/toast:opacity-100 hover:text-foreground focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          onClick={() => toast.dismiss(t.id)}
        >
          <X />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { height: 0, opacity: 0, transition: { duration: 0.14, ease: EASE } }
            }
            transition={{ duration: 0.2, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-3 pb-3 pl-7">
              <Eyebrow t={t} />
              {t.description && (
                <p className="text-[13px] leading-snug text-muted-foreground">{t.description}</p>
              )}
              {isError && hasAction && (
                <div className="flex gap-2">
                  <Button size="xs" onClick={run}>
                    {t.action!.label}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => toast.dismiss(t.id)}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hairline: time remaining (pauses with the row), or working. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
        {duration != null && (
          <div
            key={t.kind}
            className="h-full origin-left bg-foreground/25 [animation:ds-toast-countdown_var(--toast-duration)_linear_forwards] group-data-paused/toast:[animation-play-state:paused]"
            style={{ ["--toast-duration" as string]: `${duration}ms` }}
          />
        )}
        {t.kind === "loading" && (
          <div className="h-full w-2/5 bg-foreground/40 motion-safe:[animation:ds-toast-working_1.1s_var(--ds-ease-in-out)_infinite] motion-reduce:w-full motion-reduce:opacity-50" />
        )}
      </div>
    </div>
  )
}

function Eyebrow({ t }: { t: ToastItem }) {
  const isError = t.kind === "error"
  const label = isError ? "Error" : t.kind === "loading" ? "Working" : t.eyebrow
  if (!label) return null
  return (
    // Plain string, not cn(): tailwind-merge doesn't know the custom `text-label`
    // size and would drop it as a conflict with the `text-*` colour.
    <span
      className={`font-medium text-label ${
        isError ? "text-destructive-text" : "text-muted-foreground"
      }`}
    >
      {label}
      {t.eyebrow && (isError || t.kind === "loading") ? ` · ${t.eyebrow}` : ""}
    </span>
  )
}

function StatusMark({ kind }: { kind: ToastKind }) {
  if (kind === "loading") return <Spinner className="size-3 shrink-0 text-muted-foreground" />
  // Small status squares — no side-stripes.
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0",
        kind === "error" && "bg-destructive-text",
        kind === "success" && "bg-success",
        kind === "message" && "bg-foreground/40"
      )}
    />
  )
}

export { Toaster, toast, useToasts }
export type { ToastItem, ToastInput, ToastKind, ToastAction }
