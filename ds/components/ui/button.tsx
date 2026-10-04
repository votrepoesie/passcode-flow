"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // DS UI: radius-md corners, no shadow, Geist (inherited).
  // Motion: one transition covering both the press scale and the hover colour —
  // two `transition-*` utilities on one element silently cancel each other out.
  // 150ms strong ease-out (press feedback band); `link` is text, so it doesn't press.
  // The scale is gated with `motion-safe` rather than overridden by `motion-reduce`:
  // the `:not()` in `not-data-*` outranks a plain override, so it would never apply.
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer motion-safe:not-data-[variant=link]:active:scale-97 transition-[transform,scale,color,background-color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  {
    variants: {
      variant: {
        // Primary = solid near-black (neutral-900), light text (DESIGN-SYSTEM.md).
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
        // Brand-colour CTA — the one loud action; use sparingly.
        cta: "bg-cta text-cta-foreground hover:bg-cta/85",
        // Quiet surface button — ranks below primary.
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        // Bordered quiet button — shadcn's `outline` (Pagination, AlertDialog cancel).
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-auto px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  icon,
  iconPosition = "start",
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Optional lucide (or any) icon rendered inline with the label. Sized and
     * spaced by the button's own [&_svg] rules — pass the element, e.g.
     * `icon={<Play />}`. Ignored when `asChild` (Slot requires a single child). */
    icon?: React.ReactNode
    /** Which side of the label the icon sits on. Defaults to leading. */
    iconPosition?: "start" | "end"
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? children : (
        <>
          {icon && iconPosition === "start" ? icon : null}
          {children}
          {icon && iconPosition === "end" ? icon : null}
        </>
      )}
    </Comp>
  )
}

/**
 * CopyButton — the one canonical "copy to clipboard" control. A ghost icon
 * button that swaps its glyph to a check for `timeout` ms after a successful
 * copy. Use everywhere copy affordances appear (code blocks, diagrams, mockups,
 * fields) so the icon, sizing, and hover read the same across the system.
 */
function CopyButton({
  value,
  timeout = 2000,
  variant = "ghost",
  size = "icon-sm",
  onCopy,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Text written to the clipboard. */
  value: string
  /** How long the check stays before reverting to the copy glyph (ms). */
  timeout?: number
  /** Fired after a successful copy. */
  onCopy?: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.()
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), timeout)
    } catch {
      // Clipboard unavailable (insecure context / denied) — no-op.
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={copied ? "Copied" : ariaLabel ?? "Copy"}
      data-copied={copied || undefined}
      onClick={handleClick}
      {...props}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

export { Button, buttonVariants, CopyButton }
