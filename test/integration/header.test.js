'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assertive');

describe('header', () => {
  before(browser.beforeHook());

  describe('can be retrieved', () => {
    before(() => browser.loadPage('/'));

    it('as a group', async () => {
      const headers = await browser.getHeaders();
      const contentType = headers['content-type'];
      assert.equal('text/html', contentType);
    });

    it('individually', async () => {
      const contentType = await browser.getHeader('content-type');
      assert.equal('text/html', contentType);
    });
  });

  describe('can be set', () => {
    before(() =>
      browser.loadPage('/echo', { headers: { 'x-something': 'that place' } })
    );

    it('to new values', async () => {
      const source = await browser.getElement('body').text();
      const body = JSON.parse(source);
      assert.equal(body.headers['x-something'], 'that place');
    });
  });

  describe('x-request-id', () => {
    it('is defaulted to something useful', async () => {
      const source = await browser
        .loadPage('/echo')
        .getElement('body')
        .text();
      const reqId = JSON.parse(source).headers['x-request-id'];
      // 'header' because this file is named 'header.test.js',
      // and that's what mini-testium-mocha sets the currentTest to
      assert.match(/^header [0-9a-f-]{36}$/, reqId);
    });

    it('properly escapes bogus header content chars', async () => {
      browser.__proto__.currentTest = 'w x\n\ny\t💩\tz';
      const source = await browser
        .loadPage('/echo')
        .getElement('body')
        .text();
      const reqId = JSON.parse(source).headers['x-request-id'];
      assert.match(/^w x-y-z [0-9a-f-]{36}$/, reqId);
    });
  });
});
