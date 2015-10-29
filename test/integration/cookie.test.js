import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('cookie', () => {
  before(browser.beforeHook);

  it('can be set individually', async () => {
    await browser.setCookie({
      name: 'test_cookie',
      value: '3',
    });

    const cookie = await browser.getCookie('test_cookie');
    assert.equal('3', cookie.value);
  });

  it('can be set in groups', async () => {
    await browser.setCookies([
      { name: 'test_cookie1', value: '5' },
      { name: 'test_cookie2', value: '7' },
    ]);

    const cookie1 = await browser.getCookie('test_cookie1');
    const cookie2 = await browser.getCookie('test_cookie2');

    assert.equal('5', cookie1.value);
    assert.equal('7', cookie2.value);
  });

  it('can be cleared as a group', async () => {
    await browser.setCookie({
      name: 'test_cookie',
      value: '9',
    });
    await browser.clearCookies();

    const cookies = await browser.getCookies();

    assert.equal(0, cookies.length);
  });

  it('can be cleared individually', async () => {
    await browser.setCookie({
      name: 'test_cookie',
      value: '4',
    });

    await browser.clearCookie('test_cookie');

    const cookie = await browser.getCookie('test_cookie');
    assert.falsey(cookie);
  });

  describe('setCookieValue', () => {
    before(() =>
      browser
        .navigateTo('/some/nested/url')
        .setCookie({ name: 'non_root', value: 'a' })
        .setCookieValue('root', 'b')
        .navigateTo('/'));

    it('can\'t read the non-root cookie', async () => {
      assert.falsey(await browser.getCookie('non_root'));
    });

    it('can read the root cookie', async () => {
      assert.truthy(await browser.getCookie('root'));
      assert.equal('b', await browser.getCookieValue('root'));
    });
  });
});
