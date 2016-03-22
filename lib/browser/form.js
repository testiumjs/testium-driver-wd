'use strict';

var Bluebird = require('bluebird');
var _ = require('lodash');

exports.clear = function clear(selector) {
  return this.getElement(selector).clear();
};

exports.type = function type(selector, value) {
  return this.getElement(selector).type(value);
};

exports.clearAndType = function clearAndType(selector, value) {
  return this.getElement(selector).clear().type(value);
};

exports.fillFields = function fillFields(fields) {
  var self = this;
  function fillField(pair) {
    return self.clearAndType(pair[0], pair[1]);
  }

  return Bluebird.each(_.toPairs(fields), fillField);
};
