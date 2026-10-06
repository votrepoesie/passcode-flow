"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useAnimate, useReducedMotion } from "motion/react";

// The Figma check icon, drawn on arrival. The same SVG is layered twice: one
// copy clipped to the box outline, one to the inside, where the check is.
// The split runs at 7px/25px, in the empty gap between box (4–6, 26–28) and
// check (10–22), so no clip edge touches painted pixels.
// The check only ever travels rightwards, so a left-to-right wipe of its
// layer draws it like a pen stroke at constant speed.
const CHECK_HIDDEN = "inset(7px 22.5px 7px 7px)"; // check (and its AA edge) starts at x≈10
const CHECK_DRAWN = "inset(7px 7px 7px 7px)";

export function CheckIcon() {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const sequence = animate([
      // Box pops in; small elements need more bounce to read as bouncy.
      [scope.current, { transform: ["scale(0.4)", "scale(1)"] }, { type: "spring", duration: 0.5, bounce: 0.5 }],
      // Check draws in while the pop settles.
      [
        "[data-part=check]",
        { clipPath: [CHECK_HIDDEN, CHECK_DRAWN] },
        { at: 0.18, duration: 0.4, ease: [0.45, 0, 0.2, 1] },
      ],
      // Small thump as the stroke lands.
      [
        scope.current,
        { transform: ["scale(1)", "scale(1.12)", "scale(1)"] },
        { at: 0.58, duration: 0.3, ease: ["easeOut", "easeInOut"] },
      ],
    ]);
    sequence.then(() =>
      // Leave no transform behind so the icon rasterises like the static one
      // (next frame: motion commits its final value after resolving).
      requestAnimationFrame(() => {
        if (scope.current) scope.current.style.transform = "none";
      }),
    );
    return () => sequence.stop();
  }, [animate, reduce, scope]);

  const layer = { src: "/check.svg", width: 32, height: 32, loading: "eager" } as const;

  return (
    <span
      ref={scope}
      aria-hidden
      className="relative size-8 shrink-0"
      style={reduce ? undefined : { transform: "scale(0.4)" }}
    >
      <Image
        {...layer}
        alt=""
        className="absolute inset-0 size-8 [clip-path:path(evenodd,'M0_0H32V32H0ZM7_7V25H25V7Z')]"
      />
      <Image
        {...layer}
        alt=""
        data-part="check"
        className="absolute inset-0 size-8"
        style={{ clipPath: reduce ? CHECK_DRAWN : CHECK_HIDDEN }}
      />
    </span>
  );
}
