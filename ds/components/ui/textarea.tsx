"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldSlot, splitFieldProps, useFieldControl, type FieldSlotProps } from "@/components/ui/field"

/**
 * Multi-line text field. Pass `label`, `hint`, `error`, `errorAction` or
 * `meta` (e.g. a character count) for the built-in DS label line;
 * without them it's a bare control.
 * `error` is API-agnostic — a plain string: any non-empty string shows it,
 * `undefined` or `""` clears it. Map your API/form library's shape to it.
 */
function Textarea(props: React.ComponentProps<"textarea"> & FieldSlotProps) {
  const [field, control] = splitFieldProps(props)
  // Inside an InputGroup the group is the field — never wrap the inner control.
  if ((control as Record<string, unknown>)["data-slot"] === "input-group-control") {
    return <TextareaControl {...control} />
  }
  return (
    <FieldSlot field={field} id={control.id}>
      <TextareaControl {...control} />
    </FieldSlot>
  )
}

function TextareaControl({ className, ...rest }: React.ComponentProps<"textarea">) {
  // Inside a Field, picks up its id / aria-invalid / aria-describedby.
  const props = useFieldControl(rest)
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-border bg-transparent px-3 py-2 text-base transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/25 md:text-sm dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
