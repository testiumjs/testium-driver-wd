'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

process.noDeprecation = true;

describe('cookie', () => {
  before(browser.beforeHook());

  describe('clearCookies()', () => {
    it('can be cleared as a group', async () => {
      await browser.setCookie({
        name: 'test_cookie',
        value: '9',
        domain: '127.0.0.1',
        path: '/',
      });
      await browser.clearCookies();

      const cookies = await browser.getCookies();

      assert.strictEqual(cookies.length, 0);
    });

    it('can be cleared individually', async () => {
      await browser.setCookie({
        name: 'test_cookie',
        value: '4',
        domain: '127.0.0.1',
        path: '/',
      });

      await browser.clearCookie('test_cookie');
      const cookie = await browser.getCookie('test_cookie');

      assert.ok(!cookie);
    });
  });

  describe('getCookie()', () => {
    it('returns cookie object', async () => {
      await browser.setCookieValue('test_cookie', 'true');

      const cookie = await browser.getCookie('test_cookie');

      assert.strictEqual(typeof cookie, 'object');
      assert.strictEqual(cookie.value, 'true');
    });

    it("returns null when cookie doesn't exist", async () => {
      const cookie = await browser.getCookie('foo');

      assert.strictEqual(cookie, null);
    });
  });

  describe('getCookies()', () => {
    it('returns array of cookie objects', async () => {
      await browser.setCookieValue('test_cookie', 'true');

      const cookies = await browser.getCookies();

      assert.ok(Array.isArray(cookies));
      cookies.forEach(cookie => {
        assert.strictEqual(typeof cookie, 'object');
      });
    });

    it('returns empty array when no cookie exist', async () => {
      const cookies = await browser.clearCookies().getCookies();

      assert.deepStrictEqual(cookies, []);
    });

    it('filters out _testium_ internal cookies', async () => {
      await browser.setCookieValue('test_cookie', 'true');
      await browser.setCookieValue('_testium_', 'true');

      const cookies = await browser.getCookies();

      assert.ok(Array.isArray(cookies));
      cookies.forEach(cookie => {
        assert.strictEqual(typeof cookie, 'object');
      });
      assert.ok(!cookies.find(cookie => cookie.name.includes('_testium_')));
    });
  });

  describe('getCookieValue()', () => {
    it('returns cookie value when cookie exists', async () => {
      await browser.setCookieValue('test_cookie', 'true');

      const cookieValue = await browser.getCookieValue('test_cookie');

      assert.strictEqual(cookieValue, 'true');
    });

    it('returns undefined when cookie is missing', async () => {
      const cookie = await browser.clearCookies().getCookieValue('test_cookie');

      assert.strictEqual(cookie, undefined);
    });
  });

  describe('[deprecated] setCookies()', () => {
    it('can be set individually', async () => {
      await browser.setCookie({
        name: 'test_cookie',
        value: '3',
        path: '/',
        domain: '127.0.0.1',
      });

      const cookie = await browser.getCookie('test_cookie');

      assert.strictEqual(cookie.value, '3');
    });

    it('can be set in groups with deprecated setCookies()', async () => {
      await browser.setCookies([
        { name: 'test_cookie1', value: '5', domain: '127.0.0.1', path: '/' },
        { name: 'test_cookie2', value: '7', domain: '127.0.0.1', path: '/' },
      ]);

      const cookie1 = await browser.getCookie('test_cookie1');
      const cookie2 = await browser.getCookie('test_cookie2');

      assert.strictEqual(cookie1.value, '5');
      assert.strictEqual(cookie2.value, '7');
    });
  });

  describe('setCookieValue() & setCookieValues()', () => {
    before(() =>
      browser
        .loadPage('/some/nested/url', { expectedStatusCode: 404 })
        .setCookie({
          name: 'non_root',
          value: 'a',
          domain: '127.0.0.1',
          path: '/some/nested/url',
        })
        .setCookieValue('root', 'b')
        .loadPage('/')
    );

    it("can't read the non-root cookie", async () => {
      assert.ok(!(await browser.getCookie('non_root')));
    });

    it('can read the root cookie', async () => {
      assert.ok(await browser.getCookie('root'));
      assert.strictEqual(await browser.getCookieValue('root'), 'b');
    });

    it('throws for non-string values', async () => {
      await assert.rejects(() => browser.setCookieValue('root', 2));
    });

    it('can be set in groups with setCookieValues()', async () => {
      await browser.setCookieValues({
        test_cookie3: '9',
        test_cookie4: '11',
      });

      assert.strictEqual(await browser.getCookieValue('test_cookie3'), '9');
      assert.strictEqual(await browser.getCookieValue('test_cookie4'), '11');
    });
  });
});
