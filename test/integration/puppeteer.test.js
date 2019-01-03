'use strict';

const assert = require('assertive');
const co = require('co');
const getConfig = require('testium-core').getConfig;
const Semver = require('semver');

const browser = require('../mini-testium-mocha').browser;

const browserName = getConfig().get('browser');

describe('puppeteer', () => {
  if (browserName !== 'chrome') {
    xit('Skipping puppeteer tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  if (Semver.satisfies(process.version, '>=8.0.0')) {
    it(
      'can get lighthouse report data',
      co.wrap(function*() {
        yield browser.navigateTo('/draggable.html').assertStatusCode(200);
        const results = yield browser.getLighthouseData();
        const report = results.report;
        assert.match(/\/draggable\.html$/, JSON.parse(report).finalUrl);
      })
    );
  } else {
    it(
      'is helpful in the way it reports the lack of lighthouse support',
      co.wrap(function*() {
        yield browser.navigateTo('/draggable.html').assertStatusCode(200);
        const error = yield assert.rejects(browser.getLighthouseData());
        assert.equal(
          'Lighthouse requires a newer version of node',
          error.message
        );
      })
    );
  }

  it(
    'exposes device emulation',
    co.wrap(function*() {
      yield browser.emulate('iPhone 6');
      yield browser.navigateTo('/').assertStatusCode(200);
      assert.include(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X)',
        yield browser.evaluate(() => {
          /* eslint-env browser */
          return navigator.userAgent;
        })
      );
    })
  );
});
