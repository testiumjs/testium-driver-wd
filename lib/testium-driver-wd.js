'use strict';

var path = require('path');

var debug = require('debug')('testium-driver-sync');
var _ = require('lodash');
var wd = require('wd');

var defaultMethods = [
  require('./browser/alert'),
  require('./browser/console'),
  require('./browser/cookie'),
  require('./browser/element'),
  require('./browser/evaluate'),
  require('./browser/form'),
  require('./browser/navigation'),
  require('./browser/page'),
  require('./browser/window'),
];

var defaultElementMethods = require('./element');

function applyMethods(methods) {
  _.each(methods, function add(fn, name) {
    wd.addPromiseChainMethod(name, fn);
  });
}

function applyMixin(mixin) {
  debug('Applying mixin to wd', mixin);
  var mixinFile = path.resolve(process.cwd(), mixin);
  applyMethods(require(mixinFile));
}

function initDriver(testium) {
  _.each(defaultMethods, applyMethods);
  _.each(testium.config.get('mixins.wd', []), applyMixin);

  _.each(defaultElementMethods, function add(fn, name) {
    wd.addElementPromiseChainMethod(name, fn);
  });

  var testiumRootWindow;
  function storeWindowHandle(handle) {
    debug('Got root window handle', handle);
    testiumRootWindow = handle;
  }

  wd.addPromiseChainMethod('navigateTo', function navigateTo(url, options) {
    options = options || {};
    var targetUrl = testium.getNewPageUrl(url, options);
    debug('navigateTo', targetUrl);
    return this.get(targetUrl);
  });

  wd.addPromiseChainMethod('switchToDefaultWindow', function switchToDefaultWindow() {
    debug('Activate default window', testiumRootWindow);
    return this.window(testiumRootWindow);
  });

  var seleniumUrl = testium.config.get('selenium.serverUrl');
  var driver = wd.remote(seleniumUrl, 'promiseChain');

  var browser = driver.init({ browserName: testium.config.get('browser') });
  browser.appUrl = 'http://127.0.0.1:' + testium.config.get('app.port');

  return browser
    .sessionCapabilities().then(function storeCapabilities(capabilities) {
      browser.capabilities = capabilities;
    })
    .windowHandle().then(storeWindowHandle)
    .setPageSize({ height: 768, width: 1024 })
    .get(testium.getInitialUrl())
    .then(function addBrowser() {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
