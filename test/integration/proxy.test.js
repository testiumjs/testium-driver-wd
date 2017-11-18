'use strict';

const browser = require('../mini-testium-mocha').browser;
const Bluebird = require('bluebird');

const delay = Bluebird.delay;
const coroutine = Bluebird.coroutine;

describe('proxy', () => {
  before(browser.beforeHook());

  describe('handles errors', () => {
    it('with no content type and preserves status code', () =>
      browser.loadPage('/').loadPage('/error', { expectedStatusCode: 500 }));

    it('that crash and preserves status code', () =>
      browser.loadPage('/crash', { expectedStatusCode: 500 }));
  });

  it(
    'handles request abortion',
    coroutine(function*() {
      // loads a page that has a resource that will
      // be black holed
      yield browser.loadPage('/blackholed-resource.html');

      // this can't simply be sync
      // because firefox blocks dom-ready
      // if we don't wait on the client-side
      yield delay(50);

      // when navigating away, the proxy should
      // abort the resource request;
      // this should not interfere with the new page load
      // or status code retrieval
      yield browser.loadPage('/');
    })
  );

  it('handles hashes in urls', () => browser.loadPage('/#deals'));
});
