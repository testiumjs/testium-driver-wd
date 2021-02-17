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

const assert = require('assert');

const asserters = require('./_asserters');

// Our own version of wd's waitForElement.
// wd's version of waitFor* has the unfortunate habit of generating really
// unhelpful error messages.
// eslint-disable-next-line no-underscore-dangle
function _waitForElement(browser, selector, asserter, timeout, pollFreq) {
  /* eslint no-use-before-define:0 */
  timeout = timeout || 2000;
  pollFreq = pollFreq || 50;

  const endTime = Date.now() + timeout;

  async function attempt() {
    const element = await browser.elementByCssSelectorOrNull(selector);

    try {
      await asserter.assert(element);
    } catch (e) {
      return retry(e);
    }

    return element;
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

/**
 * @param {string} selector
 * @return {Promise<Element|null>}
 */
function getElementOrNull(selector) {
  return this.elementByCssSelectorOrNull(selector);
}

/**
 * @param {string} selector
 * @return {Promise<Element>}
 */
async function getElement(selector) {
  const element = await this.elementByCssSelectorOrNull(selector);
  if (element === null) {
    throw new Error(`Element not found for selector: ${selector}`);
  }

  return element;
}

/**
 * @param {string} selector
 * @return {Promise<Element[]>}
 */
function getElements(selector) {
  return this.elementsByCssSelector(selector);
}

/**
 * @param {string} selector
 * @return {Promise<void>}
 */
async function clickOn(selector) {
  const elements = await this.getElements(selector);

  if (elements.length === 1) {
    elements[0].click();
  } else if (elements.length > 1) {
    throw new Error(
      `selector "${selector}" matched more than 1 element. Use .clickOnAll() or a more specific selector instead.`
    );
  } else {
    throw new Error(`selector "${selector}" matched no element.`);
  }
}

/**
 * @param {string} selector
 * @return {Promise<void>}
 */
async function clickOnAll(selector) {
  const elementList = await this.getElements(selector);
  await Promise.all(elementList.map(elem => elem.click()));
}

/**
 *
 * @param {import('wd').Asserter} asserter
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
function _assert(asserter) {
  return asserter.assert(this);
}

/**
 * @param {string} selector
 * @param {{[key:string]: Promise<function>}} asserter
 * @return {Promise<Element>}
 */
async function assertElement(selector, asserter) {
  assert.strictEqual(typeof selector, 'string', 'selector should be a string');

  const element = await this.elementsByCssSelector(selector).then(elements => {
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

  await asserter.assert(element);

  return element;
}

/**
 * @param {string} selector
 * @return {Promise<Element>}
 */
async function assertElementIsDisplayed(selector) {
  return await this.assertElement(
    selector,
    asserters.isDisplayed(true, selector)
  );
}

/**
 * @param {string} selector
 * @return {Promise<Element>}
 */
async function assertElementNotDisplayed(selector) {
  const element = await this.elementByCssSelectorOrNull(selector);
  await asserters.isDisplayed(false, selector).assert(element);

  return element;
}

/**
 * @param {string} selector
 * @return {Promise<Element>}
 */
async function assertElementExists(selector) {
  const element = await this.elementByCssSelectorOrNull(selector);
  await asserters.exists(true, selector).assert(element);

  return element;
}

/**
 * @param {string} selector
 * @return {Promise<null>}
 */
async function assertElementDoesntExist(selector) {
  const element = await this.elementByCssSelectorOrNull(selector);
  await asserters.exists(false, selector).assert(element);

  return null;
}

/**
 * @param {string} selector
 * @param {string|RegExp} textOrRegExp
 * @return {Promise<Element>}
 */
function assertElementHasText(selector, textOrRegExp) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('text', textOrRegExp, true, selector)
  );
}

/**
 * @param {string} selector
 * @param {string|RegExp} textOrRegExp
 * @return {Promise<Element>}
 */
function assertElementLacksText(selector, textOrRegExp) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('text', textOrRegExp, false, selector)
  );
}

/**
 * @param {string} selector
 * @param {string|RegExp} textOrRegExp
 * @return {Promise<Element>}
 */
function assertElementHasValue(selector, textOrRegExp) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('getValue', textOrRegExp, true, selector)
  );
}

/**
 * @param {string} selector
 * @param {string|RegExp} textOrRegExp
 * @return {Promise<Element>}
 */
function assertElementLacksValue(selector, textOrRegExp) {
  return this.assertElement(
    selector,
    asserters.fuzzyString('getValue', textOrRegExp, false, selector)
  );
}

/**
 * @param {string} selector
 * @param {string} attribute
 * @return {Promise<Element>}
 */
