import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import { cell, open } from "./helpers";

// Compares each designed state with its Figma frame (tests/figma/*.png,
// exported at 1512 × 982). Positions match exactly; what remains is text
// anti-aliasing (Figma's renderer vs Chrome's), so each state gets a small
// budget of differing pixels rather than requiring zero.
const BUDGET = { empty: 0, filling: 200, verifying: 700, authenticated: 1100 };

async function differingPixels(page: Page, frame: keyof typeof BUDGET) {
  const shot = await page.screenshot({ animations: "disabled" });
  const reference = fs.readFileSync(
    path.join(__dirname, "figma", `figma-${frame === "authenticated" ? "auth" : frame}.png`),
  );
  return page.evaluate(
    async ([a, b]) => {
      const load = async (src: string) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height).data;
      };
      const [da, db] = await Promise.all([load(a), load(b)]);
      let n = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])) > 24)
          n++;
      }
      return n;
    },
    [`data:image/png;base64,${shot.toString("base64")}`, `data:image/png;base64,${reference.toString("base64")}`],
  );
}

test("matches the Figma states", async ({ page }) => {
  await open(page);
  expect(await differingPixels(page, "empty")).toBeLessThanOrEqual(BUDGET.empty);

  await cell(page, 1).focus();
  await page.keyboard.type("122");
  await page.keyboard.press("ArrowLeft"); // Figma shows the third cell focused
  await page.mouse.move(0, 0);
  expect(await differingPixels(page, "filling")).toBeLessThanOrEqual(BUDGET.filling);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("34");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400); // entrance settles
  expect(await differingPixels(page, "verifying")).toBeLessThanOrEqual(BUDGET.verifying);

  await expect(page.getByText("Authenticated")).toBeVisible();
  await page.waitForTimeout(1200); // check icon sequence
  expect(await differingPixels(page, "authenticated")).toBeLessThanOrEqual(BUDGET.authenticated);
});
