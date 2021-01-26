'use strict';

const assert = require('assert');
const { getConfig } = require('testium-core');
const { browser } = require('../mini-testium-mocha');

const browserName = getConfig().get('browser');

describe('page data', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('title', async () => {
    assert.strictEqual(await browser.getPageTitle(), 'Test Title');
  });

  // chromedriver excludes DOCTYPE
  if (browserName !== 'chrome') {
    it('source', () => assert.include('DOCTYPE', browser.getPageSource()));
  }

  it('size', async () =>
    assert.deepStrictEqual(await browser.getPageSize(), {
      height: 768,
      width: 1024,
    }));

  it('screenshot', async () => {
    const screenshot = await browser.getScreenshot();
    assert.ok(screenshot.length > 0);
  });
});
