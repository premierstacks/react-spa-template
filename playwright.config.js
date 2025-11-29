import { defineConfig, devices } from '@playwright/test';

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  projects: [
    {
      name: 'Desktop Edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        viewport: {
          width: 384,
          height: 824,
        },
      },
    },
    {
      name: 'iPhone 15',
      use: {
        ...devices['iPhone 15'],
        viewport: {
          width: 384,
          height: 824,
        },
      },
    },
    {
      name: 'iPad Pro 11',
      use: {
        ...devices['iPad Pro 11'],
        viewport: {
          width: 768,
          height: 1024,
        },
      },
    },
  ],
  webServer: {
    command: 'npm run start:ci',
    url: 'http://localhost:3000/webpack-dev-server',
    reuseExistingServer: true,
    timeout: 5 * 60 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'en',
    screenshot: 'only-on-failure',
  },
  timeout: 5 * 60 * 1000,
  retries: 2,
});
