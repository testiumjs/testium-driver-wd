'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('console', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  // Each browser fails to implement the WebDriver spec
  // for console.logs differently.
  // Use at your own risk.
  it('can all be retrieved', async () => {
    const browserName = browser.capabilities.browserName;
    let logs;

    switch (browserName) {
      case 'firefox':
        // firefox ignores this entirely
        break;

      case 'chrome':
        logs = await browser.getConsoleLogs();
        assert.ok(logs.length > 0, 'console.logs length');

        logs = await browser.getConsoleLogs();
        assert.strictEqual(logs.length, 0);

        await browser.clickOn('#log-button');

        logs = await browser.getConsoleLogs();
        assert.ok(logs.length > 0, 'console.logs length');
        break;

      default:
        logs = await browser.getConsoleLogs();
        assert.ok(logs.length > 0, 'console.logs length');
    }
  });
});
