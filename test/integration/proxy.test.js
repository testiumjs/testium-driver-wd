import {getBrowser} from '../mini-testium-mocha';

describe('proxy', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  describe('handles errors', () => {
    it('with no content type and preserves status code', () => {
      browser.navigateTo('/');
      browser.assert.httpStatus(200);

      browser.navigateTo('/error');
      browser.assert.httpStatus(500);
    });

    it('that crash and preserves status code', () => {
      browser.navigateTo('/crash');
      browser.assert.httpStatus(500);
    });
  });

  it('handles request abortion', done => {
    // loads a page that has a resource that will
    // be black holed
    browser.navigateTo('/blackholed-resource.html');
    browser.assert.httpStatus(200);

    // this can't simply be sync
    // because firefox blocks dom-ready
    // if we don't wait on the client-side
    setTimeout(() => {
      // when navigating away, the proxy should
      // abort the resource request;
      // this should not interfere with the new page load
      // or status code retrieval
      browser.navigateTo('/');
      browser.assert.httpStatus(200);
      done();
    }, 50);
  });

  it('handles hashes in urls', () => {
    browser.navigateTo('/#deals');
    browser.assert.httpStatus(200);
  });
});
