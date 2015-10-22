import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('unicode support', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => browser.navigateTo('/'));

  it('multibyte unicode can pass through and back from WebDriver', () => {
    const multibyteText = '日本語 text';
    const element = browser.getElement('#blank-input');
    element.type(multibyteText);
    const result = element.get('value');
    assert.equal(result, multibyteText);
  });
});
