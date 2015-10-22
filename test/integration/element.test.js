import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

function stripColors(message) {
  return message.replace(/\u001b\[[^m]*m/g, '');
}

describe('element', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => browser.navigateTo('/'));

  it('can get an element\'s text', () => {
    const element = browser.getElement('h1');
    const text = element.get('text');
    assert.equal('Element text was not found', 'Test Page!', text);
  });

  it('can get special properties from an element', () => {
    // the "checked" property (when it doesn't exist)
    // returns a non-standard response from selenium;
    // let's make sure we can handle it properly
    const element = browser.getElement('#checkbox');
    const checked = element.get('checked');
    assert.equal('checked is null', null, checked);
  });

  it('returns null when the element can not be found', () => {
    const element = browser.getElement('.non-existing');
    assert.equal('Element magically appeared on the page', null, element);
  });

  it('can get several elements', () => {
    const elements = browser.getElements('.message');
    assert.equal('Messages were not all found', 3, elements.length);
  });

  describe('elementIsVisible', () => {
    it('fails if element does not exist', () => {
      const error = assert.throws(() => browser.assert.elementIsVisible('.non-existing'));
      const expectedError = 'Assertion failed: Element not found for selector: .non-existing\nExpected null to be truthy';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('fails if element exists, but is not visible', () => {
      const error = assert.throws(() => browser.assert.elementIsVisible('#hidden_thing'));
      const expectedError = 'Assertion failed: Element should be visible for selector: #hidden_thing\nExpected false to be truthy';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is visible', () => {
      browser.assert.elementIsVisible('h1');
    });
  });

  describe('elementNotVisible', () => {
    it('fails if element does not exist', () => {
      const error = assert.throws(() => browser.assert.elementNotVisible('.non-existing'));
      const expectedError = 'Assertion failed: Element not found for selector: .non-existing\nExpected null to be truthy';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('fails if element exists, but is visible', () => {
      const error = assert.throws(() => browser.assert.elementNotVisible('h1'));
      const expectedError = 'Assertion failed: Element should not be visible for selector: h1\nExpected true to be falsey';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is not visible', () => {
      browser.assert.elementNotVisible('#hidden_thing');
    });
  });

  describe('elementExists', () => {
    it('fails if element does not exist', () => {
      const error = assert.throws(() => browser.assert.elementExists('.non-existing'));
      const expectedError = 'Assertion failed: Element not found for selector: .non-existing\nExpected null to be truthy';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists', () => {
      browser.assert.elementExists('h1');
    });
  });

  describe('elementDoesntExist', () => {
    it('succeeds if element does not exist', () => {
      browser.assert.elementDoesntExist('.non-existing');
    });

    it('fails if element exists', () => {
      const error = assert.throws(() => browser.assert.elementDoesntExist('h1'));
      const expectedError = 'Assertion failed: Element found for selector: h1\nExpected Element to be falsey';
      assert.equal(expectedError, stripColors(error.message));
    });
  });

  describe('elementHasText', () => {
    it('finds and returns a single element', () => {
      const element = browser.assert.elementHasText('.only', 'only one here');
      assert.equal('resolve the element\'s class', 'only', element.get('class'));
    });

    it('finds an element with the wrong text', () => {
      const error = assert.throws(() =>
        browser.assert.elementHasText('.only', 'the wrong text'));

      const expected = 'Assertion failed: elementHasText: .only\ninclude expected needle to be found in haystack\n- needle: \"the wrong text\"\nhaystack: \"only one here\"';
      assert.equal(expected, stripColors(error.message));
    });

    it('finds no elements', () => {
      const error = assert.throws(() =>
        browser.assert.elementHasText('.does-not-exist', 'some text'));

      assert.equal('Element not found for selector: .does-not-exist', error.message);
    });

    it('finds many elements', () => {
      const error = assert.throws(() =>
        browser.assert.elementHasText('.message', 'some text'));

      assert.equal('assertion needs a unique selector!\n.message has 3 hits in the page', error.message);
    });

    it('succeeds with empty string', () => {
      browser.assert.elementHasText('#blank-input', '');
    });
  });

  describe('elementLacksText', () => {
    it('asserts an element lacks some text, and returns the element', () => {
      const element = browser.assert.elementLacksText('.only', 'this text not present');
      assert.equal('resolve the element\'s class', 'only', element.get('class'));
    });

    it('finds an element incorrectly having some text', () => {
      const error = assert.throws(() =>
        browser.assert.elementLacksText('.only', 'only'));

      const expected = 'Assertion failed: elementLacksText: .only\nnotInclude expected needle not to be found in haystack\n- needle: \"only\"\nhaystack: \"only one here\"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  describe('elementHasValue', () => {
    it('finds and returns a single element', () => {
      const element = browser.assert.elementHasValue('#text-input', 'initialvalue');
      assert.equal('resolve the element\'s id', 'text-input', element.get('id'));
    });

    it('succeeds with empty string', () => {
      browser.assert.elementHasValue('#blank-input', '');
    });
  });

  describe('elementLacksValue', () => {
    it('asserts an element lacks some value, and returns the element', () => {
      const element = browser.assert.elementLacksValue('#text-input', 'this text not present');
      assert.equal('resolve the element\'s id', 'text-input', element.get('id'));
    });

    it('finds an element incorrectly having some text', () => {
      const error = assert.throws(() =>
        browser.assert.elementLacksValue('#text-input', 'initialvalue'));

      const expected = 'Assertion failed: elementLacksValue: #text-input\nnotInclude expected needle not to be found in haystack\n- needle: \"initialvalue\"\nhaystack: \"initialvalue\"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  describe('waitForElementExist', () => {
    before(() => browser.navigateTo('/dynamic.html'));

    it('finds an element after waiting', () => {
      browser.assert.elementNotVisible('.load_later');
      browser.waitForElementExist('.load_later');
    });

    it('finds a hidden element', () => {
      browser.assert.elementNotVisible('.load_never');
      browser.waitForElementExist('.load_never');
    });

    it('fails to find an element that never exists', () => {
      const error = assert.throws(() =>
        browser.waitForElementExist('.does-not-exist', 10));
      assert.equal('Timeout (10ms) waiting for element (.does-not-exist) to exist in page.', error.message);
    });
  });

  describe('waitForElementNotExist', () => {
    beforeEach(() => browser.navigateTo('/other-page.html'));

    function setupElement(keepAround) {
      // We are running this in the browser context, so no fancy ES6
      /* eslint no-var:0 */
      var el = document.createElement('div');
      el.textContent = 'Will go away';
      el.className = 'remove_later';
      document.body.appendChild(el);

      if (keepAround) return;
      setTimeout(function removeElement() {
        document.body.removeChild(el);
      }, 300);
    }

    it('succeeds once an element is gone', () => {
      browser.evaluate(setupElement);
      browser.assert.elementIsVisible('.remove_later');
      browser.waitForElementNotExist('.remove_later');
    });

    it('fails when element still exists', () => {
      browser.evaluate(/* keepAround = */ true, setupElement);
      browser.assert.elementIsVisible('.remove_later');
      const error = assert.throws(() =>
        browser.waitForElementNotExist('.remove_later', 10));
      assert.equal('Timeout (10ms) waiting for element (.remove_later) not to exist in page.',
        error.message);
    });
  });

  describe('waitForElementVisible', () => {
    before(() => browser.navigateTo('/dynamic.html'));

    it('finds an element after waiting', () => {
      browser.assert.elementNotVisible('.load_later');
      browser.waitForElementVisible('.load_later');
    });

    it('fails to find a visible element within the timeout', () => {
      const error = assert.throws(() =>
        browser.waitForElementVisible('.load_never', 10));
      assert.equal('Timeout (10ms) waiting for element (.load_never) to be visible.', error.message);
    });

    it('fails to find an element that never exists', () => {
      const error = assert.throws(() =>
        browser.waitForElementVisible('.does-not-exist', 10));
      assert.equal('Timeout (10ms) waiting for element (.does-not-exist) to be visible.', error.message);
    });
  });

  describe('waitForElementNotVisible', () => {
    before(() => browser.navigateTo('/dynamic.html'));

    it('does not find an existing element after waiting for it to disappear', () => {
      browser.assert.elementIsVisible('.hide_later');
      browser.waitForElementNotVisible('.hide_later');
    });

    it('fails to find a not-visible element within the timeout', () => {
      const error = assert.throws(() =>
        browser.waitForElementNotVisible('.hide_never', 10));
      assert.equal('Timeout (10ms) waiting for element (.hide_never) to not be visible.', error.message);
    });

    it('fails to find an element that never exists', () => {
      const error = assert.throws(() =>
        browser.waitForElementNotVisible('.does-not-exist', 10));
      assert.equal('Timeout (10ms) waiting for element (.does-not-exist) to not be visible.', error.message);
    });
  });

  describe('#getElement', () => {
    before(() => browser.navigateTo('/'));

    it('succeeds if selector is a String', () => {
      const element = browser.getElement('body');
      element.getElement('.message');
    });

    it('return null if not found an element on the message element', () => {
      const messageElement = browser.getElement('.message');
      const element = messageElement.getElement('.message');
      assert.falsey(element);
    });
  });

  describe('#getElements', () => {
    before(() => browser.navigateTo('/'));

    it('succeeds if selector is a String', () => {
      const element = browser.getElement('body');
      element.getElements('.message');
    });

    it('return empty array if not found an element on the message element', () => {
      const messageElement = browser.getElement('.message');
      const elements = messageElement.getElements('.message');
      assert.equal(0, elements.length);
    });
  });
});
