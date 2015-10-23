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
  require('./browser/navigation'),
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

  wd.addPromiseChainMethod('navigateTo', function navigateTo(url, options) {
    options = options || {};
    var targetUrl = testium.getNewPageUrl(url, options);
    debug('navigateTo', targetUrl);
    return this.get(targetUrl);
  });

  wd.addPromiseChainMethod('setPageSize', function setPageSize(size) {
    return this.setWindowSize(size.width, size.height);
  });

  wd.addPromiseChainMethod('getPageTitle', function getPageTitle() {
    return this.title();
  });

  wd.addPromiseChainMethod('close', function close() {
    return this.quit();
  });

  var seleniumUrl = testium.config.get('selenium.serverUrl');
  var driver = wd.remote(seleniumUrl, 'promiseChain');

  var browser = driver.init({ browserName: testium.config.get('browser') });

  return browser
    .sessionCapabilities().then(function storeCapabilities(capabilities) {
      browser.capabilities = capabilities;
    })
    .setPageSize({ height: 768, width: 1024 })
    .get(testium.getInitialUrl())
    .then(function addBrowser() {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
