import { defineConfig, devices } from '@playwright/test';

import { env } from './src/config/env';

const browserUse = {
  ...devices['Desktop Chrome'],
  ...(env.browserChannel ? { channel: env.browserChannel } : {}),
};

const projects = env.crossBrowser
  ? [
      {
        name: 'chromium',
        use: {
          ...browserUse,
        },
      },
      {
        name: 'firefox',
        use: {
          ...devices['Desktop Firefox'],
        },
      },
      {
        name: 'webkit',
        use: {
          ...devices['Desktop Safari'],
        },
      },
    ]
  : [
      {
        name: 'chromium',
        use: {
          ...browserUse,
        },
      },
    ];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: env.testTimeoutMs,
  expect: {
    timeout: env.expectTimeoutMs,
  },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit/results.xml' }],
  ],
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: env.actionTimeoutMs,
    navigationTimeout: env.navigationTimeoutMs,
    ignoreHTTPSErrors: env.ignoreHttpsErrors,
  },
  projects,
});
