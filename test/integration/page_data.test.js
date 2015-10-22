import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

xdescribe('header', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => browser.navigateTo('/'));

  it('title', () =>
    assert.equal('Test Title', browser.getPageTitle()));

  it('source', () =>
    assert.include('DOCTYPE', browser.getPageSource()));
});
