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
          '- ' + propName + ': ' + stringify(actual),
        ].join('\n');
        throw new AssertionError(message);
      }
    });
  });
};
