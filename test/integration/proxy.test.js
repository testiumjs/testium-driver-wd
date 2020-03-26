'use strict';

const { browser } = require('../mini-testium-mocha');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('proxy', () => {
  before(browser.beforeHook());

  describe('handles errors', () => {
    it('with no content type and preserves status code', () => {
      return browser
        .loadPage('/')
        .loadPage('/error', { expectedStatusCode: 500 });
    });

    it('that crash and preserves status code', () =>
      browser.loadPage('/crash', { expectedStatusCode: 500 }));
  });

  it('handles request abortion', async () => {
    // loads a page that has a resource that will
    // be black holed
    await browser.loadPage('/blackholed-resource.html');

    // this can't simply be sync
    // because firefox blocks dom-ready
    // if we don't wait on the client-side
    await delay(50);

    // when navigating away, the proxy should
    // abort the resource request;
    // this should not interfere with the new page load
    // or status code retrieval
    await browser.loadPage('/');
  });

  it('handles hashes in urls', () => browser.loadPage('/#deals'));
});
