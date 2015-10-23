'use strict';

exports.clearAndType = function clearAndType(selector, value) {
  return this.getElement(selector).clear().type(value);
};
