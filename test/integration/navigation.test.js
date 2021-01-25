'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('navigation', () => {
  before(browser.beforeHook());

  it('supports just a path', () =>
    browser.navigateTo('/').assertStatusCode(200));

  it('supports query args', () =>
    browser
      .loadPage('/', { query: { 'a b': 'München', x: 0 } })
      .waitForPath('/?a%20b=M%C3%BCnchen&x=0', 100));

  it('with a query string and query arg', () =>
    browser
      .loadPage('/?x=0', { query: { 'a b': 'München' } })
      .waitForPath('/?x=0&a%20b=M%C3%BCnchen', 100));

  it('with a query string, hash and query arg', () =>
    browser
      .loadPage('/?x=0#test', { query: { 'a b': 'München' } })
      .waitForPath('/?x=0&a%20b=M%C3%BCnchen#test', 100));

  it('by clicking a link', async () => {
    await browser.loadPage('/').clickOn('.link-to-other-page');

    assert.strictEqual(await browser.getPath(), '/other-page.html');
  });

  it('by refreshing', async () => {
    await browser.loadPage('/');

    await browser.safeExecute(
      /* eslint-disable no-var, no-undef */
      `(${function changePage() {
        var el = document.createElement('div');
        el.className = 'exists-before-refresh';
        document.body.appendChild(el);
      }.toString()})();`
      /* eslint-enable no-var, no-undef */
    );

    await browser
      // Making sure the element exists
      .assertElementExists('.exists-before-refresh')
      .refresh()
      // The element should not be gone.
      .assertElementDoesntExist('.exists-before-refresh');
  });

  describe('waiting for a url', () => {
    it('can work with a string', async () => {
      await browser.navigateTo('/redirect-after.html');
      assert.strictEqual(await browser.getStatusCode(), 200);

      await browser.waitForPath('/index.html');
    });

    it('can work with a regex', async () => {
      await browser.navigateTo('/redirect-after.html');
      assert.strictEqual(await browser.getStatusCode(), 200);

      await browser.waitForUrl(/\/index.html/);
    });

    it('can fail', async () => {
      await browser.navigateTo('/index.html');
      assert.strictEqual(await browser.getStatusCode(), 200);

      await assert.rejects(
        () => browser.waitForUrl('/some-random-place.html', 5),
        /Condition wasn't satisfied!/
      );
    });

    describe('groks url and query object', () => {
      it('can make its own query regexp', async () => {
        await browser.navigateTo('/redirect-to-query.html');
        await browser.waitForUrl('/index.html', {
          'a b': 'A B',
          c: '1,7',
        });
        assert.strictEqual(await browser.getStatusCode(), 200);
      });

      it('can find query arguments in any order', async () => {
        await browser.navigateTo('/redirect-to-query.html');
        await browser.waitForUrl('/index.html', {
          c: '1,7',
          'a b': 'A B',
        });
      });

      it('can handle regexp query arguments', async () => {
        await browser.navigateTo('/redirect-to-query.html');
        await browser.waitForUrl('/index.html', {
          c: /[\d,]+/,
          'a b': 'A B',
        });
      });

      it('detects non-matches too', async () => {
        await browser.navigateTo('/redirect-to-query.html');

        await assert.rejects(
          () => browser.waitForUrl('/index.html', { no: 'q' }, 200),
          /Condition wasn't satisfied!/
        );
      });
    });
  });

  describe('waiting for a path', () => {
    it('can work with a string', () =>
      browser
        .navigateTo('/redirect-after.html')
        .assertStatusCode(200)
        .waitForPath('/index.html'));

    it('can work with a regex', () =>
      browser
        .navigateTo('/redirect-after.html')
        .assertStatusCode(200)
        .waitForPath(/index.html/));
  });

  describe('loadPage', () => {
    describe('verifies status 200 by default', () => {
      it('and resolves', () =>
        browser.loadPage('/').assertElementExists('.link-to-other-page'));

      it('and rejects', async () => {
        await assert.rejects(browser.loadPage('/missing'), err => {
          assert.match(err.message, /Expected: 200\nActually: 404/);
          return true;
        });
      });
    });

    describe('accepts a regexp for expectedStatusCode', () => {
      it('and resolves', () =>
        browser.loadPage('/missing', { expectedStatusCode: /^404$/ }));

      it('and rejects', async () => {
        await assert.rejects(
          browser.loadPage('/', { expectedStatusCode: /^404$/ }),
          err => {
            assert.strictEqual(
              err.message,
              "Pattern /^404$/ doesn't match statusCode\nActually: 200"
            );

            return true;
          }
        );
      });
    });

    describe('accepts a function for expectedStatusCode', () => {
      it('and resolves', () =>
        browser.loadPage('/missing', {
          expectedStatusCode(s) {
            return s / 2 === 202;
          },
        }));

      it('and rejects', async () => {
        await assert.rejects(
          browser.loadPage('/', {
            expectedStatusCode() {
              return false;
            },
          }),
          /StatusCode is as expected/
        );
      });
    });

    describe('waiting for load event', () => {
      it('happens by default', async () => {
        await browser.loadPage('/index.html');
        const state = await browser.safeExecute(
          `(${function getDocumentState() {
            /* eslint-disable-next-line no-undef */
            return document.readyState;
          }})();`
        );
        assert.strictEqual(state, 'complete');
      });

      it('can be overridden without browser rejecting', async () => {
        await browser.loadPage('/index.html', {
          waitForLoadEvent: false,
        });
      });
    });
  });

  describe('waiting for document states', () => {
    describe('wait for document finished loading but sub-resources are still loading', () => {
      it('resolves', async () => {
        await browser.loadPage('/').waitForDocumentReady();
      });
    });
    describe('wait for document sub-resources have finished loading', () => {
      it('resolves', async () => {
        await browser.loadPage('/').waitForLoadEvent();
      });
    });
  });

  describe('getUrlObj', () => {
    it('returns an instance of URL', async () => {
      const urlObj = await browser.loadPage('/?x=0').getUrlObj();

      assert.ok(urlObj instanceof URL);
    });
  });
});
