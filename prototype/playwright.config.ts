import { defineConfig } from "@playwright/test";

const PORT = 3020;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Chrome; no browser download needed.
    channel: "chrome",
    // The Figma frames are 1512 × 982.
    viewport: { width: 1512, height: 982 },
  },
  webServer: {
    command: "npm run dev",
    port: PORT,
    reuseExistingServer: true,
  },
});
