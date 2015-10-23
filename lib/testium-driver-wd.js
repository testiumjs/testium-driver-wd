'use strict';

var debug = require('debug')('testium-driver-sync');
var _ = require('lodash');
var wd = require('wd');

var defaultMethods = [
  require('./browser/console'),
  require('./browser/cookie'),
  require('./browser/navigation'),
];

function initDriver(testium) {
  function applyMethods(methods) {
    _.each(methods, function add(fn, name) {
      wd.addPromiseChainMethod(name, fn);
    });
  }

  _.each(defaultMethods, applyMethods);

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
    .setPageSize({ height: 768, width: 1024 })
    .get(testium.getInitialUrl())
    .then(function addBrowser() {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
