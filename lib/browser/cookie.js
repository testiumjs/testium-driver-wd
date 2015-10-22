'use strict';

var Bluebird = require('bluebird');
var _ = require('lodash');

var getTestiumCookie = require('testium-cookie').getTestiumCookie;

exports.clearCookies = function clearCookies() {
  return this.deleteAllCookies();
};

exports.setCookies = function setCookies(cookies) {
  return Bluebird.all(cookies.map(this.setCookie, this));
};

exports.getCookie = function getCookie(name) {
  return this.getCookies()
    .then(_.partial(_.find, _, { name: name }));
};

exports.getCookies = function getCookies() {
  return this.allCookies()
    .then(_.partial(_.reject, _, { name: '_testium_' }));
};

exports.clearCookie = function clearCookie(name) {
  return this.deleteCookie(name);
};

// BEGIN _testium_ cookie magic

exports._getTestiumCookieField = function _getTestiumCookieField(name) {
  return this.allCookies()
    .then(getTestiumCookie)
    .then(_.property(name));
};

exports.getStatusCode = function getStatusCode() {
  return this._getTestiumCookieField('statusCode');
};

exports.getHeaders = function getHeaders() {
  return this._getTestiumCookieField('headers');
};

exports.getHeader = function getHeader(name) {
  return this.getHeaders().then(_.property(name));
};

// END _testium_ cookie magic
