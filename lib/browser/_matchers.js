'use strict';

var parseUrl = require('url').parse;

var debug = require('debug')('testium-driver-sync:matchers');
var _ = require('lodash');

function string(expected, actual) {
  debug('string: %s === %s', expected, actual);
  if (typeof expected === 'string') {
    return expected === actual;
  } else if (_.isRegExp(expected)) {
    return expected.test(actual);
  }
  throw new Error('Invalid assertion: ' + expected);
}
exports.string = string;

function stringUnlessNull(expected, actual) {
  if (expected === null || expected === undefined) {
    debug('skipping: %s === %s', expected, actual);
    return true;
  }
  return string(expected, actual);
}
exports.stringUnlessNull = stringUnlessNull;

var BASIC_PROPERTIES = [ 'protocol', 'host', 'pathname', 'hash' ];
function url(expectedUrl, expectedQuery, actualUrl) {
  debug('url: %s === %s', expectedUrl, actualUrl, expectedQuery);
  if (_.isRegExp(expectedUrl)) {
    return expectedUrl.test(actualUrl);
  }

  var expected = parseUrl(expectedUrl, true);
  _.extend(expected.query, expectedQuery || {});

  var actual = parseUrl(actualUrl, true);

  var basicsEqual = _.every(BASIC_PROPERTIES, function checkProp(prop) {
    return stringUnlessNull(expected[prop], actual[prop]);
  });
  var queryEqual = _.every(expected.query, function checkQueryParam(value, key) {
    return string(value, actual.query[key]);
  });

  return basicsEqual && queryEqual;
}
exports.url = url;
