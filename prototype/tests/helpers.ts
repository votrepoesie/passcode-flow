import { expect, type Page } from "@playwright/test";

export const cell = (page: Page, n: number) => page.getByRole("textbox", { name: `Digit ${n} of 4` });

/** Comma-joined cell values, e.g. "1,2,,". */
export const values = (page: Page) =>
  page
    .getByRole("textbox", { name: /^Digit \d of 4$/ })
    .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value).join(","));

/** aria-label of the focused element, or "body". */
export const focused = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "body");

export const verifying = (page: Page) => page.getByText("Verifying...");
export const enterPrompt = (page: Page) => page.locator("p", { hasText: /^Press.*to verify$/ });

/** Loads the page once it's hydrated, so the first keypress isn't lost. */
export async function open(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

/** Pastes text into the focused cell via a synthetic clipboard event. */
export const paste = (page: Page, text: string) =>
  page.evaluate((text) => {
    const data = new DataTransfer();
    data.setData("text", text);
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }),
    );
  }, text);

/** Key down + `repeats` auto-repeat events, as when the key is held. */
export async function hold(page: Page, key: string, repeats: number) {
  await page.keyboard.down(key);
  for (let i = 0; i < repeats; i++) await page.keyboard.down(key);
  await page.keyboard.up(key);
}

export async function expectFocused(page: Page, label: string) {
  await expect.poll(() => focused(page)).toBe(label);
}
