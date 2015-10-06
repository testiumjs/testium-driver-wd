'use strict';

var wd = require('wd');

function initDriver(testium) {
  wd.addPromiseChainMethod('navigateTo', function(url, options) {
    options = options || {};
    return this.get(testium.getNewPageUrl(url));
  });

  var seleniumUrl = testium.config.get('selenium.serverUrl');
  var driver = wd.remote(seleniumUrl, 'promiseChain');

  var browser = driver.init({ browserName: testium.config.get('browser') });
  return browser.get(testium.getInitialUrl())
    .then(function() {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
