'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

describe('draggable element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/draggable.html'));

  it('is moved', async () => {
    const box = await browser.getElement('#box');
    const boxLoc = () =>
      box.getLocationInView().then(loc => ({ x: loc.x, y: loc.y }));

    assert.deepStrictEqual(await boxLoc(), { x: 0, y: 0 });

    await box.moveTo(20, 20).buttonDown().moveTo(100, 100).buttonUp();

    assert.deepStrictEqual(await boxLoc(), { x: 80, y: 80 });
  });
});
