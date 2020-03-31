/* eslint-env browser */

'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assertive');

function stripColors(message) {
  return message.replace(/\u001b\[[^m]*m/g, '');
}

function assertRejects(promise) {
  return promise.then(
    () => {
      throw new Error('Did not fail as expected');
    },
    error => error
  );
}

describe('element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it("can get an element's text", async () => {
    const text = await browser.getElement('h1').text();
    assert.equal('Element text was not found', 'Test Page!', text);
  });

  it('can get special properties from an element', async () => {
    // the "checked" property (when it doesn't exist)
    // returns a non-standard response from selenium;
    // let's make sure we can handle it properly
    const element = await browser.getElement('#checkbox');
    const checked = await element.get('checked');
    assert.equal('checked is null', null, checked);
  });

  it('returns null when the element can not be found', async () => {
    const element = await browser.getElementOrNull('.non-existing');
    assert.equal('Element magically appeared on the page', null, element);
  });

  it('can get several elements', async () => {
    const elements = await browser.getElements('.message');
    assert.equal('Messages were not all found', 3, elements.length);
  });

  describe('assertElementIsDisplayed', () => {
    it('fails if element does not exist', async () => {
      const error = await assertRejects(
        browser.assertElementIsDisplayed('.non-existing')
      );
      const expectedError = 'Element not found for selector: .non-existing';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('fails if element exists, but is not visible', async () => {
      const error = await assertRejects(
        browser.assertElementIsDisplayed('#hidden_thing')
      );
      const expectedError = 'Element "#hidden_thing" should be displayed';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is visible', () =>
      browser.assertElementIsDisplayed('h1'));
  });

  describe('assertElementNotDisplayed', () => {
    it('fails if element does not exist', async () => {
      const error = await assertRejects(
        browser.assertElementNotDisplayed('.non-existing')
      );
      const expectedError = 'Element not found for selector: .non-existing';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('fails if element exists, but is visible', async () => {
      const error = await assertRejects(
        browser.assertElementNotDisplayed('h1')
      );
      const expectedError = 'Element "h1" shouldn\'t be displayed';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is not visible', () =>
      browser.assertElementNotDisplayed('#hidden_thing'));
  });

  describe('assertElementExists', () => {
    it('fails if element does not exist', async () => {
      const error = await assertRejects(
        browser.assertElementExists('.non-existing')
      );
      const expectedError = 'Element ".non-existing" should exist';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists', () => browser.assertElementExists('h1'));
  });

  describe('assertElementDoesntExist', () => {
    it('succeeds if element does not exist', () =>
      browser.assertElementDoesntExist('.non-existing'));

    it('fails if element exists', async () => {
      const error = await assertRejects(browser.assertElementDoesntExist('h1'));
      const expectedError = 'Element "h1" shouldn\'t exist';
      assert.equal(expectedError, stripColors(error.message));
    });
  });

  describe('Element clicking', () => {
    function setupClickEvent(selector, expectedClass) {
      return browser.evaluate(selector, expectedClass, (s, c) => {
        document.querySelectorAll(s).forEach(elem => {
          const event = () => elem.classList.add(c);
          elem.removeEventListener('click', event);
          elem.addEventListener('click', event);
        });
      });
    }

    describe('clickOn', () => {
      it('triggers click event', () =>
        setupClickEvent('.okay', 'only-once')
          .clickOn('.okay')
          .assertElementsNumber('.only-once', 1));

      it('throws when selector matches more than one element', async () => {
        const error = assertRejects(
          setupClickEvent('.message', 'only-one-message').clickOn('.message')
        );

        assert.equal(
          'selector ".message" matched more than 1 element. Use .clickOnAll() or a more specific selector instead',
          error
        );
      });

      it('throws when selector matches no element', () => {
        const error = assertRejects(browser.clickOn('.foo'));

        assert.equal('selector ".foo" matched no element.', error);
      });
    });

    describe('clickOnAll', () => {
      it('triggeres click event on all matching elements', () =>
        setupClickEvent('.message', 'clicked')
          .clickOnAll('.message')
          .assertElementsNumber('.clicked', 3));

      it("doesn't throw when selector doesn't match elements", async () => {
        const error = assertRejects(browser.clickOnAll('.foo'));

        assert.equal(undefined, error);
      });
    });
  });

  describe('elementHasText', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasText(
        '.only',
        'only one here'
      );
      assert.equal(
        "resolve the element's class",
        'only',
        await element.get('class')
      );
    });

    it('finds an element with the wrong text', async () => {
      const error = await assertRejects(
        browser.assertElementHasText('.only', 'the wrong text')
      );

      const expected =
        '.only should have text\n- needle: ' +
        '"the wrong text"\n- text: "only one here"';
      assert.equal(expected, stripColors(error.message));
    });

    it('finds no elements', async () => {
      const error = await assertRejects(
        browser.assertElementHasText('.does-not-exist', 'some text')
      );

      assert.equal(
        'Element not found for selector: .does-not-exist',
        error.message
      );
    });

    it('finds many elements', async () => {
      const error = await assertRejects(
        browser.assertElementHasText('.message', 'some text')
      );

      assert.equal(
        'Selector .message has 3 hits on the page, assertions ' +
          'require unique elements',
        error.message
      );
    });

    it('succeeds with empty string', () =>
      browser.assertElementHasText('#blank-input', ''));
  });

  describe('elementLacksText', () => {
    it('asserts an element lacks some text, and returns the element', async () => {
      const element = await browser.assertElementLacksText(
        '.only',
        'this text not present'
      );
      assert.equal(
        "resolve the element's class",
        'only',
        await element.get('class')
      );
    });

    it('finds an element incorrectly having some text', async () => {
      const error = await assertRejects(
        browser.assertElementLacksText('.only', 'only')
      );

      const expected =
        '.only should not have text\n- needle: ' +
        '"only"\n- text: "only one here"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  describe('elementHasValue', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasValue(
        '#text-input',
        'initialvalue'
      );
      assert.equal(
        "resolve the element's id",
        'text-input',
        await element.get('id')
      );
    });

    it('succeeds with empty string', () =>
      browser.assertElementHasValue('#blank-input', ''));
  });

  describe('elementLacksValue', () => {
    it('asserts an element lacks some value, and returns the element', async () => {
      const element = await browser.assertElementLacksValue(
        '#text-input',
        'this text not present'
      );
      assert.equal(
        "resolve the element's id",
        'text-input',
        await element.get('id')
      );
    });

    it('finds an element incorrectly having some text', async () => {
      const error = await assertRejects(
        browser.assertElementLacksValue('#text-input', 'initialvalue')
      );

      const expected =
        '#text-input should not have value\n- needle: ' +
        '"initialvalue"\n- value: "initialvalue"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  describe('elementHasAttributes', () => {
    before(() => browser.loadPage('/'));

    it('fails if element found does not have attrs', async () => {
      const error = await assertRejects(
        browser.assertElementHasAttributes('img.fail', { foo: 'bar' })
      );
      const expected =
        'Assertion failed: attribute foo\nExpected: "bar"\nActually: null';
      assert.equal(expected, stripColors(error.message));
    });

    it('passes if element found has given attrs', async () => {
      await browser.assertElementHasAttributes('img.fail', {
        alt: 'a non-existent image',
      });
    });
  });

  describe('assertElementsNumber', () => {
    before(() => browser.loadPage('/'));

    describe('with number argument', () => {
      it('fails if number of elements does not match', async () => {
        const error = await assertRejects(
          browser.assertElementsNumber('.message', 2)
        );
        const expected =
          'selector ".message" should match 2 elements - actually found 3';
        assert.equal(expected, stripColors(error.message));
      });

      it('passes for right number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', 3);
        assert.equal(3, elems.length);
      });
    });

    describe('with "equal" option argument', () => {
      it('fails if number of elements does not match', async () => {
        const error = await assertRejects(
          browser.assertElementsNumber('.message', { equal: 2 })
        );
        const expected =
          'selector ".message" should match 2 elements - actually found 3';
        assert.equal(expected, stripColors(error.message));
      });

      it('passes for right number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          equal: 3,
        });
        assert.equal(3, elems.length);
      });
    });

    describe('with "min" option argument', () => {
      before(() => browser.loadPage('/'));

      it('fails if number of elements does not match minimum', async () => {
        const error = await assertRejects(
          browser.assertElementsNumber('.message', { min: 5 })
        );
        const expected =
          'selector ".message" should have at least 5 elements - actually found 3';
        assert.equal(expected, stripColors(error.message));
      });

      it('passes for right minimum number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          min: 2,
        });
        assert.equal(3, elems.length);
      });
    });

    describe('with "max" option argument', () => {
      before(() => browser.loadPage('/'));

      it('fails if number of elements does not match maximum allowed elements', async () => {
        const error = await assertRejects(
          browser.assertElementsNumber('.message', { max: 1 })
        );
        const expected =
          'selector ".message" should have at most 1 elements - actually found 3';
        assert.equal(expected, stripColors(error.message));
      });

      it('passes for right amount of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          max: 5,
        });
        assert.equal(3, elems.length);
      });
    });
  });

  describe('waitForElementExist', () => {
    before(() => browser.loadPage('/dynamic.html'));

    it('finds an element after waiting', async () => {
      await browser.assertElementNotDisplayed('.load_later');
      await browser.waitForElementExist('.load_later');
    });

    it('finds a hidden element', async () => {
      await browser.assertElementNotDisplayed('.load_never');
      await browser.waitForElementExist('.load_never');
    });

    it('fails to find an element that never exists', async () => {
      const error = await assertRejects(
        browser.waitForElementExist('.does-not-exist', 10)
      );
      assert.equal(
        'Timeout (10ms): Element ".does-not-exist" should exist',
        error.message
      );
    });
  });

  describe('waitForElementNotExist', () => {
    beforeEach(() => browser.loadPage('/other-page.html'));

    /* eslint-disable no-undef, no-var, prefer-arrow-callback */
    function setupElement(keepAround) {
      // We are running this in the browser context, so no fancy ES6
      var el = document.createElement('div');
      el.textContent = 'Will go away';
      el.className = 'remove_later';
      document.body.appendChild(el);

      if (keepAround) return;
      setTimeout(function() {
        document.body.removeChild(el);
      }, 300);
    }
    /* eslint-enable no-undef, no-var, prefer-arrow-callback */

    it('succeeds once an element is gone', () =>
      browser
        .evaluate(setupElement)
        .assertElementIsDisplayed('.remove_later')
        .waitForElementNotExist('.remove_later'));

    it('fails when element still exists', async () => {
      await browser.evaluate(/* keepAround = */ true, setupElement);
      await browser.assertElementIsDisplayed('.remove_later');
      const error = await assertRejects(
        browser.waitForElementNotExist('.remove_later', 10)
      );
      assert.equal(
        'Timeout (10ms): Element ".remove_later" shouldn\'t exist',
        error.message
      );
    });
  });

  describe('waitForElementDisplayed', () => {
    before(() => browser.loadPage('/dynamic.html'));

    it('finds an element after waiting', () =>
      browser
        .assertElementNotDisplayed('.load_later')
        .waitForElementDisplayed('.load_later'));

    it('fails to find a visible element within the timeout', async () => {
      const error = await assertRejects(
        browser.waitForElementDisplayed('.load_never', 10)
      );
      assert.equal(
        'Timeout (10ms): Element ".load_never" should be displayed',
        error.message
      );
    });

    it('fails to find an element that never exists', async () => {
      const error = await assertRejects(
        browser.waitForElementDisplayed('.does-not-exist', 10)
      );
      assert.equal(
        'Timeout (10ms): Element not found for selector: .does-not-exist',
        error.message
      );
    });
  });

  describe('waitForElementNotDisplayed', () => {
    before(() => browser.loadPage('/dynamic.html'));

    it('does not find an existing element after waiting for it to disappear', () =>
      browser
        .assertElementIsDisplayed('.hide_later')
        .waitForElementNotDisplayed('.hide_later'));

    it('fails to find a not-visible element within the timeout', async () => {
      const error = await assertRejects(
        browser.waitForElementNotDisplayed('.hide_never', 10)
      );
      assert.equal(
        'Timeout (10ms): Element ".hide_never" shouldn\'t be displayed',
        error.message
      );
    });

    it('fails to find an element that never exists', async () => {
      const error = await assertRejects(
        browser.waitForElementNotDisplayed('.does-not-exist', 10)
      );
      assert.equal(
        'Timeout (10ms): Element not found for selector: .does-not-exist',
        error.message
      );
    });
  });

  describe('#getElement', () => {
    before(() => browser.loadPage('/'));

    it('succeeds if selector is a String', async () => {
      const element = await browser.getElement('body');
      await element.getElement('.message');
    });

    it('return null if not found an element on the message element', async () => {
      const messageElement = await browser.getElement('.message');
      const element = await messageElement.getElementOrNull('.message');
      assert.equal(null, element);
    });
  });

  describe('#getElements', () => {
    before(() => browser.loadPage('/'));

    it('succeeds if selector is a String', async () => {
      const element = await browser.getElement('body');
      const messages = await element.getElements('.message');
      assert.equal(3, messages.length);
    });

    it('return empty array if not found an element on the message element', async () => {
      const messageElement = await browser.getElement('.message');
      const elements = await messageElement.getElements('.message');
      assert.equal(0, elements.length);
    });
  });
});
