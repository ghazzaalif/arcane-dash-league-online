"use strict";

const { defineConfig, devices } = require("@playwright/test");

const PORT = Number(process.env.E2E_PORT || 4174);

module.exports = defineConfig({
  testDir: "tests/e2e",
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: "node server.js",
    url: `http://127.0.0.1:${PORT}/healthz`,
    env: { PORT: String(PORT), HOST: "127.0.0.1" },
    reuseExistingServer: !process.env.CI
  }
});
