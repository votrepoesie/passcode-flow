"use client";

import { useSyncExternalStore } from "react";

// Single source of truth for the DS surfaces' light/dark preference. The nav
// switch and each page's `.ds` wrapper read the same value, so there's no
// React-vs-DOM fight over the `.dark` class. Persisted to localStorage and kept
// in sync across tabs via the `storage` event.
const KEY = "ds-theme";
const listeners = new Set<() => void>();
let dark = false;
let hydrated = false;

function read(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "dark";
}

function emit() {
  for (const l of listeners) l();
}

export function toggleTheme() {
  setTheme(!dark);
}

export function setTheme(next: boolean) {
  dark = next;
  hydrated = true;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, next ? "dark" : "light");
    // Flip the page base (globals.css `:root`/`.dark`) so the surface around
    // `.ds` regions tracks the switch too.
    document.documentElement.classList.toggle("dark", next);
  }
  emit();
}

function subscribe(cb: () => void) {
  // First subscriber hydrates from localStorage (client only).
  if (!hydrated) {
    dark = read();
    hydrated = true;
    document.documentElement.classList.toggle("dark", dark);
  }
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      dark = read();
      document.documentElement.classList.toggle("dark", dark);
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// SSR renders light; the client hydrates to the stored value on mount.
export function useTheme(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => dark,
    () => false
  );
}
