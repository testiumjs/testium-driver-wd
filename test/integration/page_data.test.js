'use strict';

const assert = require('assert');
const { getConfig } = require('testium-core');
const { browser } = require('../mini-testium-mocha');

const browserName = getConfig().get('browser');

describe('page', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('browser.getPageTitle() returns page title', async () => {
    assert.strictEqual(await browser.getPageTitle(), 'Test Title');
  });

  // chromedriver excludes DOCTYPE
  if (browserName !== 'chrome') {
    it('source', () => assert.include('DOCTYPE', browser.getPageSource()));
  }

  it('browser.getPageSize() returns page dimension', async () =>
    assert.deepStrictEqual(await browser.getPageSize(), {
      height: 768,
      width: 1024,
    }));

  it('browser.getScreenshot() generates a screenshot', async () => {
    const screenshot = await browser.getScreenshot();
    assert.ok(screenshot.length > 0);
  });

  describe('browser.setPageSize()', () => {
    it('sets new page dimension', async () => {
      await browser.setPageSize({ height: 2000, width: 2000 });

      assert.deepStrictEqual(await browser.getPageSize(), {
        height: 2000,
        width: 2000,
      });
    });

    it('can set the height only', async () => {
      await browser.setPageSize({ height: 1000, width: 1400 });
      await browser.setPageSize({ height: 200 });

      assert.deepStrictEqual(await browser.getPageSize(), {
        height: 200,
        width: 1400,
      });
    });

    it('can set the width only', async () => {
      await browser.setPageSize({ height: 1000, width: 1400 });
      await browser.setPageSize({ width: 200 });

      assert.deepStrictEqual(await browser.getPageSize(), {
        height: 1000,
        width: 200,
      });
    });
  });
});
