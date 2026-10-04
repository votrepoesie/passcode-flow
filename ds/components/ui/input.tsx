"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldSlot, splitFieldProps, useFieldControl, type FieldSlotProps } from "@/components/ui/field"

/**
 * Text input. Error handling is built in: pass `label`, `hint`, `error`,
 * `errorAction` or `meta` and it renders the DS label line (the error
 * takes the hint's place, the label turns red, nothing below moves) — fully
 * wired for a11y. Without them it's a bare control.
 * `error` is API-agnostic — a plain string: any non-empty string shows it,
 * `undefined` or `""` clears it. Map your API/form library's shape to it.
 */
function Input(props: React.ComponentProps<"input"> & FieldSlotProps) {
  const [field, control] = splitFieldProps(props)
  // Inside an InputGroup the group is the field — never wrap the inner control.
  if ((control as Record<string, unknown>)["data-slot"] === "input-group-control") {
    return <InputControl {...control} />
  }
  return (
    <FieldSlot field={field} id={control.id}>
      <InputControl {...control} />
    </FieldSlot>
  )
}

function InputControl({ className, type, ...rest }: React.ComponentProps<"input">) {
  // Inside a Field, picks up its id / aria-invalid / aria-describedby.
  const props = useFieldControl(rest)
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // DS UI: rounded-md, flat (no shadow), visible field edge.
        // border-color rides along so the focus border and its ring land
        // together — without it the border snaps while the ring fades.
        "h-auto w-full min-w-0 rounded-md border border-border bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow,border-color] outline-none selection:bg-secondary selection:text-secondary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // Invalid: --destructive-text (lifted in dark mode), not the fill red.
        "aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/25",
        className
      )}
      {...props}
    />
  )
}

export { Input }
