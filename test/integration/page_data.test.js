'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const browserName = getConfig().get('browser');

describe('page data', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('title', () => assert.equal('Test Title', browser.getPageTitle()));

  // chromedriver excludes DOCTYPE
  if (browserName !== 'chrome') {
    it('source', () => assert.include('DOCTYPE', browser.getPageSource()));
  }

  it('size', () =>
    assert.deepEqual({ height: 768, width: 1024 }, browser.getPageSize()));

  it('screenshot', async () => {
    const screenshot = await browser.getScreenshot();
    assert.expect(screenshot.length > 0);
  });
});
