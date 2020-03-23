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

const path = require('path');

const { v1: uuidV1 } = require('uuid');

const debug = require('debug')('testium-driver-wd');
const wd = require('wd');
const assert = require('assertive');
const { ensurePuppeteerPage, getDevice } = require('./puppeteer');

// Lighthouse uses node 8 syntax, so we need to make this optional
let lighthouse = null;
try {
  lighthouse = require('lighthouse');
} catch (e) {
  if (e.name !== 'SyntaxError') throw e;
}

wd.Q.longStackSupport = true;

const defaultMethods = [
  /* eslint-disable global-require */
  require('./browser/alert'),
  require('./browser/console'),
  require('./browser/cookie'),
  require('./browser/element'),
  require('./browser/evaluate'),
  require('./browser/form'),
  require('./browser/navigation'),
  require('./browser/page'),
  require('./browser/window'),
  require('./browser/lighthouse'),
  /* eslint-enable */
];

const defaultElementMethods = require('./element');

function applyMethods(methods) {
  for (const [name, fn] of Object.entries(methods)) {
    wd.addPromiseChainMethod(name, fn);
  }
}

function applyMixin(mixin) {
  debug('Applying mixin to wd', mixin);
  // this is all to be bug-compatible with our old implementation, which
  // would parse a mixin path of "test/blah" the same as "./test/blah"
  const cwd = process.cwd();
  const paths = [
    path.resolve(cwd, mixin),
    path.resolve(cwd, 'node_modules', mixin),
  ];
  let mixins;

  for (const mixinFile of paths) {
    try {
      // eslint-disable-next-line import/no-dynamic-require
      mixins = require(mixinFile);
      break;
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err;
      // eslint-disable-next-line consistent-return
    }
  }

  if (!mixins) {
    throw new Error(`couldn't find ${mixin} in ${paths.join(' or ')}`);
  }
  applyMethods(mixins);
}

function makeRequestId(currentTest) {
  // currently, per RFC 7230, allow all visible ASCII characters
  return `${currentTest} ${uuidV1()}`.replace(/[^ -~]+/g, '-');
}

/**
 * @param {string} type
 * @param {any} variable
 * @return {boolean}
 */
function isType(type, variable) {
  return (
    Object.getPrototypeOf(variable).constructor.name.toLowerCase() === type
  );
}

function assertStatusCode(actual, matcher) {
  if (isType('number', matcher)) {
    assert.equal('statusCode', matcher, actual);
  } else if (isType('regexp', matcher)) {
    assert.match('statusCode', matcher, `${actual}`);
  } else if (isType('function', matcher)) {
    assert.expect('statusCode is as expected', !!matcher(actual));
  } else {
    throw new Error(`invalid expectedStatusCode option: ${actual}`);
  }
}

function initDriver(testium) {
  for (const method of defaultMethods) {
    applyMethods(method);
  }

  testium.config.get('mixins.wd', []).forEach(applyMixin);

  for (const [name, fn] of Object.entries(defaultElementMethods)) {
    wd.addElementPromiseChainMethod(name, fn);
  }

  let testiumRootWindow;
  function storeWindowHandle(handle) {
    debug('Got root window handle', handle);
    testiumRootWindow = handle;
  }

  wd.addPromiseChainMethod('navigateTo', function navigateTo(url, options) {
    options = options || {};
    const currentTest = testium.browser.currentTest;
    if (currentTest) {
      options.headers = options.headers || {};
      if (!options.headers['x-request-id']) {
        options.headers['x-request-id'] = makeRequestId(currentTest);
      }
    }
    const targetUrl = testium.getNewPageUrl(url, options);
    debug('navigateTo', targetUrl, currentTest);
    return this.get(targetUrl);
  });

  wd.addPromiseChainMethod('loadPage', function loadPage(url, options) {
    options = options || {};

    let code = 200;
    if (options.expectedStatusCode) {
      code = options.expectedStatusCode;
      delete options.expectedStatusCode;
      if (isType('string', code)) code = parseInt(code, 10);
    }

    const waitForLoadEvent = options.waitForLoadEvent !== false;

    return this.navigateTo(url, options)
      .getStatusCode()
      .then(statusCode => assertStatusCode(statusCode, code))
      .then(() => waitForLoadEvent && this.waitForLoadEvent());
  });

  wd.addPromiseChainMethod(
    'switchToDefaultWindow',
    function switchToDefaultWindow() {
      debug('Activate default window', testiumRootWindow);
      return this.window(testiumRootWindow);
    }
  );

  wd.addPromiseChainMethod('getChromeDevtoolsPort', () =>
    testium.getChromeDevtoolsPort()
  );

  wd.addPromiseChainMethod('withPuppeteerPage', fn => {
    return ensurePuppeteerPage(testium).then(fn);
  });

  wd.addPromiseChainMethod('emulate', deviceDescriptor => {
    return ensurePuppeteerPage(testium).then(page =>
      page.emulate(getDevice(deviceDescriptor))
    );
  });

  wd.addPromiseChainMethod('getLighthouseData', function getLighthouseData(
    flags,
    config
  ) {
    if (!lighthouse) {
      throw new Error('Lighthouse requires a newer version of node');
    }
    const devtoolsPort = testium.getChromeDevtoolsPort();
    const options = Object.assign({ port: devtoolsPort }, flags);
    return this.url().then(url => {
      return lighthouse(url, options, config);
    });
  });

  const seleniumUrl = testium.config.get('selenium.serverUrl');
  const driver = wd.remote(seleniumUrl, 'promiseChain');

  const browser = driver.init(testium.config.get('desiredCapabilities'));
  browser.appUrl = `http://127.0.0.1:${testium.config.get('app.port')}`;
  browser.defaultCookieDomain = testium.config.get(
    'proxy.host',
    testium.config.get('proxy.tunnel.host', '127.0.0.1')
  );

  return browser
    .sessionCapabilities()
    .then(capabilities => {
      browser.capabilities = capabilities;
    })
    .windowHandle()
    .then(storeWindowHandle)
    .setPageSize({ height: 768, width: 1024 })
    .get(testium.getInitialUrl())
    .then(() => {
      testium.browser = browser;
      return testium;
    });
}

module.exports = initDriver;
