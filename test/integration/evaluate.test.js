import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('evaluate', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => browser.navigateTo('/'));

  it('runs JavaScript passed as a String', () => {
    const value = browser.evaluate('return 3;');
    assert.equal(3, value);
  });

  it('runs JavaScript passed as a Function', () => {
    assert.equal(6, browser.evaluate(() => 6));
  });

  it('runs JavaScript passed as a Function with optional prepended args', () => {
    assert.equal(18, browser.evaluate(3, 6, (a, b) => a * b));
  });
});
