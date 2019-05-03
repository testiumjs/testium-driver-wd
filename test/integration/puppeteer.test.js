'use strict';

const assert = require('assertive');
const co = require('co');
const getConfig = require('testium-core').getConfig;

const browser = require('../mini-testium-mocha').browser;

const browserName = getConfig().get('browser');

describe('navigation', () => {
  if (browserName !== 'chrome') {
    xit('Skipping puppeteer tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  it(
    'exposes device emulation',
    co.wrap(function*() {
      yield browser.emulate('iPhone 6');
      yield browser.navigateTo('/').assertStatusCode(200);
      assert.include(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X)',
        yield browser.evaluate(() => {
          /* eslint-env browser */
          return navigator.userAgent;
        })
      );
    })
  );
});
