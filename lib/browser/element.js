'use strict';

var assert = require('assertive');

// var STALE_MESSAGE = /stale element reference/;

// var NOT_FOUND_MESSAGE = new RegExp([
//   'Unable to locate element', // firefox message
//   'Unable to find element', // phantomjs message
//   'no such element', // chrome message
// ].join('|'));

// function visiblePredicate(shouldBeVisible, element) {
//   return element && element.isVisible() === shouldBeVisible;
// }

// function visibleFailure(shouldBeVisible, selector, timeout) {
//   throw new Error(util.format('Timeout (%dms) waiting for element (%s) to %sbe visible.',
//     timeout, selector, shouldBeVisible ? '' : 'not '));
// }

// // Curry some functions for later use
// var isVisiblePredicate = _.partial(visiblePredicate, true);
// var isntVisiblePredicate = _.partial(visiblePredicate, false);

// var isVisibleFailure = _.partial(visibleFailure, true);
// var isntVisibleFailure = _.partial(visibleFailure, false);

// function elementExistsPredicate(shouldBeVisible, element) {
//   return !!element === shouldBeVisible;
// }

// function elementExistsFailure(shouldBeVisible, selector, timeout) {
//   throw new Error(util.format('Timeout (%dms) waiting for element (%s) %sto exist in page.',
//     timeout, selector, shouldBeVisible ? '' : 'not '));
// }

// var elementDoesExistPredicate = _.partial(elementExistsPredicate, true);
// var elementDoesNotExistPredicate = _.partial(elementExistsPredicate, false);

// var elementDoesExistFailure = _.partial(elementExistsFailure, true);
// var elementDoesNotExistFailure = _.partial(elementExistsFailure, false);

// exports._forwarded = [
//   // TODO: port type assertion for selector to webdriver-http-sync
//   'getElements',
// ];

exports.getElementOrNull = function getElementOrNull(selector) {
  return this.elementByCssSelectorOrNull(selector);
};

exports.getElement = function getElement(selector) {
  var element = this.elementByCssSelectorOrNull(selector);
  assert.truthy('Element not found at selector: ' + selector, element);
  return element;
};

// exports.waitForElementVisible = function waitForElementVisible(selector, timeout) {
//   return this._waitForElement(selector, isVisiblePredicate, isVisibleFailure, timeout);
// };

// exports.waitForElementNotVisible = function waitForElementNotVisible(selector, timeout) {
//   return this._waitForElement(selector, isntVisiblePredicate, isntVisibleFailure, timeout);
// };

// exports.waitForElementExist = function waitForElementExist(selector, timeout) {
//   return this._waitForElement(selector,
//     elementDoesExistPredicate, elementDoesExistFailure, timeout);
// };

// exports.waitForElementNotExist = function waitForElementNotExist(selector, timeout) {
//   return this._waitForElement(selector,
//     elementDoesNotExistPredicate, elementDoesNotExistFailure, timeout);
// };

exports.clickOn = function clickOn(selector) {
  return this.getElement(selector).click();
};

exports.assert = function _assert(asserter) {
  return asserter.assert(this);
};

exports.assertElement = function assertElement(selector, asserter) {
  return asserter.assert(this);
};

exports.assertElementExists = function assertElementExists(selector) {
  return this.getElementOrNull(selector)
    .then(function checkElement(element) {
      assert.truthy('Element not found for selector: ' + selector, element);
    });
};

exports.assertElementDoesntExist = function assertElementDoesntExist(selector) {
  return this.getElementOrNull(selector)
    .then(function checkElement(element) {
      assert.falsey('Element found for selector: ' + selector, element);
    });
};

// function tryFindElement(self, selector, predicate, untilTime) {
//   var element;

//   while (Date.now() < untilTime) {
//     element = self.getElementWithoutError(selector);

//     try {
//       if (predicate(element)) {
//         return element;
//       }
//     } catch (exception) {
//       // Occasionally webdriver throws an error about the element reference being
//       // stale.  Let's handle that case as the element doesn't yet exist. All
//       // other errors are re thrown.
//       if (!STALE_MESSAGE.test(exception.toString())) {
//         throw exception;
//       }
//     }
//   }
//   return false;
// }

// // Where predicate takes a single parameter which is an element (or null) and
// // returns true when the wait is over
// exports._waitForElement = function _waitForElement(selector, predicate, failure, timeout) {
//   assert.hasType('`selector` as to be a String', String, selector);
//   timeout = timeout || 3000;

//   this.driver.setElementTimeout(timeout);
//   var foundElement = tryFindElement(this, selector, predicate, Date.now() + timeout);
//   this.driver.setElementTimeout(0);

//   if (foundElement === false) {
//     return failure(selector, timeout);
//   }

//   return foundElement;
// };
