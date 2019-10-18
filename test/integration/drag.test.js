'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const pick = require('lodash/pick');

describe('draggable element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/draggable.html'));

  it('is moved', async () => {
    const box = await browser.getElement('#box');
    const boxLoc = () =>
      box.getLocationInView().then(loc => pick(loc, 'x', 'y'));

    await assert.deepEqual({ x: 0, y: 0 }, boxLoc());

    await box
      .moveTo(20, 20)
      .buttonDown()
      .moveTo(100, 100)
      .buttonUp();

    await assert.deepEqual({ x: 80, y: 80 }, boxLoc());
  });
});
