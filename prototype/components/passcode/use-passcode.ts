"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { verifyPasscode } from "@/lib/verify-passcode";
import { COPY, LENGTH, NOTICE_MS } from "./constants";

export type Status = "idle" | "verifying" | "authenticated";

const empty = () => Array<string>(LENGTH).fill("");
const isDigit = (key: string) => /^[0-9]$/.test(key);

/**
 * State and keyboard behaviour for the passcode flow:
 * - typing a digit fills the cell and advances; other keys show a hint
 * - Backspace/Delete clears the cell, or moves back from an empty one; held,
 *   it keeps clearing backwards one cell per key repeat
 * - Enter submits a complete code (or says how many digits are missing)
 */
export function usePasscode() {
  const [digits, setDigits] = useState<string[]>(empty);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Bumped on each wrong code to replay the shake animation.
  const [shakeKey, setShakeKey] = useState(0);
  // Code just completed: nothing left to type, so the focused cell drops its
  // "type here" highlight (focus stays for Enter/Backspace) until the next edit.
  const [ready, setReady] = useState(false);
  // Counts Enter presses so the on-screen keycap can dip with the real key.
  const [enterPresses, setEnterPresses] = useState(0);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  // Mirrors `digits` so key-repeat events never read a stale render.
  const digitsRef = useRef(digits);
  // Focus requested while inputs are disabled; applied after the next render.
  const pendingFocus = useRef<number | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  // Guards against a second Enter landing before the "verifying" re-render.
  const submitting = useRef(false);
  const verification = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(noticeTimer.current);
      verification.current?.abort();
    },
    [],
  );

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
    inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  };

  const isComplete = (values = digitsRef.current) => values.every((d) => d !== "");

  // Brief hint in the Field's label row; the next digit hides it.
  const showNotice = (text: string) => {
    setError(false);
    setNotice(text);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  };

  const hideNotice = () => {
    window.clearTimeout(noticeTimer.current);
    setNotice(null);
  };

  useEffect(() => {
    if (status === "idle" && pendingFocus.current !== null) {
      focus(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [status]);

  const submit = async () => {
    if (submitting.current || status !== "idle") return;
    const firstEmpty = digitsRef.current.findIndex((d) => d === "");
    if (firstEmpty !== -1) {
      focus(firstEmpty);
      showNotice(COPY.incomplete);
      return;
    }

    submitting.current = true;
    (document.activeElement as HTMLElement | null)?.blur();
    setError(false);
    setStatus("verifying");

    const controller = new AbortController();
    verification.current = controller;
    let correct: boolean;
    try {
      correct = await verifyPasscode(digitsRef.current.join(""), controller.signal);
    } catch {
      return; // Unmounted mid-check.
    } finally {
      submitting.current = false;
    }

    if (correct) {
      setStatus("authenticated");
      return;
    }
    commit(empty());
    setError(true);
    setShakeKey((k) => k + 1);
    pendingFocus.current = 0;
    setStatus("idle");
  };

  const pressEnter = () => {
    setEnterPresses((n) => n + 1);
    void submit();
  };

  const enterDigit = (index: number, digit: string) => {
    setError(false);
    hideNotice();
    setDigit(index, digit);
    if (index < LENGTH - 1) focus(index + 1);
    setReady(isComplete());
  };

  // With focus outside the cells, a digit starts at the first empty cell and
  // Enter still submits.
  const onWindowKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (inputs.current.includes(e.target as HTMLInputElement)) return;
    if (e.key === "Enter") {
      e.preventDefault();
      pressEnter();
    } else if (isDigit(e.key)) {
      e.preventDefault();
      const firstEmpty = digitsRef.current.findIndex((d) => d === "");
      enterDigit(firstEmpty === -1 ? LENGTH - 1 : firstEmpty, e.key);
    }
  });

  useEffect(() => {
    if (status !== "idle") return;
    const listener = (e: KeyboardEvent) => onWindowKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [status]);

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Any key but Enter is an edit; a digit that completes the code re-arms it.
    if (e.key !== "Enter") setReady(false);
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        pressEnter();
        return;
      case "Backspace":
      case "Delete":
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
    // Digits are handled here rather than in onChange so retyping the same
    // digit still advances; every other printable key is blocked.
    e.preventDefault();
    if (isDigit(e.key)) enterDigit(index, e.key);
    else showNotice(COPY.numbersOnly);
  };

  // Fallback for soft keyboards (e.g. Android) that report keydown as
  // "Unidentified". The cell's contents are selected on focus, so a new digit
  // normally replaces it; otherwise take the digit left of the caret.
  const onChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      if (e.target.value) showNotice(COPY.numbersOnly);
      // Emptied by a soft-keyboard Backspace: clear the cell.
      else setDigit(index, "");
      return;
    }
    const caret = e.target.selectionStart ?? value.length;
    enterDigit(index, value.length === 1 ? value : (value[Math.max(0, caret - 1)] ?? value.at(-1)!));
  };

  const onPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) {
      showNotice(COPY.numbersOnly);
      return;
    }
    setError(false);
    hideNotice();
    const next = [...digitsRef.current];
    const count = Math.min(pasted.length, LENGTH - index);
    for (let i = 0; i < count; i++) next[index + i] = pasted[i];
    commit(next);
    focus(index + count);
    setReady(isComplete(next));
  };

  const registerCell = (index: number, el: HTMLInputElement | null) => {
    inputs.current[index] = el;
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setReady(false);
    e.target.select();
  };

  const onPointerDown = () => setReady(false);

  return {
    digits,
    status,
    error,
    notice,
    shakeKey,
    ready,
    enterPresses,
    complete: status === "idle" && digits.every((d) => d !== ""),
    /** Event handlers for the cells; wire them per cell index. */
    cell: { registerCell, onKeyDown, onChange, onPaste, onFocus, onPointerDown },
  };
}
