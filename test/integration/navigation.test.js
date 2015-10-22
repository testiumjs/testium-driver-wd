import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

function assertRejects(promise) {
  return promise.then(() => {
    throw new Error('Did not fail as expected');
  }, error => error);
}

describe('navigation', () => {
  before(browser.beforeHook);

  it('supports just a path', async () => {
    await browser.navigateTo('/');
    assert.equal(200, await browser.getStatusCode());
  });

  it('supports query args', async () => {
    await browser.navigateTo('/', { query: { 'a b': 'München', x: 0 } });
    assert.equal(200, await browser.getStatusCode());

    await browser.waitForPath('/?a%20b=M%C3%BCnchen&x=0', 100);
  });

  it('with a query string and query arg', async () => {
    await browser.navigateTo('/?x=0', { query: { 'a b': 'München' } });
    assert.equal(200, await browser.getStatusCode());

    await browser.waitForPath('/?x=0&a%20b=M%C3%BCnchen', 100);
  });

  it('by clicking a link', async () => {
    await browser.navigateTo('/');
    assert.equal(200, await browser.getStatusCode());

    await browser
      .elementByCssSelector('.link-to-other-page')
      .click();

    assert.equal('/other-page.html', await browser.getPath());
  });

  it.only('by refreshing', async () => {
    await browser.navigateTo('/');
    assert.equal(200, await browser.getStatusCode());

    await browser.safeExecute('(' + function changePage() {
      /* eslint no-var:0 */
      var el = document.createElement('div');
      el.className = 'exists-before-refresh';
      document.body.appendChild(el);
    }.toString() + ')();');
    // Making sure the element exists
    await browser.elementByCssSelector('.exists-before-refresh');

    await browser.refresh();
    // The element should not be gone.
    assert.equal(null,
      await browser.elementByCssSelectorOrNull('.exists-before-refresh'));
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

      const error = await assertRejects(browser.waitForUrl('/some-random-place.html', 5));
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

        const error = await assertRejects(browser.waitForUrl('/index.html', { no: 'q' }, 200));
        assert.match(/Condition wasn't satisfied!/, error.message);
      });
    });
  });

  describe('waiting for a path', () => {
    it('can work with a string', async () => {
      await browser.navigateTo('/redirect-after.html');
      assert.equal(200, await browser.getStatusCode());

      await browser.waitForPath('/index.html');
    });

    it('can work with a regex', async () => {
      await browser.navigateTo('/redirect-after.html');
      assert.equal(200, await browser.getStatusCode());

      await browser.waitForPath(/index.html/);
    });
  });
});
