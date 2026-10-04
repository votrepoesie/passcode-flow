"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    // Inline (no Portal) so the theme tokens resolve inside the `.ds` scope
    // and theme correctly in dark mode.
    // Motion: the same grow-from-trigger the menus use — a tooltip is a small
    // popover and shouldn't have a dialect of its own. `delayDuration` is 0,
    // so this fires on every hover; if a toolbar sweep ever feels busy, the
    // fix is a shorter duration token, not a longer delay.
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        // DS UI: inverted (foreground-filled) tooltip, text-xs label.
        "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-foreground px-2.5 py-1.5 font-medium text-xs text-balance text-background motion-safe:data-[state=open]:animate-menu-in motion-safe:data-[state=closed]:animate-menu-out motion-reduce:data-[state=open]:animate-menu-in-reduced motion-reduce:data-[state=closed]:animate-menu-out-reduced",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
    </TooltipPrimitive.Content>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
