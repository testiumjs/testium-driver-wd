import { browser } from '../mini-testium-mocha';
import assert from 'assertive';

describe('evaluate', () => {
  before(browser.beforeHook);

  before(() => browser.navigateTo('/'));

  it('runs JavaScript passed as a String', async () => {
    assert.equal(3, await browser.evaluate('return 3;'));
  });

  it('runs JavaScript passed as a Function', async () => {
    assert.equal(6, await browser.evaluate(() => 6));
  });

  it('runs JavaScript passed as a Function with optional prepended args', async () => {
    assert.equal(18, await browser.evaluate(3, 6, (a, b) => a * b));
  });
});
