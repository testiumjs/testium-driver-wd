'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assertive');

describe('mixin', () => {
  before(browser.beforeHook());

  it('exposes the relative path mixed-in method', async () => {
    assert.equal(10, await browser.mixedInMethod());
  });

  it('exposes the external module mixed-in method', async () => {
    assert.equal(42, await browser.anotherMethod());
  });
});
