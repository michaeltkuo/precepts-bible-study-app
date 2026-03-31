import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm --workspace server run dev",
      url: "http://127.0.0.1:3001/api/sessions",
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: "npm --workspace client run dev -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
