'use strict';

const assert = require('assertive');

const url = require('../../lib/browser/_matchers').url;

describe('Matchers', () => {
  describe('url', () => {
    it('can do regex matches', () => {
      assert.expect(url(/oo\/b/, {}, '/foo/bar'));
    });

    it('can do check query args', () => {
      assert.expect(
        url('/index.html', { a: '42', b: 'x y' }, '/index.html?b=x%20y&a=42')
      );
    });

    it('can handle a simple path', () => {
      assert.expect(url('/index.html', {}, 'http://example.com/index.html'));
    });

    it('compares the full url', () => {
      assert.expect(
        url(
          'http://example.com/index.html',
          {},
          'http://example.com/index.html'
        )
      );
    });
  });
});
