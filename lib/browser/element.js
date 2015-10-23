'use strict';

var assert = require('assertive');
var Bluebird = require('bluebird');
var _ = require('lodash');

var asserters = require('./_asserters');

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

// Our own version of wd's waitForElement. Because reasons.
function _waitForElement(browser, selector, asserter, timeout, pollFreq) {
  /* eslint no-use-before-define:0 */
  timeout = timeout || 2000;
  pollFreq = pollFreq || 50;

  var endTime = Date.now() + timeout;

  function attempt() {
    var element = browser.elementByCssSelectorOrNull(selector);
    return element
      .then(asserter.assert)
      .catch(retry)
      .then(_.constant(element));
  }

  function retry(error) {
    if (!error.retriable) {
      throw error;
    }
    if (Date.now() >= endTime) {
      error.message = 'Timeout (' + timeout + 'ms): ' + error.message;
      throw error;
    }
    return Bluebird.delay(pollFreq).then(attempt);
  }

  return attempt();
}

exports.waitForElementDisplayed = function waitForElementDisplayed(selector, timeout) {
  return _waitForElement(this, selector, asserters.isDisplayed(true, selector), timeout);
};

exports.waitForElementNotDisplayed = function waitForElementNotDisplayed(selector, timeout) {
  return _waitForElement(this, selector, asserters.isDisplayed(false, selector), timeout);
};

exports.waitForElementExist = function waitForElementExist(selector, timeout, pollFreq) {
  return _waitForElement(this, selector, asserters.exists(true, selector), timeout, pollFreq);
};

exports.waitForElementNotExist = function waitForElementNotExist(selector, timeout, pollFreq) {
  return _waitForElement(this, selector, asserters.exists(false, selector), timeout, pollFreq);
};

exports.clickOn = function clickOn(selector) {
  return this.getElement(selector).click();
};

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
