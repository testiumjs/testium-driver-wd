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

const util = require('util');

const Asserter = require('wd').Asserter;
const assert = require('assert');

const Matchers = require('./_matchers');

/**
 * @param {any} actual
 * @param {number|RegExp|function} matcher
 */
function assertStatusCode(actual, matcher) {
  if (typeof matcher === 'number') {
    assert.strictEqual(
      actual,
      matcher,
      `StatusCode\nExpected: ${matcher}\nActually: ${actual}`
    );
  } else if (matcher instanceof RegExp) {
    assert.ok(
      matcher.test(`${actual}`),
      `Pattern ${matcher} doesn't match statusCode\nActually: ${actual}`
    );
  } else if (typeof matcher === 'function') {
    assert.ok(!!matcher(actual), 'StatusCode is as expected');
  } else {
    throw new Error(`Invalid expectedStatusCode option: ${actual}`);
  }
}

function propertyAsserter(property, expected) {
  const getter = `get${property[0].toUpperCase()}${property.slice(1)}`;
  return new Asserter(browser => {
    return browser[getter]().then(actual => {
      if (!Matchers.string(expected, actual)) {
        const err = new Error(
          util.format(
            'Timed out waiting for %s %s. Last value was: %j',
            property,
            expected,
            actual
          )
        );
        err.retriable = true;
        throw err;
      }
    });
  });
}

function urlAsserter(url, query) {
  function checkUrl(actualUrl) {
    if (!Matchers.url(url, query, actualUrl)) {
      const err = new Error(`Url did not match ${actualUrl}`);
      err.retriable = true;
      throw err;
    }
  }

  function getAndCheckUrl(browser) {
    return browser.getUrl().then(checkUrl);
  }

  return new Asserter(getAndCheckUrl);
}

/**
 * Wait for document to be in a certain state
 * https://github.com/admc/wd#waiting-for-something
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
 *
 * @param {object} self
 * @param {string} state
 * @param {number} [timeout] - Timeout for js condition to complete (optional)
 * @returns {Promise<boolean>}
 */
function waitForDocumentState(self, state, timeout) {
  let expr;
  timeout = timeout || 8000;

  switch (state) {
    case 'interactive':
      expr =
        "document.readyState === 'interactive' || document.readyState === 'complete'";
      break;
    case 'complete':
      expr = "document.readyState === 'complete'";
      break;
    default:
      throw new Error(
        'Document state doesn\'t match "interactive" or "complete"'
      );
  }

  self.setAsyncScriptTimeout(timeout + 250);
  return self.waitForConditionInBrowser(expr, timeout);
}

/**
 * @returns {Promise<string>}
 */
function getUrl() {
  return this.url();
}

/**
 * @returns {Promise<URL>}
 */
async function getUrlObj() {
  const url = await this.getUrl();
  return new URL(url);
}

/**
 * @returns {Promise<string>}
 */
async function getPath() {
  const urlObj = await this.getUrlObj();

  return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
}

/**
 * @param {string} url
 * @param {number | Record<string, any>?} query
 * @param {number?} timeout
 * @param {number?} pollFreq
 * @returns {Promise<void>}
 */
function waitForUrl(url, query, timeout, pollFreq) {
  if (typeof query === 'number') {
    timeout = query;
    query = {};
  }
  query = query || {};
  return this.waitFor(urlAsserter(url, query), timeout || 5000, pollFreq);
}

/**
 * @param {string} path
 * @param {number?} timeout
 * @param {number?} pollFreq
 * @returns {Promise<void>}
 */
function waitForPath(path, timeout, pollFreq) {
  return this.waitFor(
    propertyAsserter('path', path),
    timeout || 5000,
    pollFreq
  );
}

/**
 * Waits until the document ready state has been reached
 *
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
function waitForDocumentReady(timeout) {
  return waitForDocumentState(this, 'interactive', timeout);
}

/**
 * Waits until the document load state has been reached
 *
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
function waitForLoadEvent(timeout) {
  return waitForDocumentState(this, 'complete', timeout);
}

/**
 * @param {string} url - relative url
 * @param {{expectedStatusCode?: number, query?: Record<string, any>, headers?: Record<string, any>}?} options
 * @return {Promise<void>}
 *
 * @example browser.loadPage('/page')
 * @example browser.loadPage('/page', { expectedStatusCode: 500 })
 * @example browser.loadPage('/page', { query: { foo: 'bar' }})
 * @example browser.loadPage('/page', { headers: { 'x-foo': 'bar' }})
 */
async function loadPage(url, options) {
  options = options || {};

  let code = 200;
  if (options.expectedStatusCode) {
    code = options.expectedStatusCode;
    delete options.expectedStatusCode;
    if (typeof code === 'string') {
      code = parseInt(code, 10);
    }
  }

  const statusCode = await this.navigateTo(url, options).getStatusCode();

  assertStatusCode(statusCode, code);

  if (options.waitForLoadEvent !== false) {
    await this.waitForLoadEvent();
  }
}

module.exports = {
  getPath,
  getUrl,
  getUrlObj,
  loadPage,
  waitForDocumentReady,
  waitForLoadEvent,
  waitForPath,
  waitForUrl,
};
