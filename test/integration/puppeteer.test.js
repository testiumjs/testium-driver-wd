'use strict';

const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const { browser } = require('../mini-testium-mocha');

const browserName = getConfig().get('browser');

describe('puppeteer', () => {
  if (browserName !== 'chrome') {
    it.skip('Skipping puppeteer tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  it('exposes device emulation', async () => {
    await browser.emulate('iPhone 6');
    await browser.loadPage('/');
    assert.include(
      'Mozilla/5.0 (iPhone; CPU iPhone OS',
      await browser.evaluate(() => {
        /* eslint-env browser */
        return navigator.userAgent;
      })
    );
  });

  describe('browser.withPuppeteerPage', () => {
    it('exposes puppeteer Page in callback argument', async () => {
      const page = await browser.withPuppeteerPage(Page => Page);

      assert.hasType(Function, page.workers);
      assert.hasType(Function, page.browserContext);
    });

    it('executes callback function', done => {
      browser.withPuppeteerPage(() => done());
    });
  });
});
