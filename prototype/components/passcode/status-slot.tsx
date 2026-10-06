"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Keycap } from "./keycap";
import { EASE_EXIT, EASE_OUT, useFade } from "./motion";

type StatusSlotProps = {
  verifying: boolean;
  /** All digits in and idle: time to ask for Enter. */
  complete: boolean;
  enterPresses: number;
};

/**
 * The line above the cells. One slot for the whole story: once the code is
 * complete it asks for Enter, and on Enter the prompt turns into
 * "Verifying...". Both stack in one grid cell so they crossfade in place.
 */
export function StatusSlot({ verifying, complete, enterPresses }: StatusSlotProps) {
  const { reduce, hidden, settled } = useFade();

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute bottom-full left-1/2 mb-4 flex h-8 -translate-x-1/2 items-center justify-center whitespace-nowrap"
    >
      <div className="grid place-items-center *:[grid-area:1/1]">
        <AnimatePresence>
          {verifying ? (
            <motion.div
              key="verifying"
              className="flex items-center gap-2"
              initial={hidden("translateY(4px)")}
              animate={settled("translateY(0px)")}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_EXIT } }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <Image
                src="/spinner.svg"
                alt=""
                width={32}
                height={32}
                loading="eager"
                className="size-8 shrink-0 animate-spin [animation-duration:1.2s] motion-reduce:animate-none"
              />
              <p className="text-[24px] leading-[normal] text-ink">Verifying...</p>
            </motion.div>
          ) : complete ? (
            <motion.p
              key="prompt"
              className="flex items-center gap-2 text-[20px] leading-[normal] text-ink-disabled"
              initial={hidden("translateY(4px)")}
              animate={settled("translateY(0px)")}
              // Held back 250ms so typing 1234⏎ in one go never flashes it;
              // leaves upward as "Verifying..." rises into its place.
              transition={{ duration: 0.2, ease: EASE_OUT, delay: 0.25 }}
              exit={{
                opacity: 0,
                ...(reduce ? {} : { transform: "translateY(-4px)", filter: "blur(2px)" }),
                transition: { duration: 0.15, ease: EASE_EXIT },
              }}
            >
              Press <Keycap presses={enterPresses} className="h-7 text-[16px]" /> to verify
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
