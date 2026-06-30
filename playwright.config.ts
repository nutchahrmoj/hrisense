import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND
  || (process.env.CI ? 'npm run build && npm run start' : 'npm run dev')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
      }
    : {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60000,
      },
})
