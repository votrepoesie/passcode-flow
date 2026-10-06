"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "./motion";

const CELL_WIDTH = 84;

/**
 * The green "type here" box, drawn once over the row and slid to the focused
 * cell, so moving between cells reads as one box travelling sideways.
 * It jumps (no slide) when it reappears, so it never sweeps in from wherever
 * it was last, and it fades when no cell should show it.
 */
export function FocusRing({ index }: { index: number | null }) {
  const reduce = useReducedMotion();
  // Derived from the previous render: slide only between two visible cells.
  const [track, setTrack] = useState({ index, at: index ?? 0, slide: false });
  if (index !== track.index) {
    setTrack({ index, at: index ?? track.at, slide: track.index !== null && index !== null });
  }

  return (
    <motion.div
      aria-hidden
      data-slot="focus-ring"
      className="pointer-events-none absolute top-0 left-0 z-10 h-32 w-21 rounded-[4px] border-[3px] border-highlight shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      initial={false}
      animate={{ opacity: index === null ? 0 : 1, transform: `translateX(${track.at * CELL_WIDTH}px)` }}
      transition={{
        // Short and interruptible: fast typing redirects it mid-slide.
        transform: track.slide && !reduce ? { duration: 0.15, ease: EASE_OUT } : { duration: 0 },
        opacity: { duration: index === null ? 0.1 : 0 },
      }}
    />
  );
}
