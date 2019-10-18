'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');

describe('page data', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('title', () => assert.equal('Test Title', browser.getPageTitle()));

  it('source', () => assert.include('DOCTYPE', browser.getPageSource()));

  it('size', () =>
    assert.deepEqual({ height: 768, width: 1024 }, browser.getPageSize()));

  it('screenshot', async () => {
    const screenshot = await browser.getScreenshot();
    assert.expect(screenshot.length > 0);
  });
});
