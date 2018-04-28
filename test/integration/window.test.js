'use strict';

const browser = require('../mini-testium-mocha').browser;
const assert = require('assertive');
const co = require('co');

function assertRejects(promise) {
  return promise.then(() => {
    throw new Error('Did not fail as expected');
  }, error => error);
}

describe('window api', () => {
  before(browser.beforeHook());

  describe('frames', () => {
    before(() => browser.loadPage('/windows.html'));

    it(
      'can be switched',
      co.wrap(function*() {
        yield browser.switchToFrame('cool-frame');
        const iframeContent = yield browser
          .getElement('.in-iframe-only')
          .text();
        yield browser.switchToDefaultFrame();
        const primaryContent = yield browser.getElementOrNull(
          '.in-iframe-only'
        );
        assert.equal('iframe content!', iframeContent);
        assert.equal(null, primaryContent);
      })
    );

    it('fails with invalid frame', () =>
      assertRejects(browser.switchToFrame('invalid-frame')));

    it(
      'can be found when nested',
      co.wrap(function*() {
        yield browser.switchToFrame('cool-frame');

        yield browser.assertElementExists('.in-iframe-only');
        yield browser.assertElementDoesntExist('#nested-frame-div');

        yield browser.switchToFrame('nested-frame');

        yield browser.assertElementDoesntExist('.in-iframe-only');
        yield browser.assertElementExists('#nested-frame-div');
      })
    );
  });

  describe('popups', () => {
    before(() => browser.loadPage('/windows.html'));

    it(
      'can be opened',
      co.wrap(function*() {
        yield browser.clickOn('#open-popup');
        yield browser.switchToWindow('popup1');
        const popupContent = yield browser.getElement('.popup-only').text();
        yield browser.close();
        yield browser.switchToDefaultWindow();
        const primaryContent = yield browser.getElementOrNull('.popup-only');
        assert.equal('popup content!', popupContent);
        assert.equal(null, primaryContent);
      })
    );
  });
});
