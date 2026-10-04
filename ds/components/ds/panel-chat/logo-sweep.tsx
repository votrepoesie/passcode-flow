"use client";

import React, { useEffect, useRef } from "react";
import { animate, stagger } from "motion";

/**
 * The product mark, and the same mark as a waiting animation.
 *
 * One geometry serves both, so the idle → waiting swap is the same six shapes
 * starting to move rather than a crossfade between two drawings.
 *
 * `fill: currentColor` — both follow the caller's text color.
 */

/** One full in-hold-out pass, per shape, in seconds. */
const DURATION = 4.4;
/** Gap between consecutive shapes. */
const STAGGER = 0.16;
/** Beat before the sequence restarts. */
const PAUSE = 0.5;

type Ease = "circOut" | "easeInOut" | "linear" | "circIn";

/**
 * The move as one source of truth: position (user units), timing (0-1), and
 * the easing used to get to the NEXT step. Last step has no `ease`.
 */
const TRACK: { x: number; at: number; ease?: Ease }[] = [
  { x: -300, at: 0.0, ease: "circOut" }, // parked off-canvas left, flies in…
  { x: 11, at: 0.24, ease: "easeInOut" }, // …overshoots home
  { x: 0, at: 0.35, ease: "linear" }, // rocks back and settles
  { x: 0, at: 0.63, ease: "easeInOut" }, // holds, then winds back…
  { x: -13, at: 0.72, ease: "circIn" }, // …accelerates out to the right
  { x: 320, at: 1.0 },
];

const KEYFRAMES = TRACK.map((s) => s.x);
const TIMES = TRACK.map((s) => s.at);
const EASES = TRACK.slice(0, -1).map((s) => s.ease ?? "linear");

const PARKED = `translateX(${TRACK[0].x}px)`;

type MarkShape =
  | { d: string }
  | { rect: { x: number; y: number; width: number; height: number; rx: number } };

/**
 * Tiles pre-sorted RIGHT TO LEFT — array order IS stagger order (right-hand
 * tiles lead, bottom bar brings up the rear).
 */
const SHAPES: MarkShape[] = [
  { d: "M251.54 18.97A5 5 0 0 1 256.10 16.00L285.80 16.00A5 5 0 0 1 290.80 21.00L290.80 56.80A5 5 0 0 1 285.80 61.80L240.19 61.80A5 5 0 0 1 235.62 54.77Z" },
  { rect: { x: 232, y: 164, width: 58.8, height: 45.8, rx: 6 } },
  { d: "M218.64 91.97A5 5 0 0 1 223.20 89.00L285.80 89.00A5 5 0 0 1 290.80 94.00L290.80 129.80A5 5 0 0 1 285.80 134.80L207.29 134.80A5 5 0 0 1 202.72 127.77Z" },
  { d: "M132.44 53.97A5 5 0 0 1 137.00 51.00L241.76 51.00A5 5 0 0 1 246.33 58.03L230.42 93.83A5 5 0 0 1 225.85 96.80L121.09 96.80A5 5 0 0 1 116.52 89.77Z" },
  { d: "M75.94 127.97A5 5 0 0 1 80.50 125.00L208.36 125.00A5 5 0 0 1 212.93 132.03L197.02 167.83A5 5 0 0 1 192.45 170.80L64.59 170.80A5 5 0 0 1 60.02 163.77Z" },
  { d: "M20.24 201.97A5 5 0 0 1 24.80 199.00L174.66 199.00A5 5 0 0 1 179.23 206.03L163.32 241.83A5 5 0 0 1 158.75 244.80L8.89 244.80A5 5 0 0 1 4.32 237.77Z" },
];

const Tiles: React.FC<{ parked?: boolean }> = ({ parked = false }) => (
  <>
    {SHAPES.map((shape, i) =>
      "d" in shape ? (
        <path key={i} d={shape.d} style={parked ? { transform: PARKED } : undefined} />
      ) : (
        <rect key={i} {...shape.rect} style={parked ? { transform: PARKED } : undefined} />
      ),
    )}
  </>
);

interface MarkProps {
  className?: string;
}

/** The mark at rest. */
export const LogoMark: React.FC<MarkProps> = ({ className }) => (
  <svg viewBox="0 0 290 230" className={className} fill="currentColor" aria-hidden="true">
    <g transform="translate(-1.2 -15.5)">
      <Tiles />
    </g>
  </svg>
);

/**
 * The mark sweeping — the waiting state.
 *
 * Tiles fly in from off-canvas left and exit right, staggered, on a loop.
 * They leave the viewBox on both sides — the SVG clips them, so the mark
 * assembles and disassembles rather than sliding as a block.
 *
 * `prefers-reduced-motion` falls back to the static mark. The loop has no
 * end state to freeze on, so the honest fallback is to hold still.
 */
export const LogoSweep: React.FC<MarkProps> = ({ className }) => {
  const groupRef = useRef<SVGGElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const group = groupRef.current;
    if (!group || reduced) return;
    const controls = animate(
      Array.from(group.children),
      { x: KEYFRAMES },
      {
        duration: DURATION,
        times: TIMES,
        ease: EASES,
        delay: stagger(STAGGER),
        repeat: Infinity,
        repeatDelay: PAUSE,
      },
    );
    return () => controls.stop();
  }, [reduced]);

  return (
    <svg
      viewBox="0 0 290 230"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="Waiting for a reply"
    >
      <g ref={groupRef} transform="translate(-1.2 -15.5)">
        <Tiles parked={!reduced} />
      </g>
    </svg>
  );
};
