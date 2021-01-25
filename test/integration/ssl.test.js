'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assert');

describe('ssl/tls', () => {
  before(browser.beforeHook());

  it('TLS is supported', async () => {
    await browser.navigateTo('https://www.howsmyssl.com/a/check');
    const raw = await browser.getElement('pre').text();
    const sslReport = JSON.parse(raw);

    assert.match(sslReport.tls_version, /^TLS/);
  });
});
