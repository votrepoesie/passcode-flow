import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LENGTH } from "./constants";

// Each cell owns its right divider except the last, which owns its left one,
// so the four cells sit flush at 4 × 84 = 336px (Figma: passkey frame).
// border-0 / rounded-none reset the Input's all-round border and radius.
const edges = [
  "rounded-none rounded-l-[16px]",
  "border-0 border-y border-r rounded-none",
  "border-0 border-y rounded-none",
  "rounded-none rounded-r-[16px]",
];

type PasscodeCellProps = React.ComponentProps<"input"> & {
  index: number;
  /** Code complete: hide the "type here" highlight while keeping focus. */
  ready: boolean;
};

/** One digit cell: the shared Input, restyled as the Figma passkey cell. */
export function PasscodeCell({ index, ready, className, ...props }: PasscodeCellProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete={index === 0 ? "one-time-code" : "off"}
      aria-label={`Digit ${index + 1} of ${LENGTH}`}
      // Overrides the Input's size, radius, padding, type and focus ring with
      // the Figma cell; its invalid styling is kept.
      className={cn(
        // Figma sets digits slightly below/right of centre (and the focused
        // one further left); padding reproduces that offset.
        "relative h-32 w-21 shrink-0 appearance-none border-stroke bg-fill p-0 pt-[4px] pl-[3px] text-center",
        "font-sans text-[36px] leading-[normal] font-medium text-ink caret-transparent md:text-[36px]",
        "selection:bg-transparent selection:text-ink",
        edges[index],
        ready
          ? "focus-visible:border-stroke focus-visible:ring-0"
          : "focus-visible:z-10 focus-visible:rounded-[4px] focus-visible:border-[3px] focus-visible:border-highlight focus-visible:ring-0 focus-visible:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:pt-[2px] focus-visible:pl-0 focus-visible:pr-[3px]",
        "disabled:bg-fill-disabled disabled:text-ink-disabled disabled:opacity-100 disabled:[-webkit-text-fill-color:var(--color-ink-disabled)]",
        // Focus moving between cells is keyboard-driven and must be instant;
        // only greying out on submit eases in.
        "transition-none disabled:transition-[color,background-color,border-color,box-shadow,-webkit-text-fill-color] disabled:duration-200 disabled:ease-[ease]",
        className,
      )}
      {...props}
    />
  );
}
