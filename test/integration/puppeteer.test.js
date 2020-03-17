'use strict';

const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const browser = require('../mini-testium-mocha').browser;

const browserName = getConfig().get('browser');

describe.skip('navigation', () => {
  if (browserName !== 'chrome') {
    it.skip('Skipping puppeteer tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  it('exposes device emulation', async () => {
    await browser.emulate('iPhone 6');
    await browser.navigateTo('/').assertStatusCode(200);
    assert.include(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X)',
      await browser.evaluate(() => {
        /* eslint-env browser */
        return navigator.userAgent;
      })
    );
  });
});
