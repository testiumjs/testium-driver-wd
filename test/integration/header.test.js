'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

describe('header', () => {
  before(browser.beforeHook());

  describe('can be retrieved', () => {
    before(() => browser.loadPage('/'));

    it(
      'as a group',
      co.wrap(function*() {
        const headers = yield browser.getHeaders();
        const contentType = headers['content-type'];
        assert.equal('text/html', contentType);
      })
    );

    it(
      'individually',
      co.wrap(function*() {
        const contentType = yield browser.getHeader('content-type');
        assert.equal('text/html', contentType);
      })
    );
  });

  describe('can be set', () => {
    before(() =>
      browser.loadPage('/echo', { headers: { 'x-something': 'that place' } })
    );

    it(
      'to new values',
      co.wrap(function*() {
        const source = yield browser.getElement('body').text();
        const body = JSON.parse(source);
        assert.equal(body.headers['x-something'], 'that place');
      })
    );
  });

  describe('x-request-id', () => {
    it(
      'is defaulted to something useful',
      co.wrap(function*() {
        const source = yield browser
          .loadPage('/echo')
          .getElement('body')
          .text();
        const reqId = JSON.parse(source).headers['x-request-id'];
        // 'header' because this file is named 'header.test.js',
        // and that's what mini-testium-mocha sets the currentTest to
        assert.match(/^header [0-9a-f-]{36}$/, reqId);
      })
    );

    it(
      'properly escapes bogus header content chars',
      co.wrap(function*() {
        browser.__proto__.currentTest = 'w x\n\ny\t💩\tz';
        const source = yield browser
          .loadPage('/echo')
          .getElement('body')
          .text();
        const reqId = JSON.parse(source).headers['x-request-id'];
        assert.match(/^w x-y-z [0-9a-f-]{36}$/, reqId);
      })
    );
  });
});
