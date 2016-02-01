import { browser } from '../mini-testium-mocha';
import assert from 'assertive';

describe('header', () => {
  before(browser.beforeHook);

  describe('can be retrieved', () => {
    before(() => browser.navigateTo('/').assertStatusCode(200));

    it('as a group', async () => {
      const headers = await browser.getHeaders();
      const contentType = headers['content-type'];
      assert.equal('text/html', contentType);
    });

    it('individually', async () => {
      const contentType = await browser.getHeader('content-type');
      assert.equal('text/html', contentType);
    });
  });

  describe('can be set', () => {
    before(() =>
      browser.navigateTo('/echo', { headers: { 'x-something': 'that place' } }));

    it('to new values', async () => {
      const source = await browser.getElement('body').text();
      const body = JSON.parse(source);
      assert.equal(body.headers['x-something'], 'that place');
    });
  });
});
