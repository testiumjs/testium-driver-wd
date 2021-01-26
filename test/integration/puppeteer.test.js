'use strict';

const assert = require('assert');
const { getConfig } = require('testium-core');

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
    const ua = await browser.evaluate(() => {
      /* eslint-env browser */
      return navigator.userAgent;
    });

    assert.ok(ua.includes('Mozilla/5.0 (iPhone; CPU iPhone OS'));
  });

  describe('browser.withPuppeteerPage', () => {
    it('exposes puppeteer Page in callback argument', async () => {
      const page = await browser.withPuppeteerPage(Page => Page);

      assert.strictEqual(typeof page.workers, 'function');
      assert.strictEqual(typeof page.browserContext, 'function');
    });

    it('executes callback function', done => {
      browser.withPuppeteerPage(() => done());
    });
  });
});
