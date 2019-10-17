'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');

function assertRejects(promise) {
  return promise.then(
    () => {
      throw new Error('Did not fail as expected');
    },
    error => error
  );
}

describe('navigation', () => {
  before(browser.beforeHook());

  it('supports just a path', () =>
    browser.navigateTo('/').assertStatusCode(200));

  it('supports query args', () =>
    browser
      .navigateTo('/', { query: { 'a b': 'München', x: 0 } })
      .assertStatusCode(200)
      .waitForPath('/?a%20b=M%C3%BCnchen&x=0', 100));

  it('with a query string and query arg', () =>
    browser
      .navigateTo('/?x=0', { query: { 'a b': 'München' } })
      .assertStatusCode(200)
      .waitForPath('/?x=0&a%20b=M%C3%BCnchen', 100));

  it('by clicking a link', async () => {
    await browser
      .navigateTo('/')
      .assertStatusCode(200)
      .clickOn('.link-to-other-page');

    assert.equal('/other-page.html', await browser.getPath());
  });

  it('by refreshing', async () => {
    await browser.navigateTo('/').assertStatusCode(200);

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
      assert.equal(200, await browser.getStatusCode());

      await browser.waitForPath('/index.html');
    });

    it('can work with a regex', async () => {
      await browser.navigateTo('/redirect-after.html');
      assert.equal(200, await browser.getStatusCode());

      await browser.waitForUrl(/\/index.html/);
    });

    it('can fail', async () => {
      await browser.navigateTo('/index.html');
      assert.equal(200, await browser.getStatusCode());

      const error = await assertRejects(
        browser.waitForUrl('/some-random-place.html', 5)
      );
      assert.match(/Condition wasn't satisfied!/, error.message);
    });

    describe('groks url and query object', () => {
      it('can make its own query regexp', async () => {
        await browser.navigateTo('/redirect-to-query.html');
        await browser.waitForUrl('/index.html', {
          'a b': 'A B',
          c: '1,7',
        });
        assert.equal(200, await browser.getStatusCode());
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

        const error = await assertRejects(
          browser.waitForUrl('/index.html', { no: 'q' }, 200)
        );
        assert.match(/Condition wasn't satisfied!/, error.message);
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
        const err = await assert.rejects(browser.loadPage('/missing'));
        assert.match(/Expected:.+200[^]+Actually:.+404/, err.message);
      });
    });

    describe('accepts a regexp', () => {
      it('and resolves', () =>
        browser.loadPage('/missing', { expectedStatusCode: /^404$/ }));

      it('and rejects', async () => {
        const err = await assert.rejects(
          browser.loadPage('/', { expectedStatusCode: /^404$/ })
        );
        assert.include('/^404$/\nto match:', err.message);
      });
    });

    describe('accepts a function', () => {
      it('and resolves', () =>
        browser.loadPage('/missing', {
          expectedStatusCode(s) {
            return s / 2 === 202;
          },
        }));

      it('and rejects', async () => {
        const err = await assert.rejects(
          browser.loadPage('/', {
            expectedStatusCode() {
              return false;
            },
          })
        );
        assert.include('is as expected', err.message);
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
        assert.equal('complete', state);
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
});
