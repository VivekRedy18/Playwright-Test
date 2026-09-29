require('dotenv').config();
const { chromium } = require('playwright')
const { expect } = require("expect");
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

(async () => {
  console.log('Starting Playwright test...');
  console.log('Playwright version:', playwrightClientVersion);

  const capabilities = {
    'browserName': 'Chrome', // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    'browserVersion': 'latest',
    'LT:Options': {
      'platform': 'Windows 10',
      'build': 'Playwright Assignment Testcase 2',
      'name': 'Testcases 2',
      'user': process.env.LT_USERNAME,
      'accessKey': process.env.LT_ACCESS_KEY,
      'network': true,
      'video': true,
      'console': true,
      'tunnel': false, // Add tunnel configuration if testing locally hosted webpage
      'tunnelName': '', // Optional
      'geoLocation': '', // country code can be fetched from https://www.lambdatest.com/capabilities-generator/
      'playwrightClientVersion': playwrightClientVersion
    }
  }

  console.log('Connecting to LambdaTest...');
  console.log('Username:', process.env.LT_USERNAME);
  console.log('Platform: Windows 10, Browser: Chrome');

  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
  })

  console.log('Connected to LambdaTest successfully!');
  console.log('Creating new page...');

    const message = 'Welcome to TestMu AI';
    const page = await browser.newPage()

    console.log('Navigating to TestMu AI Selenium Playground...');
    await page.goto('https://www.testmuai.com/selenium-playground/');

    
  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByRole('link', { name: 'Drag & Drop Sliders' }).click();

  const slider = page.locator('input[type="range"]').nth(2);
  const box    = await slider.boundingBox();
  if (!box) throw new Error('Slider not found');

  const defaultValue = 15;  // slider starts at 15
  const targetValue  = 97;

  const startX  = box.x + ((defaultValue / 100) * box.width);
  const targetX = box.x + ((targetValue  / 100) * box.width);
  const centerY = box.y + box.height / 2;

  await page.mouse.move(startX, centerY);              
  await page.mouse.down();                              
  await page.mouse.move(targetX, centerY, { steps: 95 });
  await page.mouse.up();                             

  const sliderValue = await page.locator('#rangeSuccess').textContent();
  console.log('Displayed message:', sliderValue);

    try {
      console.log('Verifying displayed value matches expected result...');
      expect(sliderValue).toEqual('99');
      console.log('Test PASSED! Displayed Value matched successfully');

      // Mark the test as completed or failed
      await page.evaluate(_ => { }, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Title matched' } })}`)
      console.log('Marked test as PASSED in LambdaTest dashboard');

      await teardown(page, browser)
    } catch (e) {
      console.log('Test FAILED!');
      console.log('Error:', e.message);
      console.log('Expected message:', message);
      console.log('Actual message:', title);

      await page.evaluate(_ => { }, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: e.stack } })}`)
      console.log('Marked test as FAILED in LambdaTest dashboard');

      await teardown(page, browser)
      throw e
    }

})().catch(err => {
    console.error('Unexpected error occurred:');
    console.error(err);
    process.exit(1);
  });


async function teardown(page, browser) {
  console.log('Cleaning up resources...');
  await page.close();
  await browser.close();
  console.log('Test completed and resources cleaned up!');
}