'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');

function assertRejects(promise) {
  return promise.then(
    () => {
      throw new Error('Did not fail as expected');
    },
    error => error
  );
}

describe('window api', () => {
  before(browser.beforeHook());

  describe('frames', () => {
    before(() => browser.loadPage('/windows.html'));

    it('can be switched', async () => {
      await browser.switchToFrame('cool-frame');
      const iframeContent = await browser.getElement('.in-iframe-only').text();
      await browser.switchToDefaultFrame();
      const primaryContent = await browser.getElementOrNull('.in-iframe-only');
      assert.equal('iframe content!', iframeContent);
      assert.equal(null, primaryContent);
    });

    it('fails with invalid frame', () =>
      assertRejects(browser.switchToFrame('invalid-frame')));

    it('can be found when nested', () =>
      browser
        .switchToFrame('cool-frame')
        .assertElementExists('.in-iframe-only')
        .assertElementDoesntExist('#nested-frame-div')
        .switchToFrame('nested-frame')
        .assertElementDoesntExist('.in-iframe-only')
        .assertElementExists('#nested-frame-div'));
  });

  describe('popups', () => {
    before(() => browser.loadPage('/windows.html'));

    it('can be opened', async () => {
      await browser.clickOn('#open-popup');
      await browser.switchToWindow('popup1');
      const popupContent = await browser.getElement('.popup-only').text();
      await browser.close();
      await browser.switchToDefaultWindow();
      const primaryContent = await browser.getElementOrNull('.popup-only');
      assert.equal('popup content!', popupContent);
      assert.equal(null, primaryContent);
    });
  });
});
