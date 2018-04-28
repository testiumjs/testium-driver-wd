'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

describe('evaluate', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it(
    'runs JavaScript passed as a String',
    co.wrap(function*() {
      assert.equal(3, yield browser.evaluate('return 3;'));
    })
  );

  it(
    'runs JavaScript passed as a Function',
    co.wrap(function*() {
      assert.equal(
        6,
        // eslint-disable-next-line prefer-arrow-callback
        yield browser.evaluate(function() {
          return 6;
        })
      );
    })
  );

  it(
    'runs JavaScript passed as a Function with optional prepended args',
    co.wrap(function*() {
      assert.equal(
        18,
        // eslint-disable-next-line prefer-arrow-callback
        yield browser.evaluate(3, 6, function(a, b) {
          return a * b;
        })
      );
    })
  );
});
