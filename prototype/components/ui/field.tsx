"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/* ── Field ────────────────────────────────────────────────────────────────
   Label + control + inline error, DS's "label line" layout: the error
   message lives IN the label row, right-aligned, taking the hint's place
   (the hint returns once the value is fixed), and the label turns red. Nothing
   below the control ever moves — the form's rhythm is identical with zero
   errors or six.

   This is standard on the primitives, not a special wrapper: pass `label`,
   `hint`, `error`, `errorAction` or `meta` straight to Input, Textarea,
   SelectTrigger or Search and they render this layout themselves (via
   <FieldSlot>). Without those props they stay bare controls — for input
   groups, table cells, filter bars. Use <Field> directly only to wrap a
   custom control; the primitives inside it read its context for `id`,
   `aria-invalid` and `aria-describedby`.

   Pass `error` only once it should show (after blur or submit), and clear it
   as soon as the value is valid.

   Copy: say what's wrong and how to fix it, short enough for one line in the
   column — a message that wraps grows the label row (the one case where
   something moves). Error vs empty: "no results" is not an error — don't pass
   it as `error`. */

type FieldContextValue = {
  id: string
  invalid: boolean
  describedBy?: string
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

type ControlA11yProps = {
  id?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "aria-describedby"?: string
}

/** For controls: merge the enclosing Field's id / invalid / describedby into
 *  the control's own props. Explicit props win; describedby ids combine. */
function useFieldControl<P extends ControlA11yProps>(props: P): P {
  const field = React.useContext(FieldContext)
  if (!field) return props
  const describedBy = [field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ")
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "aria-describedby": describedBy || undefined,
  }
}

const EASE = [0.23, 1, 0.32, 1] as const
// Exits fade on the standard CSS `ease`: the strong ease-out drops opacity to
// ~25% in the first 20ms, which reads as a blink rather than a fade.
const EASE_EXIT = [0.25, 0.1, 0.25, 1] as const

function Field({
  label,
  hint,
  error,
  errorAction,
  meta,
  id,
  className,
  children,
}: {
  /** Optional — an unlabelled control still gets the (empty) row, so its
   *  error has somewhere to appear without shifting the layout. */
  label?: React.ReactNode
  /** Format hint shown in the label row until an error takes its place. */
  hint?: React.ReactNode
  /** The message, once it should be visible. Say what's wrong and how to fix it. */
  error?: string
  /** An inline action after the message, e.g. a Retry link for a failed search.
   *  If the action clears the error while it has focus, focus returns to the
   *  control instead of falling to <body>. */
  errorAction?: React.ReactNode
  /** Always-visible trailing meta, e.g. a character count. */
  meta?: React.ReactNode
  id?: string
  className?: string
  children: React.ReactNode
}) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const reduce = useReducedMotion()
  const invalid = !!error
  const describedBy = invalid ? errorId : hint ? hintId : undefined

  // An errorAction (Retry) that clears the error — or swaps itself out for a
  // "Retrying…" state — would unmount while focused and drop focus to <body>.
  // Track focus inside the message; when the error clears or the focused
  // action is gone, hand focus back to the control.
  const messageRef = React.useRef<HTMLParagraphElement>(null)
  const actionFocused = React.useRef(false)
  React.useEffect(() => {
    if (!actionFocused.current) return
    const stillInside = messageRef.current?.contains(document.activeElement)
    if (!invalid || !stillInside) {
      actionFocused.current = false
      document.getElementById(fieldId)?.focus()
    }
  }, [invalid, errorAction, fieldId])

  return (
    <FieldContext.Provider value={{ id: fieldId, invalid, describedBy }}>
      <div
        data-slot="field"
        data-invalid={invalid ? "" : undefined}
        className={cn("flex flex-col gap-2", className)}
      >
        {/* The label row is always rendered — even with no label — so an
            error appearing or clearing never shifts the control below it. */}
        <div className="flex min-h-5 items-baseline justify-between gap-4">
          {label != null ? (
            <label
              htmlFor={fieldId}
              data-invalid={invalid ? "" : undefined}
              // Colour change: the default ease at 150ms, the same curve and
              // length as the control's border, so label and edge turn red together.
              className="shrink-0 text-sm font-medium transition-colors duration-150 data-invalid:text-destructive-text"
            >
              {label}
            </label>
          ) : (
            <span />
          )}
          {/* Polite live region: a message raised on blur is announced without
              stealing focus; the always-present wrapper keeps the region stable. */}
          <div aria-live="polite" className="flex min-w-0 items-baseline justify-end gap-3">
            {/* Error and hint share ONE grid cell and cross-fade in place.
                (popLayout pinned the leaving message absolutely; with nothing
                replacing it the row collapsed and the message jumped its own
                width sideways while fading.) */}
            <div className="grid min-w-0 justify-items-end *:[grid-area:1/1]">
              <AnimatePresence initial={false}>
                {invalid ? (
                  // Keyed on presence, not on the text: a message that updates
                  // while typing ("61 characters now") changes in place instead
                  // of re-animating on every keystroke.
                  <motion.p
                    key="error"
                    ref={messageRef}
                    id={errorId}
                    data-slot="field-error"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(3px)" }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" }}
                    // Leaves the way it came in (back down 3px), a touch quicker.
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0.15, ease: EASE_EXIT } }
                        : { opacity: 0, transform: "translateY(3px)", transition: { duration: 0.15, ease: EASE_EXIT } }
                    }
                    transition={{ duration: 0.16, ease: EASE }}
                    onFocus={() => (actionFocused.current = true)}
                    onBlur={() => (actionFocused.current = false)}
                    // Inline flow (not flex) so the mark stays attached to the first
                    // word when a long message wraps right-aligned.
                    className="text-right text-xs leading-snug text-destructive-text"
                  >
                    <span aria-hidden className="mr-1.5 inline-block size-1.5 -translate-y-px bg-destructive-text" />
                    {error}
                    {errorAction}
                  </motion.p>
                ) : hint ? (
                  <motion.span
                    key="hint"
                    id={hintId}
                    data-slot="field-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_EXIT } }}
                    transition={{ duration: 0.16, ease: EASE }}
                    className="font-medium text-label text-muted-foreground"
                  >
                    {hint}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            {meta}
          </div>
        </div>
        {children}
      </div>
    </FieldContext.Provider>
  )
}

