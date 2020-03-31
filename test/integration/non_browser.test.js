'use strict';

const get = require('http').get;

const { browser } = require('../mini-testium-mocha');
const assert = require('assertive');

describe('Non-browser test', () => {
  before(browser.beforeHook());

  it('can make a request without using the browser', done => {
    const url = `${browser.appUrl}/echo`;
    get(url, response => {
      assert.equal(200, response.statusCode);
      done();
    }).on('error', done);
  });
});
