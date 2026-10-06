"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LENGTH = 4;
const PASSCODE = "1234";
const VERIFY_MS = 1500;
const NOTICE_MS = 2000;

// Same curves as the Field's message, so every part of the flow moves alike.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_EXIT = [0.25, 0.1, 0.25, 1] as const;

type Status = "idle" | "verifying" | "authenticated";

const empty = () => Array<string>(LENGTH).fill("");

// Each cell owns its right divider except the last, which owns its left one,
// so the four cells sit flush at 4 × 84 = 336px (Figma: passkey frame).
// border-0 / rounded-none reset the Input's all-round border and radius.
const cellEdges = [
  "rounded-none rounded-l-[16px]",
  "border-0 border-y border-r rounded-none",
  "border-0 border-y rounded-none",
  "rounded-none rounded-r-[16px]",
];

export function Passcode() {
  const id = useId();
  const reduce = useReducedMotion();
  const [digits, setDigits] = useState<string[]>(empty);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [numbersOnly, setNumbersOnly] = useState(false);
  const noticeTimer = useRef<number | undefined>(undefined);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  // Mirrors `digits` so key-repeat events never read a stale render.
  const digitsRef = useRef(digits);
  // Focus requested while inputs are disabled; applied after the next render.
  const pendingFocus = useRef<number | null>(null);

  // Brief "numbers only" hint after a non-numeric key; a digit hides it.
  const showNumbersOnly = () => {
    setError(false);
    setNumbersOnly(true);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNumbersOnly(false), NOTICE_MS);
  };
  const hideNumbersOnly = () => {
    window.clearTimeout(noticeTimer.current);
    setNumbersOnly(false);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const commit = (next: string[]) => {
    digitsRef.current = next;
    setDigits(next);
  };

  const setDigit = (index: number, value: string) => {
    const next = [...digitsRef.current];
    next[index] = value;
    commit(next);
  };

  const focus = (index: number) => {
    const clamped = Math.max(0, Math.min(LENGTH - 1, index));
    inputs.current[clamped]?.focus();
  };

  useEffect(() => {
    if (status === "idle" && pendingFocus.current !== null) {
      focus(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [status]);

  const submit = () => {
    if (status !== "idle") return;
    const firstEmpty = digitsRef.current.findIndex((d) => d === "");
    if (firstEmpty !== -1) {
      focus(firstEmpty);
      return;
    }

    (document.activeElement as HTMLElement | null)?.blur();
    setError(false);
    setStatus("verifying");

    const code = digitsRef.current.join("");
    window.setTimeout(() => {
      if (code === PASSCODE) {
        setStatus("authenticated");
        return;
      }
      commit(empty());
      setError(true);
      setShakeKey((k) => k + 1);
      pendingFocus.current = 0;
      setStatus("idle");
    }, VERIFY_MS);
  };

  const isComplete = () => digitsRef.current.every((d) => d !== "");

  // Filling the last empty cell submits right away; Enter remains available.
  const enter = (index: number, digit: string) => {
    setError(false);
    hideNumbersOnly();
    setDigit(index, digit);
    if (isComplete()) submit();
    else if (index < LENGTH - 1) focus(index + 1);
  };

  // Typing a digit with nothing focused starts at the first empty cell.
  useEffect(() => {
    if (status !== "idle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (inputs.current.includes(e.target as HTMLInputElement)) return;
      if (!/^[0-9]$/.test(e.key)) return;
      e.preventDefault();
      const firstEmpty = digitsRef.current.findIndex((d) => d === "");
      enter(firstEmpty === -1 ? LENGTH - 1 : firstEmpty, e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        submit();
        return;
      case "Backspace":
      case "Delete": {
        e.preventDefault();
        setError(false);
        if (digitsRef.current[index]) {
          setDigit(index, "");
        } else if (index > 0) {
          focus(index - 1);
          // Holding the key keeps clearing backwards, one cell per repeat.
          if (e.repeat) setDigit(index - 1, "");
        }
        return;
      }
      case "ArrowLeft":
        e.preventDefault();
        focus(index - 1);
        return;
      case "ArrowRight":
        e.preventDefault();
        focus(index + 1);
        return;
      case "Home":
        e.preventDefault();
        focus(0);
        return;
      case "End":
        e.preventDefault();
        focus(LENGTH - 1);
        return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    // Handle digits here rather than in onChange so retyping the same digit
    // still advances; block every other printable key.
    e.preventDefault();
    if (/^[0-9]$/.test(e.key)) enter(index, e.key);
    else showNumbersOnly();
  };

  // Fallback for soft keyboards (e.g. Android) that report keydown as
  // "Unidentified". The cell's contents are selected on focus, so a new digit
  // normally replaces it; otherwise take the digit left of the caret.
  const onChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      if (e.target.value) showNumbersOnly();
      return;
    }
    const caret = e.target.selectionStart ?? value.length;
    const digit = value.length === 1 ? value : (value[Math.max(0, caret - 1)] ?? value.at(-1)!);
    enter(index, digit);
  };

  const onPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) {
      showNumbersOnly();
      return;
    }
    setError(false);
    hideNumbersOnly();
    const next = [...digitsRef.current];
    const count = Math.min(pasted.length, LENGTH - index);
    for (let i = 0; i < count; i++) next[index + i] = pasted[i];
    commit(next);
    if (isComplete()) submit();
    else focus(index + count);
  };

  // Reduced motion keeps the fades and drops movement, scale and blur.
  // `to` is the transform's identity so motion can interpolate toward it;
  // transform and filter are cleared afterwards to keep text rendering crisp.
  const hidden = (from: string) => (reduce ? { opacity: 0 } : { opacity: 0, transform: from, filter: "blur(2px)" });
  const settled = (to: string) => ({
    opacity: 1,
    ...(reduce ? {} : { transform: to, filter: "blur(0px)" }),
    transitionEnd: { transform: "none", filter: "none" },
  });

  const verifying = status === "verifying";

  // Field always renders its 20px label row + 8px gap above the
  // control; mb-7 balances it so the cells stay centred as in Figma.
  const passcode = (
    <Field
      id={`${id}-0`}
      label={<span className="sr-only">Passcode</span>}
      error={error ? "Incorrect passcode. Try again." : undefined}
      hint={numbersOnly ? "Numbers only (0–9)" : undefined}
      className="mb-7"
    >
      {/* Figma's Verifying frame sits 1px higher than the other states. */}
      <div className={cn("relative", verifying && "-translate-y-px")}>
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-full left-1/2 mb-4 flex h-8 -translate-x-1/2 items-center justify-center gap-2 whitespace-nowrap"
        >
          <AnimatePresence>
            {verifying && (
              <motion.div
                key="verifying"
                className="flex items-center gap-2"
                initial={hidden("translateY(4px)")}
                animate={settled("translateY(0px)")}
                exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_EXIT } }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/spinner.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 animate-spin [animation-duration:1.2s] motion-reduce:animate-none"
                />
                <p className="text-[24px] leading-[normal] text-ink">Verifying...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          key={shakeKey}
          role="group"
          aria-label="Passcode"
          className={cn("flex items-center", shakeKey > 0 && "animate-shake motion-reduce:animate-none")}
        >
          {digits.map((digit, index) => (
            <Input
              key={index}
              id={`${id}-${index}`}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              value={digit}
              disabled={verifying}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${LENGTH}`}
              onKeyDown={(e) => onKeyDown(index, e)}
              onChange={(e) => onChange(index, e)}
              onPaste={(e) => onPaste(index, e)}
              onFocus={(e) => e.target.select()}
              // Overrides the Input's size, radius, padding, type and focus
              // ring with the Figma cell; its invalid styling is kept.
              className={cn(
                // Figma sets digits slightly below/right of centre (and the
                // focused one further left); padding reproduces that offset.
                "relative h-32 w-21 shrink-0 appearance-none border-stroke bg-fill p-0 pt-[4px] pl-[3px] text-center",
                "font-sans text-[36px] leading-[normal] font-medium text-ink caret-transparent md:text-[36px]",
                "selection:bg-transparent selection:text-ink",
                cellEdges[index],
                "focus-visible:z-10 focus-visible:rounded-[4px] focus-visible:border-[3px] focus-visible:border-highlight focus-visible:ring-0 focus-visible:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus-visible:pt-[2px] focus-visible:pl-0 focus-visible:pr-[3px]",
                "disabled:bg-fill-disabled disabled:text-ink-disabled disabled:opacity-100 disabled:[-webkit-text-fill-color:var(--color-ink-disabled)]",
                // Focus moving between cells is keyboard-driven and must be
                // instant; only greying out on submit eases in.
                "transition-none disabled:transition-[color,background-color,border-color,box-shadow,-webkit-text-fill-color] disabled:duration-200 disabled:ease-[ease]",
              )}
            />
          ))}
        </div>
      </div>
    </Field>
  );

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
          {passcode}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// The Figma check icon, drawn on arrival. The same SVG is layered twice: one
// copy clipped to the box outline, one to the inside, where the check is.
// The split runs at 7px/25px, in the empty gap between box (4–6, 26–28) and
// check (10–22), so no clip edge touches painted pixels.
// The check only ever travels rightwards, so a left-to-right wipe of its
// layer draws it like a pen stroke at constant speed.
const CHECK_HIDDEN = "inset(7px 22.5px 7px 7px)"; // check (and its AA edge) starts at x≈10
const CHECK_DRAWN = "inset(7px 7px 7px 7px)";

function CheckIcon() {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    animate([
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
    ]).then(() =>
      // Leave no transform behind so the icon rasterises like the static one
      // (next frame: motion commits its final value after resolving).
      requestAnimationFrame(() => {
        if (scope.current) scope.current.style.transform = "none";
      }),
    );
  }, [animate, reduce, scope]);

  return (
    <span
      ref={scope}
      aria-hidden
      className="relative size-8 shrink-0"
      style={reduce ? undefined : { transform: "scale(0.4)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/check.svg"
        alt=""
        width={32}
        height={32}
        className="absolute inset-0 size-8 [clip-path:path(evenodd,'M0_0H32V32H0ZM7_7V25H25V7Z')]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-part="check"
        src="/check.svg"
        alt=""
        width={32}
        height={32}
        className="absolute inset-0 size-8"
        style={{ clipPath: reduce ? CHECK_DRAWN : CHECK_HIDDEN }}
      />
    </span>
  );
}
