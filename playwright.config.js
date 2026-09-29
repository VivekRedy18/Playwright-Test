const { defineConfig } = require('@playwright/test');
 
module.exports = defineConfig({
  testDir: './tests',
 
  timeout: 40 * 1000,   // test timeout: 40 seconds
  expect: {
    timeout: 50 * 1000, // assertion timeout: 50 seconds
  },
 
  reporter: 'html',
  workers: 2,
  fullyParallel: true,
  retries: 1,
 
  use: {
    browserName: 'chromium',
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
});