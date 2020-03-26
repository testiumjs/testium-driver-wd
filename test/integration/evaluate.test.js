'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const browserName = getConfig().get('browser');

describe('evaluate', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('runs JavaScript passed as a String', async () => {
    assert.equal(3, await browser.evaluate('return 3;'));
  });

  it('runs JavaScript passed as a Function', async () => {
    assert.equal(
      6,
      // eslint-disable-next-line prefer-arrow-callback
      await browser.evaluate(function() {
        return 6;
      })
    );
  });

  it('runs JavaScript passed as a Function with optional prepended args', async () => {
    assert.equal(
      18,
      // eslint-disable-next-line prefer-arrow-callback
      await browser.evaluate(3, 6, function(a, b) {
        return a * b;
      })
    );
  });
});

describe('evaluateAsync', () => {
  if (browserName === 'phantomjs') {
    it.skip(
      "skipping tests because browser phantomjs doesn't support evaluateAsync"
    );
    return;
  }

  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it('runs JavaScript passed as a Function', async () => {
    assert.equal(6, await browser.evaluateAsync(() => 6));
  });

  it('runs JavaScript passed as a Function with optional prepended args', async () => {
    assert.equal(18, await browser.evaluateAsync(3, 6, (a, b) => a * b));
  });

  it('runs JavaScript passed as an Async Function with promise', async () => {
    assert.equal(
      18,
      await browser.evaluateAsync(
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
  });

  it('runs JavaScript passed as an Async Function with promise and no param', async () => {
    assert.equal(
      'foo',
      await browser.evaluateAsync(() => {
        return Promise.resolve('foo');
      })
    );
  });

  it('runs JavaScript passed as an Async Function returns array', async () => {
    assert.deepEqual(
      [['foo']],
      await browser.evaluateAsync(() => {
        return Promise.resolve([['foo']]);
      })
    );
  });

  it('runs JavaScript passed as an Async Function with promise error', async () => {
    assert.equal(
      'promise error',
      await browser
        .evaluateAsync(() => Promise.reject(new Error('promise error')))
        .catch(error => error.message)
    );
  });

  it('runs JavaScript passed as an Async Function with exception', async () => {
    assert.equal(
      'async error',
      await browser
        .evaluateAsync(() => {
          throw new Error('async error');
        })
        .catch(error => error.message)
    );
  });
});
