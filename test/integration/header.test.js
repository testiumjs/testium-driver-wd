'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const coroutine = require('bluebird').coroutine;

describe('header', () => {
  before(browser.beforeHook());

  describe('can be retrieved', () => {
    before(() => browser.loadPage('/'));

    it(
      'as a group',
      coroutine(function*() {
        const headers = yield browser.getHeaders();
        const contentType = headers['content-type'];
        assert.equal('text/html', contentType);
      })
    );

    it(
      'individually',
      coroutine(function*() {
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
      coroutine(function*() {
        const source = yield browser.getElement('body').text();
        const body = JSON.parse(source);
        assert.equal(body.headers['x-something'], 'that place');
      })
    );
  });
});
