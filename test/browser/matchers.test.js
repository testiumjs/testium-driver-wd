'use strict';

const assert = require('assert');

const { url } = require('../../lib/browser/_matchers');

describe('Matchers', () => {
  describe('url', () => {
    it('can do regex matches', () => {
      assert.ok(url(/oo\/b/, {}, '/foo/bar'));
    });

    it('can do check query args', () => {
      assert.ok(
        url('/index.html', { a: '42', b: 'x y' }, '/index.html?b=x%20y&a=42')
      );
    });

    it('handles existing query params', () => {
      assert.ok(
        url('/index.html?a=42', { b: 'x y' }, '/index.html?b=x%20y&a=42')
      );
    });

    it('can handle a simple path', () => {
      assert.ok(url('/index.html', {}, 'http://example.com/index.html'));
    });

    it('compares full urls', () => {
      assert.ok(
        url(
          'http://example.com/index.html',
          {},
          'http://example.com/index.html'
        )
      );
    });

    it('compares the full url', () => {
      assert.ok(
        url(
          'http://example.com/index.html',
          {},
          'http://example.com/index.html'
        )
      );
    });
  });
});
