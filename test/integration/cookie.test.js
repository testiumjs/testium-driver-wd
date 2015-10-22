import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('cookie', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  it('can be set individually', () => {
    browser.setCookie({
      name: 'test_cookie',
      value: '3',
    });

    const cookie = browser.getCookie('test_cookie');
    assert.equal('3', cookie.value);
  });

  it('can be set in groups', () => {
    browser.setCookies([
      { name: 'test_cookie1', value: '5' },
      { name: 'test_cookie2', value: '7' },
    ]);

    const cookie1 = browser.getCookie('test_cookie1');
    const cookie2 = browser.getCookie('test_cookie2');

    assert.equal('5', cookie1.value);
    assert.equal('7', cookie2.value);
  });

  it('can be cleared as a group', () => {
    browser.setCookie({
      name: 'test_cookie',
      value: '9',
    });
    browser.clearCookies();

    const cookies = browser.getCookies();

    assert.equal(0, cookies.length);
  });

  it('can be cleared individually', () => {
    browser.setCookie({
      name: 'test_cookie',
      value: '4',
    });

    browser.clearCookie('test_cookie');

    const cookie = browser.getCookie('test_cookie');
    assert.falsey(cookie);
  });
});
