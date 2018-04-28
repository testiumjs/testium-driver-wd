'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

describe('mixin', () => {
  before(browser.beforeHook());

  it(
    'exposes the relative path mixed-in method',
    co.wrap(function*() {
      assert.equal(10, yield browser.mixedInMethod());
    })
  );

  it(
    'exposes the external module mixed-in method',
    co.wrap(function*() {
      assert.equal(42, yield browser.anotherMethod());
    })
  );
});
