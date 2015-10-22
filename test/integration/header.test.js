import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('header', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  describe('can be retrieved', () => {
    before(() => {
      browser.navigateTo('/');
      browser.assert.httpStatus(200);
    });

    it('as a group', () => {
      const headers = browser.getHeaders();
      const contentType = headers['content-type'];
      assert.equal('text/html', contentType);
    });

    it('individually', () => {
      const contentType = browser.getHeader('content-type');
      assert.equal('text/html', contentType);
    });
  });

  describe('can be set', () => {
    before(() =>
      browser.navigateTo('/echo', { headers: { 'x-something': 'that place' } }));

    it('to new values', () => {
      const source = browser.getElement('body').get('text');
      const body = JSON.parse(source);
      assert.equal(body.headers['x-something'], 'that place');
    });
  });
});
