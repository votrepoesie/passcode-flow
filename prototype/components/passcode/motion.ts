import { useReducedMotion } from "motion/react";

// Same curves as the Field's message, so every part of the flow moves alike.
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_EXIT = [0.25, 0.1, 0.25, 1] as const;

/**
 * Enter/settle targets shared by the flow's elements. Reduced motion keeps
 * the fade and drops movement, scale and blur. `settled(to)` takes the
 * transform's identity so motion can interpolate toward it, then clears
 * transform and filter so text rasterises as crisply as static text.
 */
export function useFade() {
  const reduce = useReducedMotion() ?? false;
  const hidden = (from: string) => (reduce ? { opacity: 0 } : { opacity: 0, transform: from, filter: "blur(2px)" });
  const settled = (to: string) => ({
    opacity: 1,
    ...(reduce ? {} : { transform: to, filter: "blur(0px)" }),
    transitionEnd: { transform: "none", filter: "none" },
  });
  return { reduce, hidden, settled };
}
