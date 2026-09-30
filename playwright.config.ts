import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5199",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 5199 --strictPort",
    url: "http://localhost:5199",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
