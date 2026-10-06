export const LENGTH = 4;

/** How long a transient hint ("Numbers only", "Enter all 4 digits") stays up. */
export const NOTICE_MS = 2000;

export const COPY = {
  numbersOnly: "Numbers only (0–9)",
  incomplete: `Enter all ${LENGTH} digits`,
  wrongCode: "Incorrect passcode. Try again.",
} as const;
