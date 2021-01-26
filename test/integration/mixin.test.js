'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('mixin', () => {
  before(browser.beforeHook());

  it('exposes the relative path mixed-in method', async () => {
    assert.strictEqual(await browser.mixedInMethod(), 10);
  });

  it('exposes the external module mixed-in method', async () => {
    assert.strictEqual(await browser.anotherMethod(), 42);
  });
});
