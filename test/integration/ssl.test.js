'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

describe('ssl/tls', () => {
  before(browser.beforeHook());

  it(
    'TLS is supported',
    co.wrap(function*() {
      yield browser.navigateTo('https://www.howsmyssl.com/a/check');
      const raw = yield browser.getElement('pre').text();
      const sslReport = JSON.parse(raw);
      assert.match(/^TLS/, sslReport.tls_version);
    })
  );
});
