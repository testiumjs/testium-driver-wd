'use strict';

const { browser } = require('../mini-testium-mocha');
const assert = require('assert');

describe('various', () => {
  before(browser.beforeHook());

  describe('waitForTime', () => {
    it('delays promise chain for given amount of time', () => {
      const timeStart = Date.now();
      const time = 100;
      const wiggleFactor = 0.9;

      return browser
        .waitForTime(time)
        .then(() =>
          assert.ok(Date.now() - timeStart - wiggleFactor * time >= 0)
        );
    });
  });

  describe('delay (waitForTime alias)', () => {
    it('delays promise chain for given amount of time', () => {
      const timeStart = Date.now();
      const time = 100;
      const wiggleFactor = 0.9;

      return browser
        .delay(time)
        .then(() =>
          assert.ok(Date.now() - timeStart - wiggleFactor * time >= 0)
        );
    });
  });
});
