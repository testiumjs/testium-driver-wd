'use strict';

var wd = require('wd');

function initDriver(testium) {
  wd.addPromiseChainMethod('navigateTo', function(url, options) {
    options = options || {};
    return this.get(testium.getNewPageUrl(url));
  });

  wd.addPromiseChainMethod('clearCookies', function() {
    return this.deleteAllCookies();
  });

  wd.addPromiseChainMethod('setPageSize', function(size) {
    return this.setWindowSize(size.width, size.height);
  });

  wd.addPromiseChainMethod('getPageTitle', function() {
    return this.title();
  });

  var seleniumUrl = testium.config.get('selenium.serverUrl');
  var driver = wd.remote(seleniumUrl, 'promiseChain');

  var browser = driver.init({ browserName: testium.config.get('browser') });
  return browser
    .setPageSize({ height: 768, width: 1024 })
    .get(testium.getInitialUrl())
    .then(function() {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
