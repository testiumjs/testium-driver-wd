/*
 * Copyright (c) 2015, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
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
