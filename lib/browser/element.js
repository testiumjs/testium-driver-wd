'use strict';

var assert = require('assertive');
var _ = require('lodash');

var asserters = require('./_asserters');

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
  return this.elementByCssSelectorOrNull(selector)
    .then(function rejectNullElement(element) {
      if (element === null) {
        throw new Error('Element not found for selector: ' + selector);
      }
      return element;
    });
};

exports.getElements = function getElements(selector) {
  return this.elementsByCssSelector(selector);
};

// exports.waitForElementVisible = function waitForElementVisible(selector, timeout) {
//   return this._waitForElement(selector, isVisiblePredicate, isVisibleFailure, timeout);
// };

// exports.waitForElementNotVisible = function waitForElementNotVisible(selector, timeout) {
//   return this._waitForElement(selector, isntVisiblePredicate, isntVisibleFailure, timeout);
// };

// exports.waitForElementExist = function waitForElementExist(selector, timeout) {
//   return this._waitForElement(selector, asserters.exists(selector, true), timeout);
// };

// exports.waitForElementNotExist = function waitForElementNotExist(selector, timeout) {
//   return this._waitForElement(selector,
//     elementDoesNotExistPredicate, elementDoesNotExistFailure, timeout);
// };

exports.clickOn = function clickOn(selector) {
  return this.getElement(selector).click();
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

exports.assert = function _assert(asserter) {
  return asserter.assert(this);
};

exports.assertElement = function assertElement(selector, asserter) {
  assert.hasType('selector should be a string', String, selector);
  var element = this.elementsByCssSelector(selector)
    .then(function ensureUnique(elements) {
      switch (elements.length) {
      case 0:
        throw new Error('Element not found for selector: ' + selector);

      case 1:
        return elements[0];

      default:
        throw new Error(
          'Selector .message has 3 hits on the page, assertions require unique elements');
      }
    });
  return element.then(asserter.assert).then(_.constant(element));
};

exports.assertElementIsDisplayed = function assertElementIsDisplayed(selector) {
  return this.assertElement(selector, asserters.isDisplayed(true, selector));
};

exports.assertElementNotDisplayed = function assertElementNotDisplayed(selector) {
  return this.elementByCssSelectorOrNull(selector)
    .then(asserters.isDisplayed(false, selector).assert);
};

exports.assertElementExists = function assertElementExists(selector) {
  return this.elementByCssSelectorOrNull(selector)
    .then(asserters.exists(true, selector).assert);
};

exports.assertElementDoesntExist = function assertElementDoesntExist(selector) {
  return this.elementByCssSelectorOrNull(selector)
    .then(asserters.exists(false, selector).assert);
};

exports.assertElementHasText = function assertElementHasText(selector, textOrRegExp) {
  return this.assertElement(selector,
    asserters.fuzzyString('text', textOrRegExp, true, selector));
};

exports.assertElementLacksText = function assertElementLacksText(selector, textOrRegExp) {
  return this.assertElement(selector,
    asserters.fuzzyString('text', textOrRegExp, false, selector));
};

exports.assertElementHasValue = function assertElementHasValue(selector, textOrRegExp) {
  return this.assertElement(selector,
    asserters.fuzzyString('getValue', textOrRegExp, true, selector));
};

exports.assertElementLacksValue = function assertElementLacksValue(selector, textOrRegExp) {
  return this.assertElement(selector,
    asserters.fuzzyString('getValue', textOrRegExp, false, selector));
};
