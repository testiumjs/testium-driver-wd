'use strict';

// This is a minimal version of `testium-mocha`.
// We're trying to avoid cyclic dependencies.
const getTestium = require('testium-core').getTestium;

const createDriver = require('../');

const browser = {};
exports.browser = browser;

browser.beforeHook = () => () =>
  getTestium({ driver: createDriver }).then(testium => {
    browser.__proto__ = testium.browser;
  });

after(() => browser && browser.quit && browser.quit());
