// E2E tests run against the dev server on port 3200 (3000 and 3100 are taken on the main dev machine).
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3200" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
