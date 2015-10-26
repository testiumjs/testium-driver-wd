import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('mixin', () => {
  before(browser.beforeHook);

  it('exposes the mixed-in method', async () => {
    assert.equal(10, await browser.mixedInMethod());
  });
});
