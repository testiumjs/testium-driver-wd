import {browser} from '../mini-testium-mocha';
import {delay} from 'Bluebird';

describe('proxy', () => {
  before(browser.beforeHook);

  describe('handles errors', () => {
    it('with no content type and preserves status code', () =>
      browser
        .navigateTo('/').assertStatusCode(200)
        .navigateTo('/error').assertStatusCode(500));

    it('that crash and preserves status code', () =>
      browser.navigateTo('/crash').assertStatusCode(500));
  });

  it('handles request abortion', async () => {
    // loads a page that has a resource that will
    // be black holed
    await browser
      .navigateTo('/blackholed-resource.html').assertStatusCode(200);

    // this can't simply be sync
    // because firefox blocks dom-ready
    // if we don't wait on the client-side
    await delay(50);

    // when navigating away, the proxy should
    // abort the resource request;
    // this should not interfere with the new page load
    // or status code retrieval
    await browser.navigateTo('/').assertStatusCode(200);
  });

  it('handles hashes in urls', () =>
    browser.navigateTo('/#deals').assertStatusCode(200));
});
