import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('console', () => {
  before(browser.beforeHook);

  before(async () => {
    await browser.navigateTo('/');
    assert.equal(200, await browser.getStatusCode());
  });

  // Each browser fails to implement the WebDriver spec
  // for console.logs differently.
  // Use at your own risk.
  it('can all be retrieved', async () => {
    const { browserName } = await browser.sessionCapabilities();
    let logs;

    switch (browserName) {
    case 'firefox':
      // firefox ignores this entirely
      break;

    case 'chrome':
      logs = await browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);

      logs = await browser.getConsoleLogs();
      assert.equal(0, logs.length);

      await browser.clickOn('#log-button');

      logs = await browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);
      break;

    default:
      logs = await browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);
      break;
    }
  });
});
