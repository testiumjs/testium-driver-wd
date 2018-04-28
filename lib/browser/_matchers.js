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

const parseUrl = require('url').parse;

const debug = require('debug')('testium-driver-wd:matchers');
const _ = require('lodash');

function string(expected, actual) {
  debug('string: %s === %s', expected, actual);
  if (typeof expected === 'string') {
    return expected === actual;
  } else if (_.isRegExp(expected)) {
    return expected.test(actual);
  }
  throw new Error(`Invalid assertion: ${expected}`);
}
exports.string = string;

function fuzzyString(expected, actual) {
  debug('fuzzyString: %s === %s', expected, actual);
  if (expected === '') {
    return actual === '';
  } else if (typeof expected === 'string') {
    return actual.indexOf(expected) !== -1;
  } else if (_.isRegExp(expected)) {
    return expected.test(actual);
  }
  throw new Error(`Invalid assertion: ${expected}`);
}
exports.fuzzyString = fuzzyString;

function stringUnlessNull(expected, actual) {
  if (expected === null || expected === undefined) {
    debug('skipping: %s === %s', expected, actual);
    return true;
  }
  return string(expected, actual);
}
exports.stringUnlessNull = stringUnlessNull;

const BASIC_PROPERTIES = ['protocol', 'host', 'pathname', 'hash'];
function url(expectedUrl, expectedQuery, actualUrl) {
  debug('url: %s === %s', expectedUrl, actualUrl, expectedQuery);
  if (_.isRegExp(expectedUrl)) {
    return expectedUrl.test(actualUrl);
  }

  const expected = parseUrl(expectedUrl, true);
  _.extend(expected.query, expectedQuery || {});

  const actual = parseUrl(actualUrl, true);

  const basicsEqual = _.every(BASIC_PROPERTIES, prop =>
    stringUnlessNull(expected[prop], actual[prop])
  );
  const queryEqual = _.every(expected.query, (value, key) =>
    string(value, actual.query[key])
  );

  return basicsEqual && queryEqual;
}
exports.url = url;
