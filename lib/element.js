'use strict';

exports.get = function get(name) {
  return this.getAttribute(name);
};

function firstOrNull(elements) {
  return elements[0] || null;
}

exports.getElementOrNull = function getElementOrNull(selector) {
  return this.elementsByCssSelector(selector)
    .then(firstOrNull);
};

exports.getElement = function getElement(selector) {
  return this.elementsByCssSelector(selector)
    .then(function rejectIfMissing(elements) {
      if (elements.length === 0) {
        throw new Error(
          'Element ' + selector +
          ' not found, use getElementOrNull if that\'s expected');
      }
      return elements[0];
    });
};

exports.getElements = function getElements(selector) {
  return this.elementsByCssSelector(selector);
};
