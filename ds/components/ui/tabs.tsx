"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * The active value, so a trigger can tell whether it should host the shared
 * indicator. Radix only exposes selection as a data attribute, which React
 * can't render against, so Tabs mirrors it here.
 */
type TabsContextValue = {
  value: string | undefined
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

/**
 * One indicator per list: every trigger renders it under the same `layoutId`,
 * so Motion animates the single element from the old tab's box to the new one
 * instead of snapping a background off one trigger and onto another.
 */
type TabsListContextValue = {
  variant: "default" | "line"
  layoutId: string
}

const TabsListContext = React.createContext<TabsListContextValue | null>(null)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  // Mirror of Radix's internal selection — tracked for both the controlled and
  // uncontrolled cases so the indicator always knows where to sit.
  const [selected, setSelected] = React.useState(defaultValue)
  const active = value ?? selected

  const handleValueChange = React.useCallback(
    (next: string) => {
      setSelected(next)
      onValueChange?.(next)
    },
    [onValueChange]
  )

  const context = React.useMemo(
    () => ({ value: active, orientation }),
    [active, orientation]
  )

  return (
    <TabsContext.Provider value={context}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        // Surface track (lighter gray) — matches the segmented filter control.
        default: "bg-card",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const layoutId = React.useId()
  const context = React.useMemo(
    () => ({ variant: variant ?? "default", layoutId }),
    [variant, layoutId]
  )

  return (
    <TabsListContext.Provider value={context}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsListContext.Provider>
  )
}

function TabsTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const tabs = React.useContext(TabsContext)
  const list = React.useContext(TabsListContext)
  const reduceMotion = useReducedMotion()

  // Only the pairing of our own Tabs + TabsList can host the shared indicator;
  // anything else falls back to the CSS active state below.
  const animated = tabs !== null && list !== null
  const isActive = animated && tabs.value === value

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        // DS UI: medium-weight label (text-xs), rounded, flat — no shadow.
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 rounded-md border border-transparent px-2.5 py-0.5 font-medium text-xs whitespace-nowrap text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        // Active label colour. The entering label is delayed a touch on the
        // segmented variant so the light text lands with the sliding fill, not
        // ahead of it — that text and the card track are near the same token,
        // so an early swap is literally invisible. Scoped to `data-[state=active]`
        // precisely because the leaving label must NOT be delayed, or it
        // disappears for 75ms while the fill slides away.
        "data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:text-primary-foreground",
        animated
          ? "group-data-[variant=default]/tabs-list:data-[state=active]:delay-75"
          : // Fallback when the indicator can't be shared: the original snap.
            "group-data-[variant=default]/tabs-list:data-[state=active]:bg-primary after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          aria-hidden
          layoutId={list.layoutId}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 42, mass: 0.8 }
          }
          className={cn(
            "absolute z-0",
            list.variant === "default"
              ? // Segmented: solid primary fill behind the label.
                "inset-0 rounded-md bg-primary"
              : // Line: 2px rule that slides along the list's edge.
                cn(
                  "bg-foreground",
                  tabs.orientation === "horizontal"
                    ? "inset-x-0 bottom-[-5px] h-0.5"
                    : "inset-y-0 -right-1 w-0.5"
                )
          )}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
