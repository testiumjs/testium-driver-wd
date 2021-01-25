'use strict';

const http = require('http');

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('Non-browser test', () => {
  before(browser.beforeHook());

  it('can make a request without using the browser', done => {
    const url = `${browser.appUrl}/echo`;
    http
      .get(url, response => {
        assert.strictEqual(response.statusCode, 200);
        done();
      })
      .on('error', done);
  });
});