/* ── FieldSlot — how the primitives make this standard ──────────────────── */

/** The field props every DS control accepts. */
type FieldSlotProps = {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  errorAction?: React.ReactNode
  meta?: React.ReactNode
  /** className for the wrapping field (the control keeps `className`). */
  fieldClassName?: string
}

/** Split a primitive's props into field props and the control's own props.
 *  `wanted` is decided by which props are PASSED, not by their current value:
 *  `error={bad ? msg : undefined}` must keep the wrapper mounted when the error
 *  clears — swapping wrapper-on/off would remount the control and drop focus
 *  mid-typing. */
function splitFieldProps<P extends FieldSlotProps>(props: P) {
  const { label, hint, error, errorAction, meta, fieldClassName, ...control } = props
  const wanted = ["label", "hint", "error", "errorAction", "meta"].some((k) => k in props)
  return [{ label, hint, error, errorAction, meta, fieldClassName, wanted }, control] as const
}

/** Wraps a control in <Field> when field props were passed and it isn't
 *  already inside one. Otherwise renders the bare control untouched. */
function FieldSlot({
  field,
  id,
  children,
}: {
  field: FieldSlotProps & { wanted: boolean }
  id?: string
  children: React.ReactNode
}) {
  const parent = React.useContext(FieldContext)
  const { fieldClassName, wanted, ...rest } = field
  if (!wanted || parent) return <>{children}</>
  return (
    <Field {...rest} id={id} className={fieldClassName}>
      {children}
    </Field>
  )
}

/** Styled inline action for `errorAction` — e.g. "Retry" on a failed search. */
function FieldErrorAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "ml-1 cursor-pointer font-medium text-destructive-text underline decoration-current/40 underline-offset-[3px] outline-none transition-[text-decoration-color] duration-150 hover:decoration-current focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

export { Field, FieldErrorAction, FieldSlot, splitFieldProps, useFieldControl }
export type { FieldSlotProps }
