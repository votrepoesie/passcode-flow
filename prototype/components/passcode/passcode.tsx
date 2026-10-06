"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckIcon } from "./check-icon";
import { COPY } from "./constants";
import { FocusRing } from "./focus-ring";
import { EASE_EXIT, EASE_OUT, useFade } from "./motion";
import { PasscodeCell } from "./passcode-cell";
import { StatusSlot } from "./status-slot";
import { usePasscode } from "./use-passcode";

export function Passcode() {
  const id = useId();
  const { reduce, hidden, settled } = useFade();
  const { digits, status, error, notice, shakeKey, ready, enterPresses, complete, ringAt, cell } = usePasscode();
  const verifying = status === "verifying";

  // Passcode → Authenticated is seen once per session, so it gets a little
  // more motion; the passcode steps out quickly before the result arrives.
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "authenticated" ? (
        <motion.div
          key="authenticated"
          role="status"
          className="flex items-center justify-center gap-2"
          initial={hidden("scale(0.95)")}
          animate={settled("scale(1)")}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          <CheckIcon />
          <p className="text-[24px] leading-[normal] whitespace-nowrap text-ink">Authenticated</p>
        </motion.div>
      ) : (
        <motion.div
          key="passcode"
          // Explicit from→to keyframes: the group's resting transform is
          // `none`, which motion can't interpolate from.
          exit={{
            opacity: 0,
            ...(reduce ? {} : { transform: ["scale(1)", "scale(0.98)"], filter: ["blur(0px)", "blur(2px)"] }),
            transition: { duration: 0.15, ease: EASE_EXIT },
          }}
        >
          {/* Field always renders its 20px label row + 8px gap above the
              control; mb-7 balances it so the cells stay centred as in Figma. */}
          <Field
            id={`${id}-0`}
            label={<span className="sr-only">Passcode</span>}
            error={error ? COPY.wrongCode : undefined}
            hint={notice ?? undefined}
            className="mb-7"
          >
            {/* Figma's Verifying frame sits 1px higher than the other states. */}
            <div className={cn("relative", verifying && "-translate-y-px")}>
              <StatusSlot verifying={verifying} complete={complete} enterPresses={enterPresses} />
              <div
                key={shakeKey}
                role="group"
                aria-label="Passcode"
                className={cn("relative flex items-center", shakeKey > 0 && "animate-shake motion-reduce:animate-none")}
              >
                {digits.map((digit, index) => (
                  <PasscodeCell
                    key={index}
                    ref={(el) => cell.registerCell(index, el)}
                    id={`${id}-${index}`}
                    index={index}
                    value={digit}
                    ready={ready}
                    disabled={verifying}
                    onKeyDown={(e) => cell.onKeyDown(index, e)}
                    onChange={(e) => cell.onChange(index, e)}
                    onPaste={(e) => cell.onPaste(index, e)}
                    onFocus={(e) => cell.onFocus(index, e)}
                    onBlur={cell.onBlur}
                    onPointerDown={cell.onPointerDown}
                  />
                ))}
                <FocusRing index={ringAt} />
              </div>
            </div>
          </Field>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
