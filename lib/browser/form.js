'use strict';

exports.clear = function clear(selector) {
  return this.getElement(selector).clear();
};

exports.type = function type(selector, value) {
  return this.getElement(selector).type(value);
};

exports.clearAndType = function clearAndType(selector, value) {
  return this.getElement(selector).clear().type(value);
};