function assertElementHasAttribute(selector, attribute) {
  assert.strictEqual(
    typeof attribute,
    'string',
    `attribute must by of type string`
  );

  function assertAttribute(element) {
    return element.getAttribute(attribute).then(actual => {
      assert.notStrictEqual(actual, null);
    });
  }

  return this.assertElement(selector, { assert: assertAttribute });
}

/**
 * @param {string} selector
 * @param {Record<string, any>} attributes
 * @return {Promise<Element>}
 */
function assertElementHasAttributes(selector, attributes) {
  assert.ok(
    /^\[object\sObject]$/.test(Object.prototype.toString.call(attributes)),
    'attributes should be an object'
  );

  function assertAttributes(element) {
    const assertions = Object.entries(attributes).map(([attr, expected]) => {
      return element.getAttribute(attr).then(actual => {
        assert.strictEqual(
          actual,
          expected,
          `Assertion failed: attribute "${attr}"\nExpected: "${expected}"\nActually: ${actual}`
        );
      });
    });
    return Promise.all(assertions);
  }

  return this.assertElement(selector, { assert: assertAttributes });
}

/**
 * @param {string} selector
 * @param {string} attribute
 * @return {Promise<Element>}
 */
function assertElementLacksAttribute(selector, attribute) {
  assert.strictEqual(
    typeof attribute,
    'string',
    `attribute must by of type string`
  );

  return this.assertElementLacksAttributes(selector, [attribute]);
}

/**
 * @param {string} selector
 * @param {string[]} attributes
 * @return {Promise<Element>}
 */
function assertElementLacksAttributes(selector, attributes) {
  assert.ok(
    Array.isArray(attributes),
    'attributes should be an Array or strings'
  );

  function assertAttributes(element) {
    const assertions = attributes.map(attr => {
      return element.getAttribute(attr).then(actual => {
        assert.strictEqual(
          actual,
          null,
          `Assertion failed: attribute "${attr}" exists`
        );
      });
    });
    return Promise.all(assertions);
  }

  return this.assertElement(selector, { assert: assertAttributes });
}

/**
 *
 * @param {string} selector
 * @param {string|{min?: number, eq?: number, max?: number}} numOrObj
 * @return {Promise<Element[]>}
 *
 * @example browser.assertElementsNumber('.el', 3)
 * @example browser.assertElementsNumber('.el', { eq: 3 })
 * @example browser.assertElementsNumber('.el', { min: 1 })
 * @example browser.assertElementsNumber('.el', { max: 10 })
 * @example browser.assertElementsNumber('.el', { min: 1, max: 10 })
 */
async function assertElementsNumber(selector, numOrObj) {
  const elements = await this.elementsByCssSelector(selector);
  await asserters.elementsNumber(numOrObj, selector).assert(elements);

  return elements;
}

/**
 * @param {string} selector
 * @param {number?} timeout
 * @return {Promise<Element>}
 */
function waitForElementDisplayed(selector, timeout) {
  return _waitForElement(
    this,
    selector,
    asserters.isDisplayed(true, selector),
    timeout
  );
}

/**
 * @param {string} selector
 * @param {number?} timeout
 * @return {Promise<Element>}
 */
function waitForElementNotDisplayed(selector, timeout) {
  return _waitForElement(
    this,
    selector,
    asserters.isDisplayed(false, selector),
    timeout
  );
}

/**
 * @param {string} selector
 * @param {number?} timeout
 * @param {number?} pollFreq
 * @return {Promise<Element>}
 */
function waitForElementExist(selector, timeout, pollFreq) {
  return _waitForElement(
    this,
    selector,
    asserters.exists(true, selector),
    timeout,
    pollFreq
  );
}

/**
 * @param {string} selector
 * @param {number?} timeout
 * @param {number?} pollFreq
 * @return {Promise<null>}
 */
function waitForElementNotExist(selector, timeout, pollFreq) {
  return _waitForElement(
    this,
    selector,
    asserters.exists(false, selector),
    timeout,
    pollFreq
  );
}

module.exports = {
  assert: _assert,
  assertElement,
  assertElementHasText,
  assertElementLacksText,
  assertElementHasValue,
  assertElementLacksValue,
  assertElementHasAttribute,
  assertElementHasAttributes,
  assertElementLacksAttribute,
  assertElementLacksAttributes,
  assertElementsNumber,
  assertElementExists,
  assertElementDoesntExist,
  assertElementIsDisplayed,
  assertElementNotDisplayed,
  clickOn,
  clickOnAll,
  getElement,
  getElements,
  getElementOrNull,
  waitForElementDisplayed,
  waitForElementNotDisplayed,
  waitForElementExist,
  waitForElementNotExist,
};
