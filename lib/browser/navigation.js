'use strict';

var util = require('util');
var Url = require('url');

var debug = require('debug')('testium-driver-sync:navigation');
var _ = require('lodash');
var Asserter = require('wd').Asserter;

function compare(expected, actual) {
  debug('Compare: %s === %s', expected, actual);
  if (typeof expected === 'string') {
    return expected === actual;
  } else if (_.isRegExp(expected)) {
    return expected.test(actual);
  }
  throw new Error('Invalid assertion: ' + expected);
}

function compareAllowNull(expected, actual) {
  if (expected === null || expected === undefined) {
    debug('Skipping: %s === %s', expected, actual);
    return true;
  }
  return compare(expected, actual);
}

function propertyAsserter(property, expected) {
  var getter = 'get' + property[0].toUpperCase() + property.slice(1);
  return new Asserter(function checkProperty(browser) {
    return browser[getter]().then(function compareWith(actual) {
      if (!compare(expected, actual)) {
        var err = new Error(util.format(
          'Timed out waiting for %s %s. Last value was: %j',
          property, expected, actual));
        err.retriable = true;
        throw err;
      }
    });
  });
}

var BASIC_PROPERTIES = [
  'protocol', 'host', 'pathname', 'hash',
];
function urlAsserter(url, query) {
  if (_.isRegExp(url)) {
    return propertyAsserter('url', url);
  }

  var expected = Url.parse(url, true);
  _.extend(expected.query, query || {});

  function checkUrl(actualUrl) {
    var actual = Url.parse(actualUrl, true);
    var basicsEqual = _.every(BASIC_PROPERTIES, function checkProp(prop) {
      return compareAllowNull(expected[prop], actual[prop]);
    });
    var queryEqual = _.every(expected.query, function checkQueryParam(value, key) {
      return compare(value, actual.query[key]);
    });
    if (!basicsEqual || !queryEqual) {
      var err = new Error('Url did not match ' + actualUrl);
      err.retriable = true;
      throw err;
    }
  }

  function getAndCheckUrl(browser) {
    return browser.getUrl().then(checkUrl);
  }

  return new Asserter(getAndCheckUrl);
}

exports.getUrl = function getUrl() {
  return this.url();
};

exports.getPath = function getPath() {
  return this.getUrl().then(Url.parse).then(_.property('path'));
};

exports.waitForUrl = function waitForUrl(url, query, timeout, pollFreq) {
  if (typeof query === 'number') {
    timeout = query;
    query = {};
  }
  query = query || {};
  return this.waitFor(urlAsserter(url, query), timeout || 5000, pollFreq);
};

exports.waitForPath = function waitForPath(path, timeout, pollFreq) {
  return this.waitFor(propertyAsserter('path', path), timeout || 5000, pollFreq);
};
