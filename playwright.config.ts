import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const cursorNodeHelpers = "/Applications/Cursor.app/Contents/Resources/app/resources/helpers";
const localBin = path.resolve(__dirname, "node_modules/.bin");
const pathWithHelpers = `${cursorNodeHelpers}:${localBin}:${process.env.PATH ?? ""}`;
const port = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `next dev --webpack --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      PATH: pathWithHelpers,
      PORT: port,
      NEXT_DIST_DIR: ".next-e2e",
    },
  },
});
