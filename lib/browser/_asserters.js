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

var util = require('util');

var assert = require('assertive');
var Bluebird = require('bluebird');
var _ = require('lodash');
var wd = require('wd');

var matchers = require('./_matchers');

var Asserter = wd.Asserter;

function AssertionError() {
  Error.call(this);
  this.message = util.format.apply(util, arguments);
  this.retriable = true;

  Error.captureStackTrace(this, AssertionError);
}
util.inherits(AssertionError, Error);

exports.isDisplayed = function assertIsDisplayed(expected, selector) {
  return new Asserter(function testTarget(target) {
    if (!target) {
      throw new AssertionError('Element not found for selector: ' + selector);
    }

    return target.isDisplayed().then(function compareTo(actual) {
      if (actual !== expected) {
        throw new AssertionError('Element %j should%s be displayed',
          selector, (expected ? '' : 'n\'t'));
      }
    });
  });
};

exports.exists = function assertExists(expected, selector) {
  return new Asserter(function testTarget(target) {
    if (!!target !== expected) {
      throw new AssertionError('Element %j should%s exist',
        selector, (expected ? '' : 'n\'t'));
    }
  });
};

function stringify(value) {
  if (_.isRegExp(value)) {
    return '' + value;
  }
  return JSON.stringify(value);
}

function secondToLowerCase(first, second) {
  return second.toLowerCase();
}

function getterToPropName(propName) {
  return propName.replace(/^get([A-Z])/, secondToLowerCase);
}

exports.fuzzyString = function assertFuzzyString(extract, expected, shouldMatch, selector) {
  var propName;
  if (typeof extract === 'string') {
    propName = getterToPropName(extract);
    extract = _.method(extract);
  } else if (typeof extract === 'function') {
    propName = getterToPropName(extract.name);
  } else {
    throw new Error('Invalid extract: ' + extract);
  }
  var doc = selector + ' should ' + (shouldMatch ? '' : 'not ') + 'have ' + propName;

  return new Asserter(function testTarget(target) {
    return Bluebird.resolve(target).then(extract).then(function compareTo(actual) {
      assert.hasType(String, actual);
      var match = matchers.fuzzyString(expected, actual);
      if (match !== shouldMatch) {
        var message = [
          doc,
          '- needle: ' + stringify(expected),
          '- ' + propName + ': ' + stringify(actual)
        ].join('\n');
        throw new AssertionError(message);
      }
    });
  });
};

exports.elementsNumber = function assertElementsNumber(num, selector) {
  return new Asserter(function checkNum(elems) {
    var found = elems.length;
    if (found !== num) {
      throw new AssertionError(
        selector + ' should match ' + num + ' elements - actually found ' + found
      );
    }
  });
};
