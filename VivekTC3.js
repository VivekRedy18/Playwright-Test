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
      'build': 'Playwright Assignment Testcase 3',
      'name': 'Testcases 3',
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

  const expectedMessage = 'Thanks for contacting us, we will get back to you shortly.';
  const page = await browser.newPage()

  console.log('Navigating to TestMu AI Selenium Playground...');

  await page.goto('https://www.testmuai.com/selenium-playground/');
  await page.getByRole('link', { name: 'Input Form Submit' }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Submit' }).click();

  // Assert "Please fill in the fields" error message
  const nameInput = page.locator('input[name="name"]');
  const validationMessage = await nameInput.evaluate(el => el.validationMessage);
  console.log(validationMessage);
  expect(validationMessage).toBeTruthy();

  await page.locator('input[name="name"]').fill('Vivek');
  await page.locator('#inputEmail4').fill('vivek18@yopmail.com');
  await page.locator('#inputPassword4').fill('Vivek@1234');
  await page.locator('#company').fill('Playwright');
  await page.locator('#websitename').fill('Deloitte Playwright');
  await page.locator('select[name="country"]').selectOption({ label: 'United States' });
  await page.locator('#inputCity').fill('Dallas');
  await page.locator('#inputAddress1').fill('Deloitte Playwright 002');
  await page.locator('#inputAddress2').fill('Deloitte Playwright 001');

  await page.locator('#inputState').fill('Texas');
  await page.locator('#inputZip').fill('75201');
  await page.getByRole('button', { name: 'Submit' }).click();
  const title = await page.getByText(expectedMessage).textContent();
  const actualMessage = title?.trim();

  console.log('Verifying that the displayed message matches the input...');

  console.log('Displayed message:', actualMessage);

  try {
    console.log('Verifying displayed message matches expected result...');
    expect(actualMessage).toEqual(expectedMessage);
    console.log('Test PASSED! Displayed message matched successfully');

    // Mark the test as completed or failed
    await page.evaluate(_ => { }, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Title matched' } })}`)
    console.log('Marked test as PASSED in LambdaTest dashboard');

    await teardown(page, browser)
  } catch (e) {
    console.log('Test FAILED!');
    console.log('Error:', e.message);
    console.log('Expected message:', expectedMessage);
    console.log('Actual message:', actualMessage);

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