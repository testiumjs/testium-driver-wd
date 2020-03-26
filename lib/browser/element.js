/*
 * Copyright (c) 2015, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const assert = require('assertive');
const _ = require('lodash');

const asserters = require('./_asserters');

exports.getElementOrNull = function getElementOrNull(selector) {
  return this.elementByCssSelectorOrNull(selector);
};

exports.getElement = function getElement(selector) {
  return this.elementByCssSelectorOrNull(selector).then(element => {
    if (element === null) {
      throw new Error(`Element not found for selector: ${selector}`);
    }
    return element;
  });
};

exports.getElements = function getElements(selector) {
  return this.elementsByCssSelector(selector);
};

// Our own version of wd's waitForElement.
// wd's version of waitFor* has the unfortunate habit of generating really
// unhelpful error messages.
// eslint-disable-next-line no-underscore-dangle
function _waitForElement(browser, selector, asserter, timeout, pollFreq) {
  /* eslint no-use-before-define:0 */
  timeout = timeout || 2000;
  pollFreq = pollFreq || 50;

  const endTime = Date.now() + timeout;

  function attempt() {
    const element = browser.elementByCssSelectorOrNull(selector);
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
      error.message = `Timeout (${timeout}ms): ${error.message}`;
      throw error;
    }
    return new Promise(resolve => setTimeout(resolve, pollFreq)).then(attempt);
  }

  return attempt();
}

exports.waitForElementDisplayed = function waitForElementDisplayed(
  selector,
  timeout
) {
  return _waitForElement(
    this,
    selector,
    asserters.isDisplayed(true, selector),
    timeout
  );
};

exports.waitForElementNotDisplayed = function waitForElementNotDisplayed(
  selector,
  timeout
) {
  return _waitForElement(
    this,
    selector,
    asserters.isDisplayed(false, selector),
    timeout
  );
};

exports.waitForElementExist = function waitForElementExist(
  selector,
  timeout,
  pollFreq
) {
  return _waitForElement(
    this,
    selector,
    asserters.exists(true, selector),
    timeout,
    pollFreq
  );
};

exports.waitForElementNotExist = function waitForElementNotExist(
  selector,
  timeout,
  pollFreq
) {
  return _waitForElement(
    this,
    selector,
    asserters.exists(false, selector),
    timeout,
    pollFreq
  );
};

exports.clickOn = function clickOn(selector) {
  return this.getElements(selector).then(elements => {
    if (elements.length === 1) {
      elements[0].click();
    } else if (elements.length > 1) {
      throw new Error(
        `selector "${selector}" matched more than 1 element. Use .clickOnAll() or a more specific selector instead.`
      );
    } else {
      throw new Error(`selector "${selector}" matched no element.`);
    }
  });
};
exports.clickOnAll = function clickOnAll(selector) {
  return this.getElements(selector).then(elementList =>
    Promise.all(elementList.map(elem => elem.click()))
  );
};

exports.assert = function _assert(asserter) {
  return asserter.assert(this);
};

exports.assertElement = function assertElement(selector, asserter) {
  assert.hasType('selector should be a string', String, selector);
  const element = this.elementsByCssSelector(selector).then(elements => {
    switch (elements.length) {
      case 0:
        throw new Error(`Element not found for selector: ${selector}`);

      case 1:
        return elements[0];

      default:
        throw new Error(
          `Selector ${selector} has ${elements.length} hits on the page, assertions require unique elements`
        );
    }
  });
  return element.then(asserter.assert).then(_.constant(element));
};

exports.assertElementIsDisplayed = function assertElementIsDisplayed(selector) {
  return this.assertElement(selector, asserters.isDisplayed(true, selector));
};

exports.assertElementNotDisplayed = function assertElementNotDisplayed(
  selector
) {
  return this.elementByCssSelectorOrNull(selector).then(
    asserters.isDisplayed(false, selector).assert
  );
};

exports.assertElementExists = function assertElementExists(selector) {
  return this.elementByCssSelectorOrNull(selector).then(
    asserters.exists(true, selector).assert
  );
};

exports.assertElementDoesntExist = function assertElementDoesntExist(selector) {
  return this.elementByCssSelectorOrNull(selector).then(
    asserters.exists(false, selector).assert
  );
};

exports.assertElementHasText = function assertElementHasText(
  selector,
  textOrRegExp
) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('text', textOrRegExp, true, selector)
  );
};

exports.assertElementLacksText = function assertElementLacksText(
  selector,
  textOrRegExp
) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('text', textOrRegExp, false, selector)
  );
};

exports.assertElementHasValue = function assertElementHasValue(
  selector,
  textOrRegExp
) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('getValue', textOrRegExp, true, selector)
  );
};

exports.assertElementLacksValue = function assertElementLacksValue(
  selector,
  textOrRegExp
) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('getValue', textOrRegExp, false, selector)
  );
};

exports.assertElementHasAttributes = function assertElementHasAttributes(
  selector,
  attributesObject
) {
  assert.hasType(
    'attributesObject should be an object',
    Object,
    attributesObject
  );
  return this.assertElement(selector, {
    assert: function assertAttributes(element) {
      return Promise.all(
        _.map(attributesObject, (val, attr) => {
          const actualVal = element.getAttribute(attr);
          return assert.equal(`attribute ${attr}`, val, actualVal);
        })
      );
    },
  });
};

exports.assertElementsNumber = function assertElementsNumber(
  selector,
  numOrObj
) {
  return this.elementsByCssSelector(selector).then(elems => {
    asserters.elementsNumber(numOrObj, selector).assert(elems);
    return elems;
  });
};
