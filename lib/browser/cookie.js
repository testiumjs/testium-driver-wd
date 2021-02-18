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

const assert = require('assert');
const util = require('util');

const { getTestiumCookie } = require('testium-cookie');

/**
 *
 * @typedef {Object} Cookie
 * @property {string} name
 * @property {value} name
 * @property {string} path
 * @property {string} domain
 * @property {boolean} secure
 */

// BEGIN _testium_ cookie magic

/**
 * @param {string} name
 * @returns {Promise<any|undefined>}
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
async function _getTestiumCookieField(name) {
  const cookies = await this.allCookies().then(getTestiumCookie);

  return cookies[name];
}

/**
 * @param {string} name
 * @returns {Promise<void>}
 */
function clearCookie(name) {
  return this.deleteCookie(name);
}

/**
 * @returns {Promise<void>}
 */
function clearCookies() {
  return this.deleteAllCookies();
}

/**
 * @param {string} name
 * @returns {Cookie|null}
 */
async function getCookie(name) {
  const cookies = (await this.getCookies()) || [];

  return cookies.find(cookie => cookie.name === name) || null;
}

/**
 * @returns {Cookie[]}
 */
async function getCookies() {
  const cookies = (await this.allCookies()) || [];

  return cookies.filter(cookie => cookie.name !== '_testium_');
}

/**
 * @param {string} name
 * @returns {Promise<string|undefined>}
 */
async function getCookieValue(name) {
  const cookie = await this.getCookie(name);

  return (cookie && cookie.value) || undefined;
}

const setCookies = util.deprecate(async function (cookies) {
  await Promise.all(cookies.map(this.setCookie, this));
}, 'setCookies() has poor defaults, use setCookieValues() instead');

/**
 * @param {string} name
 * @param {string} value
 * @param {Record<string, any>?} options
 * @returns {Promise<void>}
 */
function setCookieValue(name, value, options = {}) {
  const cookie = {
    name,
    value,
    path: '/',
    domain: this.defaultCookieDomain || '127.0.0.1',
    secure: false,
    ...options,
  };
  return this.setCookie(cookie);
}

/**
 * @param {Record<string, string>} cookies
 * @returns {Promise<void>}
 */
async function setCookieValues(cookies) {
  const browser = this;

  await Promise.all(
    Object.entries(cookies).map(([key, value]) => {
      return browser.setCookieValue(key, value);
    })
  );
}

/**
 * @returns {Promise<number|undefined>}
 */
function getStatusCode() {
  return this._getTestiumCookieField('statusCode');
}

/**
 * @param {number} expectedStatus
 * @returns {Promise<void>}
 */
async function assertStatusCode(expectedStatus) {
  const actualStatus = await this.getStatusCode();
  assert.strictEqual(actualStatus, expectedStatus, 'statusCode');
}

/**
 * @param {string} name
 * @returns {Promise<any>}
 */
async function getHeader(name) {
  const headers = await this.getHeaders();
  return headers[name];
}

/**
 * @returns {Promise<Record<string, any>>}
 */
function getHeaders() {
  return this._getTestiumCookieField('headers');
}

module.exports = {
  _getTestiumCookieField,
  assertStatusCode,
  clearCookie,
  clearCookies,
  getStatusCode,
  getCookie,
  getCookies,
  getCookieValue,
  getHeader,
  getHeaders,
  setCookies,
  setCookieValue,
  setCookieValues,
};

// END _testium_ cookie magic
