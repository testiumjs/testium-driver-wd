import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('window api', () => {
  before(browser.beforeHook);

  describe('frames', () => {
    before(() =>
      browser.navigateTo('/windows.html').assertStatusCode(200));

    it('can be switched', async () => {
      await browser.switchToFrame('cool-frame');
      const iframeContent = await browser.getElement('.in-iframe-only').text();
      await browser.switchToDefaultFrame();
      const primaryContent = await browser.getElementOrNull('.in-iframe-only');
      assert.equal('iframe content!', iframeContent);
      assert.equal(null, primaryContent);
    });

    it('can be found when nested', async () => {
      await browser.switchToFrame('cool-frame');

      await browser.assertElementExists('.in-iframe-only');
      await browser.assertElementDoesntExist('#nested-frame-div');

      await browser.switchToFrame('nested-frame');

      await browser.assertElementDoesntExist('.in-iframe-only');
      await browser.assertElementExists('#nested-frame-div');
    });
  });

  describe('popups', () => {
    before(() =>
      browser.navigateTo('/windows.html').assertStatusCode(200));

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
