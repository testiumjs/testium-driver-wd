'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

process.noDeprecation = true;

describe('cookie', () => {
  before(browser.beforeHook());

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

  it('can be set in groups with setCookieValues()', async () => {
    await browser.setCookieValues({
      test_cookie3: '9',
      test_cookie4: '11',
    });

    assert.strictEqual(await browser.getCookieValue('test_cookie3'), '9');
    assert.strictEqual(await browser.getCookieValue('test_cookie4'), '11');
  });

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

  describe('setCookieValue', () => {
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
  });
});
