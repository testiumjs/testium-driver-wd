import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

function stripColors(message) {
  return message.replace(/\u001b\[[^m]*m/g, '');
}

function assertRejects(promise) {
  return promise.then(() => {
    throw new Error('Did not fail as expected');
  }, error => error);
}

describe('element', () => {
  before(browser.beforeHook);

  before(() => browser.navigateTo('/'));

  it('can get an element\'s text', async () => {
    const text = await browser.getElement('h1').text();
    assert.equal('Element text was not found', 'Test Page!', text);
  });

  it('can get special properties from an element', async () => {
    // the "checked" property (when it doesn't exist)
    // returns a non-standard response from selenium;
    // let's make sure we can handle it properly
    const element = await browser.getElement('#checkbox');
    const checked = await element.getAttribute('checked');
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
      const error = await assertRejects(browser.assertElementIsDisplayed('.non-existing'));
      const expectedError = 'Element not found for selector: .non-existing';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('fails if element exists, but is not visible', async () => {
      const error = await assertRejects(browser.assertElementIsDisplayed('#hidden_thing'));
      const expectedError = 'Element should be displayed for selector: #hidden_thing';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is visible', () =>
      browser.assertElementIsDisplayed('h1'));
  });

  describe('assertElementNotDisplayed', () => {
    it('succeeds if element does not exist', () =>
      browser.assertElementNotDisplayed('.non-existing'));

    it('fails if element exists, but is visible', async () => {
      const error = await assertRejects(browser.assertElementNotDisplayed('h1'));
      const expectedError = 'Element should not be displayed for selector: h1';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists and is not visible', () =>
      browser.assertElementNotDisplayed('#hidden_thing'));
  });

  describe('assertElementExists', () => {
    it('fails if element does not exist', async () => {
      const error = await assertRejects(browser.assertElementExists('.non-existing'));
      const expectedError = 'Element should exist for selector: .non-existing';
      assert.equal(expectedError, stripColors(error.message));
    });

    it('succeeds if element exists', () =>
      browser.assertElementExists('h1'));
  });

  describe('assertElementDoesntExist', () => {
    it('succeeds if element does not exist', () =>
      browser.assertElementDoesntExist('.non-existing'));

    it('fails if element exists', async () => {
      const error = await assertRejects(browser.assertElementDoesntExist('h1'));
      const expectedError = 'Element should not exist for selector: h1';
      assert.equal(expectedError, stripColors(error.message));
    });
  });

  describe('elementHasText', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasText('.only', 'only one here');
      assert.equal('resolve the element\'s class', 'only', await element.getAttribute('class'));
    });

    it('finds an element with the wrong text', async () => {
      const error = await assertRejects(browser.assertElementHasText('.only', 'the wrong text'));

      const expected = '.only should have text\n- needle: \"the wrong text\"\n- text: \"only one here\"';
      assert.equal(expected, stripColors(error.message));
    });

    it('finds no elements', async () => {
      const error = await assertRejects(
        browser.assertElementHasText('.does-not-exist', 'some text'));

      assert.equal('Element not found for selector: .does-not-exist', error.message);
    });

    it('finds many elements', async () => {
      const error = await assertRejects(browser.assertElementHasText('.message', 'some text'));

      assert.equal('Selector .message has 3 hits on the page, assertions require unique elements', error.message);
    });

    it('succeeds with empty string', () =>
      browser.assertElementHasText('#blank-input', ''));
  });

  describe('elementLacksText', () => {
    it('asserts an element lacks some text, and returns the element', async () => {
      const element = await browser.assertElementLacksText('.only', 'this text not present');
      assert.equal('resolve the element\'s class', 'only', await element.getAttribute('class'));
    });

    it('finds an element incorrectly having some text', async () => {
      const error = await assertRejects(browser.assertElementLacksText('.only', 'only'));

      const expected = '.only should not have text\n- needle: \"only\"\n- text: \"only one here\"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  describe('elementHasValue', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasValue('#text-input', 'initialvalue');
      assert.equal('resolve the element\'s id', 'text-input', await element.getAttribute('id'));
    });

    it('succeeds with empty string', () =>
      browser.assertElementHasValue('#blank-input', ''));
  });

  describe('elementLacksValue', () => {
    it('asserts an element lacks some value, and returns the element', async () => {
      const element = await browser.assertElementLacksValue('#text-input', 'this text not present');
      assert.equal('resolve the element\'s id', 'text-input', await element.getAttribute('id'));
    });

    it('finds an element incorrectly having some text', async () => {
      const error = await assertRejects(
        browser.assertElementLacksValue('#text-input', 'initialvalue'));

      const expected = '#text-input should not have value\n- needle: \"initialvalue\"\n- value: \"initialvalue\"';
      assert.equal(expected, stripColors(error.message));
    });
  });

  xdescribe('waitForElementExist', () => {
    before(() => browser.navigateTo('/dynamic.html'));

    it('finds an element after waiting', async () => {
      await browser.assertElementNotDisplayed('.load_later');
      await browser.waitForElementExist('.load_later');
    });

    it('finds a hidden element', async () => {
      await browser.assertElementNotDisplayed('.load_never');
      await browser.waitForElementExist('.load_never');
    });

    it('fails to find an element that never exists', async () => {
      const error = await assertRejects(browser.waitForElementExist('.does-not-exist', 10));
      assert.equal('Timeout (10ms) waiting for element (.does-not-exist) to exist in page.',
        error.message);
    });
  });

  xdescribe('waitForElementNotExist', () => {
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

  xdescribe('waitForElementVisible', () => {
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

  xdescribe('waitForElementNotVisible', () => {
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

  xdescribe('#getElement', () => {
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

  xdescribe('#getElements', () => {
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
