import { expect, test } from "@playwright/test";
import { cell, enterPrompt, expectFocused, open, paste, values, verifying } from "./helpers";

test.beforeEach(async ({ page }) => {
  await open(page);
});

test("typing with nothing focused starts in the first cell", async ({ page }) => {
  await page.keyboard.press("5");
  expect(await values(page)).toBe("5,,,");
  await expectFocused(page, "Digit 2 of 4");
});

test("wrong code clears, shakes and refocuses", async ({ page }) => {
  await cell(page, 1).focus();
  await page.keyboard.type("1987");
  await page.keyboard.press("Enter");
  await expect(cell(page, 1)).toBeDisabled();
  await expect(page.getByText("Incorrect passcode. Try again.")).toBeVisible();
  expect(await values(page)).toBe(",,,");
  await expectFocused(page, "Digit 1 of 4");
  await page.keyboard.press("1");
  await expect(page.getByText("Incorrect passcode. Try again.")).toHaveCount(0);
});

test("paste fills from the focused cell and waits for Enter", async ({ page }) => {
  await cell(page, 1).focus();
  await paste(page, "12-34");
  expect(await values(page)).toBe("1,2,3,4");
  await expect(verifying(page)).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Authenticated")).toBeVisible();
});

test("the focus ring slides to the focused cell and hides once the code is complete", async ({ page }) => {
  const ring = page.locator("[data-slot=focus-ring]");
  // Cell index the ring sits over, or "hidden".
  const ringAt = () =>
    ring.evaluate((el) => {
      const style = getComputedStyle(el);
      if (Number(style.opacity) < 0.5) return "hidden";
      return Math.round(new DOMMatrix(style.transform).m41 / 84);
    });
  await cell(page, 1).focus();
  await expect.poll(ringAt).toBe(0);
  await page.keyboard.type("123");
  await expect.poll(ringAt).toBe(3);
  await page.keyboard.type("4");
  await expect(enterPrompt(page)).toBeVisible();
  await expect.poll(ringAt).toBe("hidden");
  await page.keyboard.press("Backspace");
  await expect.poll(ringAt).toBe(3);
  await page.mouse.click(100, 100);
  await expect.poll(ringAt).toBe("hidden");
});
