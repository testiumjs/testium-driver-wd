'use strict';

// This is a minimal version of `testium-mocha`.
// We're trying to avoid cyclic dependencies.
// eslint-disable-next-line import/no-extraneous-dependencies
const { getTestium } = require('testium-core');

const createDriver = require('..');

const browser = {};
exports.browser = browser;

browser.beforeHook = () => {
  const currentTest = new Error().stack
    .split(/\n/)[2]
    .replace(/.+\(.+\/(.+?)(?:\.test)\.(?:js|coffee):\d+:\d+\)$/, '$1');
  return () =>
    getTestium({ driver: createDriver, browser: 'chrome' }).then(testium => {
      browser.__proto__ = testium.browser;
      browser.__proto__.currentTest = currentTest;
    });
};

after(() => browser && browser.quit && browser.quit());
