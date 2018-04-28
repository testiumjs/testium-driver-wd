'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

describe('form', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it(
    "can get an input's value",
    co.wrap(function*() {
      const element = yield browser.getElement('#text-input');
      const value = yield element.getValue();
      assert.equal('Input value was not found', 'initialvalue', value);
    })
  );

  it(
    "can clear an input's value",
    co.wrap(function*() {
      const element = yield browser.getElement('#text-input');
      yield element.clear();
      const value = yield element.getValue();
      assert.equal('Input value was not cleared', '', value);
    })
  );

  it(
    'can type into an input',
    co.wrap(function*() {
      const element = yield browser.getElement('#text-input');
      yield element.type('new stuff');
      const value = yield element.getValue();
      assert.equal('Input value was not typed', 'new stuff', value);
    })
  );

  it(
    'can type into an input via shortcut',
    co.wrap(function*() {
      yield browser.clear('#text-input');
      yield browser.type('#text-input', 'new stuff');
      const value = yield browser.getElement('#text-input').getValue();
      assert.equal('Input value was not typed', 'new stuff', value);
    })
  );

  it(
    "can replace the input's value",
    co.wrap(function*() {
      const element = yield browser.getElement('#text-input');
      const valueBefore = yield element.getValue();
      assert.notEqual('Input value is already empty', '', valueBefore);
      yield browser.clearAndType('#text-input', 'new stuff2');
      const valueAfter = yield element.getValue();
      assert.equal('Input value was not typed', 'new stuff2', valueAfter);
    })
  );

  it(
    "can get a textarea's value",
    co.wrap(function*() {
      const element = yield browser.getElement('#text-area');
      const value = yield element.getValue();
      assert.equal('Input value was not found', 'initialvalue', value);
    })
  );

  it(
    "can clear an textarea's value",
    co.wrap(function*() {
      const element = yield browser.getElement('#text-area');
      yield element.clear();
      const value = yield element.getValue();
      assert.equal('Input value was not cleared', '', value);
    })
  );

  it(
    'can type into a textarea',
    co.wrap(function*() {
      const element = yield browser.getElement('#text-area');
      yield element.type('new stuff');
      const value = yield element.getValue();
      assert.equal('Input value was not typed', 'new stuff', value);
    })
  );

  it(
    'correctly passes multibyte unicode back and forth',
    co.wrap(function*() {
      const multibyteText = '日本語 text';
      const element = yield browser.getElement('#blank-input');
      yield element.type(multibyteText);
      const result = yield element.getValue();
      assert.equal(result, multibyteText);
    })
  );

  it(
    'can fill multiple fields',
    co.wrap(function*() {
      const fields = {
        '#text-input': 'new stuff',
        '#blank-input': 'new stuff2',
        '#text-area': 'In far galaxy, a long long time ago...',
      };

      yield browser.fillFields(fields);

      for (const field of Object.keys(fields)) {
        const expectedValue = fields[field];
        const value = yield browser.getElement(field).getValue();
        assert.equal('Input value was not typed', expectedValue, value);
      }
    })
  );
});
