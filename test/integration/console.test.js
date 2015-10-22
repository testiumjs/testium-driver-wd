import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('console', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => {
    browser.navigateTo('/');
    browser.assert.httpStatus(200);
  });

  // Each browser fails to implement the WebDriver spec
  // for console.logs differently.
  // Use at your own risk.
  it('can all be retrieved', () => {
    const { browserName } = browser.capabilities;
    let logs;

    switch (browserName) {
    case 'firefox':
      // firefox ignores this entirely
      break;

    case 'chrome':
      logs = browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);

      logs = browser.getConsoleLogs();
      assert.equal(0, logs.length);

      browser.click('#log-button');

      logs = browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);
      break;

    default:
      logs = browser.getConsoleLogs();
      assert.truthy('console.logs length', logs.length > 0);
      break;
    }
  });
});
