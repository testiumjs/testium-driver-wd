/* eslint-env browser */

'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assert');

function stripColors(message) {
  return message.replace(/\u001b\[[^m]*m/g, '');
}

describe('element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it("can get an element's text", async () => {
    const text = await browser.getElement('h1').text();

    assert.strictEqual(text, 'Test Page!', 'Element text was not found');
  });

  it('can get special properties from an element', async () => {
    // the "checked" property (when it doesn't exist)
    // returns a non-standard response from selenium;
    // let's make sure we can handle it properly
    const element = await browser.getElement('#checkbox');
    const checked = await element.get('checked');

    assert.strictEqual(checked, null, 'checked is null');
  });

  it('returns null when the element can not be found', async () => {
    const element = await browser.getElementOrNull('.non-existing');

    assert.strictEqual(element, null, 'Element magically appeared on the page');
  });

  it('can get several elements', async () => {
    const elements = await browser.getElements('.message');

    assert.strictEqual(elements.length, 3, 'Messages were not all found');
  });

  describe('assertElementIsDisplayed', () => {
    it('fails if element does not exist', async () => {
      await assert.rejects(
        () => browser.assertElementIsDisplayed('.non-existing'),
        err => {
          const expectedError = 'Element not found for selector: .non-existing';

          assert.strictEqual(stripColors(err.message), expectedError);
          return true;
        }
      );
    });

    it('fails if element exists, but is not visible', async () => {
      await assert.rejects(
        () => browser.assertElementIsDisplayed('#hidden_thing'),
        err => {
          const expectedError = 'Element "#hidden_thing" should be displayed';

          assert.strictEqual(stripColors(err.message), expectedError);
          return true;
        }
      );
    });

    it('succeeds if element exists and is visible', () =>
      browser.assertElementIsDisplayed('h1'));
  });

  describe('assertElementNotDisplayed', () => {
    it('fails if element does not exist', async () => {
      await assert.rejects(
        () => browser.assertElementNotDisplayed('.non-existing'),
        err => {
          const expectedError = 'Element not found for selector: .non-existing';

          assert.strictEqual(stripColors(err.message), expectedError);
          return true;
        }
      );
    });

    it('fails if element exists, but is visible', async () => {
      await assert.rejects(
        () => browser.assertElementNotDisplayed('h1'),
        err => {
          const expectedError = 'Element "h1" shouldn\'t be displayed';

          assert.strictEqual(stripColors(err.message), expectedError);
          return true;
        }
      );
    });

    it('succeeds if element exists and is not visible', () =>
      browser.assertElementNotDisplayed('#hidden_thing'));
  });

  describe('assertElementExists', () => {
    it('fails if element does not exist', async () => {
      await assert.rejects(
        () => browser.assertElementExists('.non-existing'),
        err => {
          const expected = 'Element ".non-existing" should exist';

          assert.strictEqual(stripColors(err.message), expected);
          return true;
        }
      );
    });

    it('succeeds if element exists', () => browser.assertElementExists('h1'));
  });

  describe('assertElementDoesntExist', () => {
    it('succeeds if element does not exist', () =>
      browser.assertElementDoesntExist('.non-existing'));

    it('fails if element exists', async () => {
      await assert.rejects(
        () => browser.assertElementDoesntExist('h1'),
        err => {
          const expected = 'Element "h1" shouldn\'t exist';

          assert.strictEqual(stripColors(err.message), expected);

          return true;
        }
      );
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
        await assert.rejects(
          () =>
            setupClickEvent('.message', 'only-one-message').clickOn('.message'),
          err => {
            assert.strictEqual(
              err.message,
              'selector ".message" matched more than 1 element. Use .clickOnAll() or a more specific selector instead.'
            );
            return true;
          }
        );
      });

      it('throws when selector matches no element', async () => {
        await assert.rejects(
          () => browser.clickOn('.foo'),
          /selector "\.foo" matched no element\./
        );
      });
    });

    describe('clickOnAll', () => {
      it('triggeres click event on all matching elements', () =>
        setupClickEvent('.message', 'clicked')
          .clickOnAll('.message')
          .assertElementsNumber('.clicked', 3));

      it("doesn't throw when selector doesn't match elements", async () => {
        await assert.doesNotReject(() => browser.clickOnAll('.foo'));
      });
    });
  });

  describe('elementHasText', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasText(
        '.only',
        'only one here'
      );
      assert.strictEqual(
        await element.get('class'),
        'only',
        "resolve the element's class"
      );
    });

    it('finds an element with the wrong text', async () => {
      await assert.rejects(
        () => browser.assertElementHasText('.only', 'the wrong text'),
        err => {
          const expected =
            '.only should have text\n- needle: ' +
            '"the wrong text"\n- text: "only one here"';

          assert.strictEqual(stripColors(err.message), expected);
          return true;
        }
      );
    });

    it('finds no elements', async () => {
      await assert.rejects(
        () => browser.assertElementHasText('.does-not-exist', 'some text'),
        /Element not found for selector: \.does-not-exist/
      );
    });

    it('finds many elements', async () => {
      await assert.rejects(
        () => browser.assertElementHasText('.message', 'some text'),
        err => {
          assert.strictEqual(
            err.message,
            'Selector .message has 3 hits on the page, assertions ' +
              'require unique elements'
          );
          return true;
        }
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
      assert.strictEqual(
        await element.get('class'),
        'only',
        "resolve the element's class"
      );
    });

    it('finds an element incorrectly having some text', async () => {
      await assert.rejects(
        () => browser.assertElementLacksText('.only', 'only'),
        err => {
          const expected =
            '.only should not have text\n- needle: ' +
            '"only"\n- text: "only one here"';

          assert.strictEqual(stripColors(err.message), expected);
          return true;
        }
      );
    });
  });

  describe('elementHasValue', () => {
    it('finds and returns a single element', async () => {
      const element = await browser.assertElementHasValue(
        '#text-input',
        'initialvalue'
      );

      assert.strictEqual(
        await element.get('id'),
        'text-input',
        "resolve the element's id"
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
      assert.strictEqual(
        await element.get('id'),
        'text-input',
        "resolve the element's id"
      );
    });

    it('finds an element incorrectly having some text', async () => {
      await assert.rejects(
        () => browser.assertElementLacksValue('#text-input', 'initialvalue'),
        err => {
          const expected =
            '#text-input should not have value\n- needle: ' +
            '"initialvalue"\n- value: "initialvalue"';

          assert.strictEqual(stripColors(err.message), expected);
          return true;
        }
      );
    });
  });

  describe('elementHasAttributes', () => {
    before(() => browser.loadPage('/'));

    it('fails if element found does not have attrs', async () => {
      await assert.rejects(
        () => browser.assertElementHasAttributes('img.fail', { foo: 'bar' }),
        err => {
          const expected =
            'Assertion failed: attribute foo\nExpected: "bar"\nActually: null';

          assert.strictEqual(stripColors(err.message), expected);
          return true;
        }
      );
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
        await assert.rejects(
          () => browser.assertElementsNumber('.message', 2),
          err => {
            const expected =
              'selector ".message" should match 2 elements - actually found 3';

            assert.strictEqual(stripColors(err.message), expected);
            return true;
          }
        );
      });

      it('passes for right number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', 3);

        assert.strictEqual(elems.length, 3);
      });
    });

    describe('with "equal" option argument', () => {
      it('fails if number of elements does not match', async () => {
        await assert.rejects(
          () => browser.assertElementsNumber('.message', { equal: 2 }),
          err => {
            const expected =
              'selector ".message" should match 2 elements - actually found 3';

            assert.strictEqual(stripColors(err.message), expected);
            return true;
          }
        );
      });

      it('passes for right number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          equal: 3,
        });

        assert.strictEqual(elems.length, 3);
      });
    });

    describe('with "min" option argument', () => {
      before(() => browser.loadPage('/'));

      it('fails if number of elements does not match minimum', async () => {
        await assert.rejects(
          () => browser.assertElementsNumber('.message', { min: 5 }),
          err => {
            const expected =
              'selector ".message" should have at least 5 elements - actually found 3';

            assert.strictEqual(stripColors(err.message), expected);
            return true;
          }
        );
      });

      it('passes for right minimum number of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          min: 2,
        });

        assert.strictEqual(elems.length, 3);
      });
    });

    describe('with "max" option argument', () => {
      before(() => browser.loadPage('/'));

      it('fails if number of elements does not match maximum allowed elements', async () => {
        await assert.rejects(
          () => browser.assertElementsNumber('.message', { max: 1 }),
          err => {
            const expected =
              'selector ".message" should have at most 1 elements - actually found 3';

            assert.strictEqual(stripColors(err.message), expected);
            return true;
          }
        );
      });

      it('passes for right amount of elements and returns them', async () => {
        const elems = await browser.assertElementsNumber('.message', {
          max: 5,
        });

        assert.strictEqual(elems.length, 3);
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
      await assert.rejects(
        () => browser.waitForElementExist('.does-not-exist', 10),
        /Timeout \(10ms\): Element "\.does-not-exist" should exist/
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
      setTimeout(function () {
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

      await assert.rejects(
        () => browser.waitForElementNotExist('.remove_later', 10),
        /Timeout \(10ms\): Element "\.remove_later" shouldn't exist/
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
      await assert.rejects(
        () => browser.waitForElementDisplayed('.load_never', 10),
        /Timeout \(10ms\): Element "\.load_never" should be displayed/
      );
    });

    it('fails to find an element that never exists', async () => {
      await assert.rejects(
        () => browser.waitForElementDisplayed('.does-not-exist', 10),
        /Timeout \(10ms\): Element not found for selector: \.does-not-exist/
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
      await assert.rejects(
        () => browser.waitForElementNotDisplayed('.hide_never', 10),
        /Timeout \(10ms\): Element "\.hide_never" shouldn't be displayed/
      );
    });

    it('fails to find an element that never exists', async () => {
      await assert.rejects(
        () => browser.waitForElementNotDisplayed('.does-not-exist', 10),
        /Timeout \(10ms\): Element not found for selector: \.does-not-exist/
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

      assert.strictEqual(element, null);
    });
  });

  describe('#getElements', () => {
    before(() => browser.loadPage('/'));

    it('succeeds if selector is a String', async () => {
      const element = await browser.getElement('body');
      const messages = await element.getElements('.message');

      assert.strictEqual(messages.length, 3);
    });

    it('return empty array if not found an element on the message element', async () => {
      const messageElement = await browser.getElement('.message');
      const elements = await messageElement.getElements('.message');

      assert.strictEqual(elements.length, 0);
    });
  });
});
