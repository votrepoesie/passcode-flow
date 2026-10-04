"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FieldSlot, splitFieldProps, useFieldControl, type FieldSlotProps } from "@/components/ui/field"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}

/**
 * The visible select field. Error handling is built in here (the Radix root
 * renders nothing of its own): pass `label`, `hint`, `error`, `errorAction`
 * or `meta` for the DS label line; without them it's a bare trigger.
 * `error` is API-agnostic — a plain string: any non-empty string shows it,
 * `undefined` or `""` clears it. Map your API/form library's shape to it.
 */
function SelectTrigger(props: SelectTriggerProps & FieldSlotProps) {
  const [field, control] = splitFieldProps(props)
  return (
    <FieldSlot field={field} id={control.id}>
      <SelectTriggerControl {...control} />
    </FieldSlot>
  )
}

function SelectTriggerControl({ className, size = "default", children, ...rest }: SelectTriggerProps) {
  // Inside a Field, picks up its id / aria-invalid / aria-describedby.
  const props = useFieldControl(rest)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow,border-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/25 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    // Rendered inline (no Portal) so it stays inside the `.ds` token scope,
    // matching DropdownMenuContent — `.ds` lives on a page wrapper, not on
    // <body>, so a portaled panel loses --popover/--border and its surface.
    <>
      {/* Motion: the same menu keyframes the dropdown and tooltip use — scales
          out of the trigger over 160ms, dismisses in 120ms. Keyframes rather
          than transitions because Radix's Presence unmounts the content on
          `animationend` and never listens for `transitionend`.

          `origin-(--radix-select-content-transform-origin)` only resolves under
          `position="popper"`; item-aligned positioning doesn't run Popper, so
          the var is unset and the origin falls back to centre — which is the
          right read there anyway, since that mode lays the panel *over* the
          trigger rather than anchoring to one of its edges. */}
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md motion-safe:data-[state=open]:animate-menu-in motion-safe:data-[state=closed]:animate-menu-out motion-reduce:data-[state=open]:animate-menu-in-reduced motion-reduce:data-[state=closed]:animate-menu-out-reduced",
          className
        )}
        position={position}
        align={align}
        // The gap from the trigger is a real Popper offset rather than the
        // `data-[side=*]:translate-*` nudge shadcn ships, so collision
        // detection accounts for it and flipped sides stay symmetrical.
        // Ignored under item-aligned positioning, which overlays the trigger.
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
