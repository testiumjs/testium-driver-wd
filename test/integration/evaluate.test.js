'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const coroutine = require('bluebird').coroutine;

describe('evaluate', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it(
    'runs JavaScript passed as a String',
    coroutine(function*() {
      assert.equal(3, yield browser.evaluate('return 3;'));
    })
  );

  it(
    'runs JavaScript passed as a Function',
    coroutine(function*() {
      assert.equal(
        6,
        yield browser.evaluate(function() {
          return 6;
        })
      );
    })
  );

  it(
    'runs JavaScript passed as a Function with optional prepended args',
    coroutine(function*() {
      assert.equal(
        18,
        yield browser.evaluate(3, 6, function(a, b) {
          return a * b;
        })
      );
    })
  );
});
