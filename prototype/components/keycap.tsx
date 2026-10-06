"use client";

import { useEffect, useRef } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Inline keycap, e.g. "Press [Enter ↵] to verify". Dips briefly each time
 * `presses` changes, so the on-screen key mirrors the physical one.
 */
export function Keycap({ presses, className }: { presses: number; className?: string }) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduce = useReducedMotion();
  const initial = useRef(presses);

  useEffect(() => {
    if (reduce || presses === initial.current || !scope.current) return;
    animate(
      scope.current,
      { transform: ["translateY(1px) scale(0.96)", "translateY(0px) scale(1)"] },
      { duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] },
    );
  }, [presses, reduce, animate, scope]);

  return (
    <kbd
      ref={scope}
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] border border-stroke bg-fill px-1.5 font-sans font-medium text-ink shadow-[0_1px_0_0_var(--color-stroke)]",
        className,
      )}
    >
      Enter <span aria-hidden>↵</span>
    </kbd>
  );
}
