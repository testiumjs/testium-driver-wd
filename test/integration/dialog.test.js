import { browser } from '../mini-testium-mocha';
import assert from 'assertive';

import { getConfig } from 'testium-core';

const browserName = getConfig().get('browser');

describe('dialogs', () => {
  if (browserName === 'phantomjs') {
    xit('skipping tests because browser phantomjs doesn\'t support alerts');
    return;
  }

  before(browser.beforeHook);

  let target;
  before(async () => {
    await browser.navigateTo('/').assertStatusCode(200);

    target = await browser.getElement('#alert_target');
    await browser.clickOn('.link_to_clear_alert_target');
  });

  describe('alert', () => {
    if (browserName === 'chrome') {
      xit('Chrome sometimes crashes with many alerts');
      return;
    }

    beforeEach(() => browser.clickOn('.link_to_open_an_alert'));

    it('can get an alert text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();
      assert.equal('Alert text was not found', 'An alert!', text);
    });

    it('can accept an alert', async () => {
      await browser.acceptAlert();
      assert.equal('alerted', await target.text());
    });

    it('can dismiss an alert', async () => {
      await browser.dismissAlert();
      assert.equal('alerted', await target.text());
    });
  });

  describe('confirm', () => {
    beforeEach(() => browser.clickOn('.link_to_open_a_confirm'));

    it('can get confirm text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();
      assert.equal('Confirm text was not found', 'A confirmation!', text);
    });

    it('can accept a confirm', async () => {
      await browser.acceptAlert();
      assert.equal('confirmed', await target.text());
    });

    it('can dismiss a confirm', async () => {
      await browser.dismissAlert();
      assert.equal('dismissed', await target.text());
    });
  });

  describe('prompt', () => {
    beforeEach(() => browser.clickOn('.link_to_open_a_prompt'));

    it('can get prompt text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();
      assert.equal('Confirm text was not found', 'A prompt!', text);
    });

    it('can send text to and accept a prompt', async () => {
      await browser.typeAlert('Some words').acceptAlert();
      assert.equal('Some words', await target.text());
    });

    it('can dismiss a prompt', async () => {
      await browser.dismissAlert();
      assert.equal('dismissed', await target.text());
    });
  });
});
