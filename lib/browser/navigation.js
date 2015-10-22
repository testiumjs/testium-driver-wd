'use strict';

var util = require('util');
var Url = require('url');

var _ = require('lodash');
var Asserter = require('wd').Asserter;

var Matchers = require('./_matchers');

function propertyAsserter(property, expected) {
  var getter = 'get' + property[0].toUpperCase() + property.slice(1);
  return new Asserter(function checkProperty(browser) {
    return browser[getter]().then(function compareWith(actual) {
      if (!Matchers.string(expected, actual)) {
        var err = new Error(util.format(
          'Timed out waiting for %s %s. Last value was: %j',
          property, expected, actual));
        err.retriable = true;
        throw err;
      }
    });
  });
}

function urlAsserter(url, query) {
  function checkUrl(actualUrl) {
    if (!Matchers.url(url, query, actualUrl)) {
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
