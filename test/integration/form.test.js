'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('form', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/'));

  it("can get an input's value", async () => {
    const element = await browser.getElement('#text-input');
    const value = await element.getValue();

    assert.strictEqual(value, 'initialvalue');
  });

  it("can clear an input's value", async () => {
    const element = await browser.getElement('#text-input');
    await element.clear();
    const value = await element.getValue();

    assert.strictEqual(value, '');
  });

  it('can type into an input', async () => {
    const element = await browser.getElement('#text-input');
    await element.type('new stuff');
    const value = await element.getValue();

    assert.strictEqual(value, 'new stuff');
  });

  it('can type into an input via shortcut', async () => {
    await browser.clear('#text-input');
    await browser.type('#text-input', 'new stuff');
    const value = await browser.getElement('#text-input').getValue();

    assert.strictEqual(value, 'new stuff');
  });

  it("can replace the input's value", async () => {
    const element = await browser.getElement('#text-input');
    const valueBefore = await element.getValue();

    assert.notStrictEqual(valueBefore, '');

    await browser.clearAndType('#text-input', 'new stuff2');
    const valueAfter = await element.getValue();

    assert.strictEqual(valueAfter, 'new stuff2');
  });

  it("can get a textarea's value", async () => {
    const element = await browser.getElement('#text-area');
    const value = await element.getValue();

    assert.strictEqual(value, 'initialvalue');
  });

  it("can clear an textarea's value", async () => {
    const element = await browser.getElement('#text-area');
    await element.clear();
    const value = await element.getValue();

    assert.strictEqual(value, '');
  });

  it('can type into a textarea', async () => {
    const element = await browser.getElement('#text-area');
    await element.type('new stuff');
    const value = await element.getValue();

    assert.strictEqual(value, 'new stuff');
  });

  it('correctly passes multibyte unicode back and forth', async () => {
    const multibyteText = '日本語 text';
    const element = await browser.getElement('#blank-input');
    await element.type(multibyteText);
    const result = await element.getValue();

    assert.strictEqual(result, multibyteText);
  });

  it('can fill multiple fields', async () => {
    const fields = {
      '#text-input': 'new stuff',
      '#blank-input': 'new stuff2',
      '#text-area': 'In far galaxy, a long long time ago...',
    };

    await browser.fillFields(fields);

    for (const field of Object.keys(fields)) {
      const expectedValue = fields[field];
      const value = await browser.getElement(field).getValue();

      assert.strictEqual(value, expectedValue);
    }
  });
});
