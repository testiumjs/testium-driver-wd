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

var debug = require('debug')('testium-driver-wd');
var _ = require('lodash');
var wd = require('wd');
var assert = require('assertive');

var defaultMethods = [
  /* eslint-disable global-require */
  require('./browser/alert'),
  require('./browser/console'),
  require('./browser/cookie'),
  require('./browser/element'),
  require('./browser/evaluate'),
  require('./browser/form'),
  require('./browser/navigation'),
  require('./browser/page'),
  require('./browser/window')
  /* eslint-enable */
];

var defaultElementMethods = require('./element');

function applyMethods(methods) {
  _.each(methods, function add(fn, name) {
    wd.addPromiseChainMethod(name, fn);
  });
}

function applyMixin(mixin) {
  debug('Applying mixin to wd', mixin);
  // this is all to be bug-compatible with our old implementation, which
  // would parse a mixin path of "test/blah" the same as "./test/blah"
  var cwd = process.cwd();
  var paths = [path.resolve(cwd, mixin), path.resolve(cwd, 'node_modules', mixin)];
  var mixins;
  _.forEach(paths, function eachFile(mixinFile) {
    try {
      mixins = require(mixinFile); // eslint-disable-line global-require
      return false;
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err;
      return undefined;
    }
  });
  if (!mixins) {
    throw new Error('couldn\'t find ' + mixin + ' in ' + paths.join(' or '));
  }
  applyMethods(mixins);
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

  wd.addPromiseChainMethod('loadPage', function loadPage(url, options) {
    options = options || {};

    var code = 200;
    if (options.expectedStatusCode) {
      code = options.expectedStatusCode;
      delete options.statusCode;
      if (_.isString(code)) code = parseInt(code, 10);
    }

    var assertCode;
    if (_.isNumber(code)) {
      assertCode = function eq(s) { assert.equal('statusCode', code, s); };
    } else if (_.isRegExp(code)) {
      assertCode = function re(s) { assert.match('statusCode', code, '' + s); };
    } else if (_.isFunction(code)) {
      assertCode = function fn(s) {
        assert.expect('statusCode is as expected', code(s));
      };
    } else {
      throw new Error('invalid expectedStatusCode option: ' + code);
    }

    return this.navigateTo(url, options).getStatusCode().then(assertCode);
  });

  wd.addPromiseChainMethod('switchToDefaultWindow', function switchToDefaultWindow() {
    debug('Activate default window', testiumRootWindow);
    return this.window(testiumRootWindow);
  });

  var seleniumUrl = testium.config.get('selenium.serverUrl');
  var driver = wd.remote(seleniumUrl, 'promiseChain');

  var browser = driver.init({ browserName: testium.config.get('browser') });
  browser.appUrl = 'http://127.0.0.1:' + testium.config.get('app.port');
  browser.defaultCookieDomain = testium.config.get('proxy.host',
    testium.config.get('proxy.tunnel.host', '127.0.0.1'));

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
