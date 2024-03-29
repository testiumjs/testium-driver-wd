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
const { promisify } = require('util');

const { v1: uuidV1 } = require('uuid');

const debug = require('debug')('testium-driver-wd');
const wd = require('wd');

const delay = promisify(setTimeout);

wd.Q.longStackSupport = true;

const WD_INIT_TIMEOUT = 2000; // wait 2s for wd to init properly
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
  require('./browser/time'),
  require('./browser/window'),
  require('./browser/lighthouse'),
  require('./puppeteer'),
  /* eslint-enable */
];

const defaultElementMethods = require('./element');

function register(methods) {
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
  register(mixins);
}

function makeRequestId(currentTest) {
  // currently, per RFC 7230, allow all visible ASCII characters
  return `${currentTest} ${uuidV1()}`.replace(/[^ -~]+/g, '-');
}

function initWd(testium) {
  const driver = wd.remote(
    testium.config.get('selenium.serverUrl'),
    'promiseChain'
  );
  return driver.init(testium.config.get('desiredCapabilities'));
}

async function initDriver(testium) {
  // register non-element methods
  for (const method of defaultMethods) {
    register(method);
  }

  // register mixins
  testium.config.get('mixins.wd', []).forEach(applyMixin);

  // register element methods
  for (const [name, fn] of Object.entries(defaultElementMethods)) {
    wd.addElementPromiseChainMethod(name, fn);
  }

  let testiumRootWindow;

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

  // sometimes the promise from driver.init() never resolves, but if you
  // try init()ing again, it works... it's somehow correlated with seeing
  // ERROR:network_service_instance_impl.cc(978)] Network service crashed, restarting service.
  // in the chromedriver.log
  //
  // Not sure the better fix yet.  For now, we observe that:
  // 1. the browser promise resolves almost immediately when working, and hangs
  //    "forever" when not
  // 2. it always seems to work the 2nd time, so no need to loop
  let browserInited = false;
  let browser = initWd(testium);

  // Try to resolve the browser we got back, but if that takes too long, try
  //   initing again, and make the result of that our new browser object.
  // This is complicated by `browser` being a magical sort-of-Promise object
  //   that we need to keep the original of
  await Promise.race([
    browser.then(() => {
      debug('wd.init() completed on first try');
      browserInited = true;
    }),
    delay(WD_INIT_TIMEOUT).then(() => {
      // even if the first race condition succeeded, this one will still run,
      // so we need to make sure we don't always double-init
      if (!browserInited) {
        debug(
          `wd.init() did NOT complete in ${WD_INIT_TIMEOUT}ms; trying again`
        );
        browser = initWd(testium);
      }
      return browser;
    }),
  ]);

  browser.appUrl = `http://127.0.0.1:${testium.config.get('app.port')}`;
  browser.defaultCookieDomain = testium.config.get(
    'proxy.host',
    testium.config.get('proxy.tunnel.host', '127.0.0.1')
  );

  browser.capabilities = await browser.sessionCapabilities();
  debug('sessionCapabilities', browser.capabilities);

  await browser
    .windowHandle()
    .then(handle => {
      debug('Got root window handle', handle);
      testiumRootWindow = handle;
    })
    .setPageSize({ height: 1000, width: 1400 })
    .get(testium.getInitialUrl());

  testium.browser = browser;
  return testium;
}

module.exports = initDriver;
