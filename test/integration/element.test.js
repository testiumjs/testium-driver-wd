/* eslint-env browser */

'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assert');

function stripColors(message) {
  return message.replace(/\u001b\[[^m]*m/g, '');
}

function setupClickEvent(selector, expectedClass) {
  return browser.evaluate(selector, expectedClass, (s, c) => {
    document.querySelectorAll(s).forEach(elem => {
      const event = () => elem.classList.add(c);
      elem.removeEventListener('click', event);
      elem.addEventListener('click', event);
    });
  });
}
function assertElementReturn(obj) {
  assert.strictEqual(obj.constructor.name, 'Element');
  return obj;
}

describe('element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  describe('browser promise chain', () => {
    it("can get an element's text", async () => {
      const text = await browser.getElement('h1').text();

      assert.strictEqual(text, 'Test Page!', 'Element text was not found');
    });

    describe('browser.getElement()', () => {
      it('returns Element object', async () => {
        await browser.getElement('#checkbox').then(assertElementReturn);
      });

      it('throws when element not found', async () => {
        await assert.rejects(() => browser.getElement('#fooFighter'));
      });
    });

    describe('browser.getElements()', () => {
      it('returns an Array of Element object', async () => {
        await browser.getElements('.messsage').then(arr => {
          assert.ok(Array.isArray(arr));
          arr.forEach(assertElementReturn);
        });
      });

      it('can get several elements', async () => {
        const elements = await browser.getElements('.message');

        assert.strictEqual(elements.length, 3, 'Messages were not all found');
      });
    });

    describe('browser.getElementOrNull()', () => {
      it('returns Element object when element is found', async () => {
        await browser.getElementOrNull('#checkbox').then(assertElementReturn);
      });

      it('returns null when the element can not be found', async () => {
        const element = await browser.getElementOrNull('.non-existing');

        assert.strictEqual(
          element,
          null,
          'Element magically appeared on the page'
        );
      });
    });

    describe('browser.assertElementIsDisplayed()', () => {
      it('returns Element object', async () => {
        await browser.assertElementIsDisplayed('h1').then(assertElementReturn);
      });

      it('succeeds if element exists and is visible', () =>
        browser.assertElementIsDisplayed('h1'));

      it('fails if element does not exist', async () => {
        await assert.rejects(
          () => browser.assertElementIsDisplayed('.non-existing'),
          err => {
            const expectedError =
              'Element not found for selector: .non-existing';

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
    });

    describe('browser.assertElementNotDisplayed()', () => {
      it('returns Element object', async () => {
        await browser
          .assertElementNotDisplayed('#hidden_thing')
          .then(assertElementReturn);
      });

      it('succeeds if element exists and is not visible', () =>
        browser.assertElementNotDisplayed('#hidden_thing'));

      it('fails if element does not exist', async () => {
        await assert.rejects(
          () => browser.assertElementNotDisplayed('.non-existing'),
          err => {
            const expectedError =
              'Element not found for selector: .non-existing';

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
    });

    describe('browser.assertElementExists()', () => {
      it('returns Element', () =>
        browser.assertElementExists('h1').then(assertElementReturn));

      it('succeeds if element exists', () => browser.assertElementExists('h1'));

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
    });

    describe('browser.assertElementDoesntExist', () => {
      it('returns null', () =>
        browser
          .assertElementDoesntExist('.non-existing')
          .then(obj => assert.strictEqual(obj, null)));

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

    describe('browser.clickOn()', () => {
      it('triggers click event', () =>
        setupClickEvent('.okay', 'only-once')
          .clickOn('.okay')
          .assertElementsNumber('.only-once', 1));

      it('returns undefined', () =>
        setupClickEvent('.okay', 'only-once')
          .clickOn('.okay')
          .then(obj => assert.strictEqual(obj, undefined)));

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

    describe('browser.clickOnAll()', () => {
      it('returns undefined', () =>
        setupClickEvent('.message', 'clicked')
          .clickOnAll('.message')
          .then(obj => assert.strictEqual(obj, undefined)));

      it('triggers click event of all matching elements', () =>
        setupClickEvent('.message', 'clicked')
          .clickOnAll('.message')
          .assertElementsNumber('.clicked', 3));

      it("doesn't throw when selector doesn't match elements", async () => {
        await assert.doesNotReject(() => browser.clickOnAll('.foo'));
      });
    });

    describe('browser.elementHasText()', () => {
      it('returns an Element', () =>
        browser
          .assertElementHasText('#blank-input', '')
          .then(assertElementReturn));

      it('succeeds with empty string', () =>
        browser.assertElementHasText('#blank-input', ''));

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
    });

    describe('browser.elementLacksText()', () => {
      it('returns an Element', () =>
        browser
          .assertElementLacksText('.only', 'this text not present')
          .then(assertElementReturn));

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

    describe('browser.elementHasValue()', () => {
      it('returns an Element', () =>
        browser
          .assertElementHasValue('#text-input', 'initialvalue')
          .then(assertElementReturn));

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

    describe('browser.elementLacksValue()', () => {
      it('returns an Element', () =>
        browser
          .assertElementLacksValue('#text-input', 'this text not present')
          .then(assertElementReturn));

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

    describe('browser.assertElementLacksAttribute()', () => {
      before(() => browser.loadPage('/'));

      it('passes when element lacks attributes', async () => {
        await browser.assertElementLacksAttribute('img.fail', 'foo');
      });

      it('throws when element has attributes', async () => {
        await assert.rejects(() =>
          browser.assertElementLacksAttribute('img.fail', 'alt')
        );
      });

      it('throws when attribute argument is not a string', async () => {
        await assert.rejects(() =>
          browser.assertElementLacksAttribute('img.fail', ['alt'])
        );
      });
    });

    describe('browser.assertElementLacksAttributes()', () => {
      before(() => browser.loadPage('/'));

      it('passes when element lacks attributes', async () => {
        await browser.assertElementLacksAttributes('img.fail', ['foo']);
      });

      it('throws when element has attributes', async () => {
        await assert.rejects(() =>
          browser.assertElementLacksAttributes('img.fail', ['alt'])
        );
      });

      it('throws when attributes argument is not an object', async () => {
        await assert.rejects(() =>
          browser.assertElementLacksAttributes('img.fail', ['alt'])
        );
      });
    });

    describe('browser.assertElementHasAttribute()', () => {
      before(() => browser.loadPage('/'));

      it('returns an Element', () =>
        browser
          .assertElementHasAttribute('img.fail', 'alt')
          .then(assertElementReturn));

      it('passes when attribute exists', () =>
        browser.assertElementHasAttribute('img.fail', 'alt'));

      it('throws when attribute is missing', async () => {
        await assert.rejects(() =>
          browser.assertElementHasAttribute('img.fail', 'foo')
        );
      });

      it('throws when attribute argument is not a string', async () => {
        await assert.rejects(() =>
          browser.assertElementHasAttribute('img.fail', ['alt'])
        );
      });
    });

    describe('browser.assertElementHasAttributes()', () => {
      before(() => browser.loadPage('/'));

      it('returns an Element', () =>
        browser
          .assertElementHasAttributes('img.fail', {
            alt: 'a non-existent image',
          })
          .then(assertElementReturn));

      it('passes if element found has given attrs', async () => {
        await browser.assertElementHasAttributes('img.fail', {
          alt: 'a non-existent image',
        });
      });

      it('fails if element found does not have attrs', async () => {
        await assert.rejects(
          () => browser.assertElementHasAttributes('img.fail', { foo: 'bar' }),
          err => {
            const expected =
              'Assertion failed: attribute "foo"\nExpected: "bar"\nActually: null';

            assert.strictEqual(stripColors(err.message), expected);
            return true;
          }
        );
      });

      it('throws when attributes argument is not an object', async () => {
        await assert.rejects(() =>
          browser.assertElementHasAttributes('img.fail', ['alt'])
        );
      });
    });

    describe('browser.assertElementsNumber()', () => {
      before(() => browser.loadPage('/'));

      it('returns Array of Elements', () =>
        browser.assertElementsNumber('.message', 3).then(arr => {
          assert.ok(Array.isArray(arr));
          arr.forEach(assertElementReturn);
        }));

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

    describe('browser.waitForElementExist()', () => {
      before(() => browser.loadPage('/dynamic.html'));

      it('returns an Element', () =>
        browser.waitForElementExist('.load_later').then(assertElementReturn));

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

    describe('browser.waitForElementNotExist()', () => {
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

      it('returns null', async () => {
        const obj = await browser
          .evaluate(setupElement)
          .assertElementIsDisplayed('.remove_later')
          .waitForElementNotExist('.remove_later');

        assert.strictEqual(obj, null);
      });

      it('succeeds once an element is gone', async () =>
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

    describe('browser.waitForElementDisplayed()', () => {
      before(() =>
        browser
          .loadPage('/dynamic.html')
          .assertElementNotDisplayed('.load_later')
      );

      it('returns Element', () =>
        browser
          .waitForElementDisplayed('.load_later')
          .then(assertElementReturn));

      it('finds an element after waiting', () =>
        browser.waitForElementDisplayed('.load_later'));

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

    describe('browser.waitForElementNotDisplayed()', () => {
      before(() =>
        browser
          .loadPage('/dynamic.html')
          .assertElementIsDisplayed('.hide_later')
      );

      it('returns Element', () =>
        browser
          .waitForElementNotDisplayed('.hide_later')
          .then(assertElementReturn));

      it('does not find an existing element after waiting for it to disappear', () =>
        browser.waitForElementNotDisplayed('.hide_later'));

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
  });

  describe('element promise chain', () => {
    describe('element.get()', () => {
      before(() => browser.loadPage('/'));

      it('can get special properties from an element', async () => {
        // the "checked" property (when it doesn't exist)
        // returns a non-standard response from selenium;
        // let's make sure we can handle it properly
        const element = await browser.getElement('#checkbox');
        const checked = await element.get('checked');

        assert.strictEqual(checked, null, 'checked is null');
      });
    });

    describe('element.getElement()', () => {
      before(() => browser.loadPage('/'));

      it('returns an Element', async () => {
        const element = await browser.getElement('body');
        await element.getElement('.message').then(assertElementReturn);
      });

      it('succeeds if selector is a String', async () => {
        const element = await browser.getElement('body');
        await element.getElement('.message');
      });

      it('throws when no element is found', async () => {
        await assert.rejects(async () => {
          const messageElement = await browser.getElement('.message');
          await messageElement.getElement('.foofighter');
        });
      });
    });

    describe('element.getElementOrNull()', () => {
      before(() => browser.loadPage('/'));

      it('returns Element when found', async () => {
        const element = await browser.getElement('body');
        await element.getElementOrNull('.message').then(assertElementReturn);
      });

      it('returns only the first Element', async () => {
        const element = await browser.getElement('body');
        const elements = await element.getElements('.message');
        const firstElement = await element.getElementOrNull('.message');

        assert.strictEqual(elements.length, 3);
        assert.deepStrictEqual(firstElement, elements[0]);
      });

      it('returns null when no element is found', async () => {
        const element = await browser.getElement('body');
        const firstElement = await element.getElementOrNull('.fooFighter');

        assert.strictEqual(firstElement, null);
      });
    });

    describe('element.getElements()', () => {
      before(() => browser.loadPage('/'));

      it('returns array of Elements', async () => {
        const element = await browser.getElement('body');
        await element.getElements('.message').then(arr => {
          assert.ok(Array.isArray(arr));
          arr.forEach(assertElementReturn);
        });
      });

      it('succeeds if selector is a String', async () => {
        const element = await browser.getElement('body');
        const messages = await element.getElements('.message');

        assert.strictEqual(messages.length, 3);
      });

      it('return empty array when no elements are found', async () => {
        const messageElement = await browser.getElement('.message');
        const elements = await messageElement.getElements('.message');

        assert.strictEqual(elements.length, 0);
      });
    });
  });
});
