'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const pick = require('lodash/pick');
const coroutine = require('bluebird').coroutine;

describe('draggable element', () => {
  before(browser.beforeHook());

  before(() => browser.loadPage('/draggable.html'));

  it(
    'is moved',
    coroutine(function*() {
      const box = yield browser.getElement('#box');
      const boxLoc = () =>
        box.getLocationInView().then(loc => pick(loc, 'x', 'y'));

      yield assert.deepEqual({ x: 0, y: 0 }, boxLoc());

      yield box
        .moveTo(20, 20)
        .buttonDown()
        .moveTo(100, 100)
        .buttonUp();

      yield assert.deepEqual({ x: 80, y: 80 }, boxLoc());
    })
  );
});
