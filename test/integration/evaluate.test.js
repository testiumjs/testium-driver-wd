'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');
const getConfig = require('testium-core').getConfig;

const browserName = getConfig().get('browser');

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

describe('evaluateAsync', () => {
  if (browserName === 'phantomjs') {
    xit(
      "skipping tests because browser phantomjs doesn't support evaluateAsync"
    );
    return;
  }

  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it(
    'runs JavaScript passed as a Function',
    co.wrap(function*() {
      assert.equal(6, yield browser.evaluateAsync(() => 6));
    })
  );

  it(
    'runs JavaScript passed as a Function with optional prepended args',
    co.wrap(function*() {
      assert.equal(18, yield browser.evaluateAsync(3, 6, (a, b) => a * b));
    })
  );

  it(
    'runs JavaScript passed as an Async Function with promise',
    co.wrap(function*() {
      assert.equal(
        18,
        yield browser.evaluateAsync(
          3,
          6,
          (a, b) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve(a * b);
              }, 1000);
            })
        )
      );
    })
  );

  it(
    'runs JavaScript passed as an Async Function with promise and no param',
    co.wrap(function*() {
      assert.equal(
        'foo',
        yield browser.evaluateAsync(() => {
          return Promise.resolve('foo');
        })
      );
    })
  );

  it(
    'runs JavaScript passed as an Async Function returns array',
    co.wrap(function*() {
      assert.deepEqual(
        [['foo']],
        yield browser.evaluateAsync(() => {
          return Promise.resolve([['foo']]);
        })
      );
    })
  );

  it(
    'runs JavaScript passed as an Async Function with promise error',
    co.wrap(function*() {
      assert.equal(
        'promise error',
        yield browser
          .evaluateAsync(() => Promise.reject(new Error('promise error')))
          .catch(error => error.message)
      );
    })
  );

  it(
    'runs JavaScript passed as an Async Function with exception',
    co.wrap(function*() {
      assert.equal(
        'async error',
        yield browser
          .evaluateAsync(() => {
            throw new Error('async error');
          })
          .catch(error => error.message)
      );
    })
  );
});
