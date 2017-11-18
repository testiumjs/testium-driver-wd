'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const coroutine = require('bluebird').coroutine;

describe('console', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  // Each browser fails to implement the WebDriver spec
  // for console.logs differently.
  // Use at your own risk.
  it(
    'can all be retrieved',
    coroutine(function*() {
      const browserName = browser.capabilities.browserName;
      let logs;

      switch (browserName) {
        case 'firefox':
          // firefox ignores this entirely
          break;

        case 'chrome':
          logs = yield browser.getConsoleLogs();
          assert.truthy('console.logs length', logs.length > 0);

          logs = yield browser.getConsoleLogs();
          assert.equal(0, logs.length);

          yield browser.clickOn('#log-button');

          logs = yield browser.getConsoleLogs();
          assert.truthy('console.logs length', logs.length > 0);
          break;

        default:
          logs = yield browser.getConsoleLogs();
          assert.truthy('console.logs length', logs.length > 0);
          break;
      }
    })
  );
});
