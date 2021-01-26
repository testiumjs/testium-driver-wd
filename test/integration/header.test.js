'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('header', () => {
  before(browser.beforeHook());

  describe('can be retrieved', () => {
    before(() => browser.loadPage('/'));

    it('as a group', async () => {
      const headers = await browser.getHeaders();
      const contentType = headers['content-type'];

      assert.strictEqual(contentType, 'text/html');
    });

    it('individually', async () => {
      const contentType = await browser.getHeader('content-type');

      assert.strictEqual(contentType, 'text/html');
    });
  });

  describe('can be set', () => {
    before(() =>
      browser.loadPage('/echo', { headers: { 'x-something': 'that place' } })
    );

    it('to new values', async () => {
      const source = await browser.getElement('body').text();
      const body = JSON.parse(source);

      assert.strictEqual(body.headers['x-something'], 'that place');
    });
  });

  describe('x-request-id', () => {
    it('is defaulted to something useful', async () => {
      const source = await browser.loadPage('/echo').getElement('body').text();
      const reqId = JSON.parse(source).headers['x-request-id'];

      // 'header' because this file is named 'header.test.js',
      // and that's what mini-testium-mocha sets the currentTest to
      assert.match(reqId, /^header [0-9a-f-]{36}$/);
    });

    it('properly escapes bogus header content chars', async () => {
      browser.__proto__.currentTest = 'w x\n\ny\t💩\tz';
      const source = await browser.loadPage('/echo').getElement('body').text();
      const reqId = JSON.parse(source).headers['x-request-id'];

      assert.match(reqId, /^w x-y-z [0-9a-f-]{36}$/);
    });
  });
});
