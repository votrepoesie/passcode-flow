import { expect, test } from "@playwright/test";
import { cell, enterPrompt, expectFocused, focused, hold, open, values, verifying } from "./helpers";

// The brief's keyboard requirements, one describe block each.

test.beforeEach(async ({ page }) => {
  await open(page);
  await cell(page, 1).focus();
});

test.describe("1. Enter submits the passcode", () => {
  test("submits a complete code", async ({ page }) => {
    await page.keyboard.type("1234");
    await expect(enterPrompt(page)).toBeVisible();
    await expect(verifying(page)).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(verifying(page)).toBeVisible();
    await expect(page.getByText("Authenticated")).toBeVisible();
  });

  test("does not submit an incomplete code, and says why", async ({ page }) => {
    await page.keyboard.type("123");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Enter all 4 digits")).toBeVisible();
    await expect(verifying(page)).toHaveCount(0);
    await expectFocused(page, "Digit 4 of 4");
  });

  test("works with focus outside the cells", async ({ page }) => {
    await page.keyboard.type("1234");
    await page.mouse.click(100, 100);
    expect(await focused(page)).toBe("body");
    await page.keyboard.press("Enter");
    await expect(verifying(page)).toBeVisible();
  });
});

test.describe("2. Typing a number advances to the next cell", () => {
  test("advances after each digit", async ({ page }) => {
    for (const [digit, next] of [
      ["1", "Digit 2 of 4"],
      ["2", "Digit 3 of 4"],
      ["3", "Digit 4 of 4"],
    ]) {
      await page.keyboard.press(digit);
      await expectFocused(page, next);
    }
  });

  test("typing over a filled cell replaces it and advances", async ({ page }) => {
    await page.keyboard.type("123");
    await cell(page, 2).focus();
    await page.keyboard.press("9");
    expect(await values(page)).toBe("1,9,3,");
    await expectFocused(page, "Digit 3 of 4");
  });

  test("ignores non-numeric keys and says so", async ({ page }) => {
    await page.keyboard.type("a-. ");
    expect(await values(page)).toBe(",,,");
    await expect(page.getByText("Numbers only (0–9)")).toBeVisible();
    await page.keyboard.press("5");
    await expect(page.getByText("Numbers only (0–9)")).toHaveCount(0);
  });
});

test.describe("3. Delete/Backspace clears the current cell", () => {
  for (const key of ["Backspace", "Delete"]) {
    test(key, async ({ page }) => {
      await page.keyboard.type("123");
      await cell(page, 2).focus();
      await page.keyboard.press(key);
      expect(await values(page)).toBe("1,,3,");
      await expectFocused(page, "Digit 2 of 4");
    });
  }

  test("soft-keyboard Backspace (no key reported) clears", async ({ page }) => {
    await page.keyboard.type("1");
    await cell(page, 1).focus();
    await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, "");
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    });
    await expect.poll(() => values(page)).toBe(",,,");
  });
});

test.describe("4. On an empty cell, Delete/Backspace moves back", () => {
  for (const key of ["Backspace", "Delete"]) {
    test(key, async ({ page }) => {
      await page.keyboard.type("12");
      await page.keyboard.press(key);
      await expectFocused(page, "Digit 2 of 4");
      expect(await values(page)).toBe("1,2,,");
    });
  }

  test("stops at the first cell", async ({ page }) => {
    await page.keyboard.press("Backspace");
    await expectFocused(page, "Digit 1 of 4");
  });
});

test.describe("5. Holding Delete/Backspace keeps clearing backwards", () => {
  for (const key of ["Backspace", "Delete"]) {
    test(key, async ({ page }) => {
      await page.keyboard.type("123");
      await hold(page, key, 6);
      expect(await values(page)).toBe(",,,");
      await expectFocused(page, "Digit 1 of 4");
    });
  }

  test("one cell per repeat", async ({ page }) => {
    await page.keyboard.type("123");
    await cell(page, 3).focus();
    await hold(page, "Backspace", 1);
    expect(await values(page)).toBe("1,,,");
  });
});
