'use strict';

const assert = require('assert');
const { getConfig } = require('testium-core');
const { browser } = require('../mini-testium-mocha');

const browserName = getConfig().get('browser');

describe('evaluation', () => {
  before(browser.beforeHook());

  describe('evaluate', () => {
    before(() => browser.loadPage('/'));

    it('runs JavaScript passed as a String', async () => {
      assert.strictEqual(await browser.evaluate('return 3;'), 3);
    });

    it('runs JavaScript passed as a Function', async () => {
      assert.strictEqual(
        // eslint-disable-next-line prefer-arrow-callback
        await browser.evaluate(function () {
          return 6;
        }),
        6
      );
    });

    it('runs JavaScript passed as a Function with optional prepended args', async () => {
      assert.strictEqual(
        // eslint-disable-next-line prefer-arrow-callback
        await browser.evaluate(3, 6, function (a, b) {
          return a * b;
        }),
        18
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

    before(() => browser.loadPage('/'));

    it('runs JavaScript passed as a Function', async () => {
      assert.strictEqual(await browser.evaluateAsync(() => 6), 6);
    });

    it('runs JavaScript passed as a Function with optional prepended args', async () => {
      assert.strictEqual(
        await browser.evaluateAsync(3, 6, (a, b) => a * b),
        18
      );
    });

    it('runs JavaScript passed as an Async Function with promise', async () => {
      assert.strictEqual(
        await browser.evaluateAsync(
          3,
          6,
          (a, b) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve(a * b);
              }, 1000);
            })
        ),
        18
      );
    });

    it('runs JavaScript passed as an Async Function with promise and no param', async () => {
      assert.strictEqual(
        await browser.evaluateAsync(() => {
          return Promise.resolve('foo');
        }),
        'foo'
      );
    });

    it('runs JavaScript passed as an Async Function returns array', async () => {
      assert.deepStrictEqual(
        await browser.evaluateAsync(() => {
          return Promise.resolve([['foo']]);
        }),
        [['foo']]
      );
    });

    it('runs JavaScript passed as an Async Function with promise error', async () => {
      assert.strictEqual(
        await browser
          .evaluateAsync(() => Promise.reject(new Error('promise error')))
          .catch(error => error.message),
        'promise error'
      );
    });

    it('runs JavaScript passed as an Async Function with exception', async () => {
      assert.strictEqual(
        await browser
          .evaluateAsync(() => {
            throw new Error('async error');
          })
          .catch(error => error.message),
        'async error'
      );
    });
  });
});
