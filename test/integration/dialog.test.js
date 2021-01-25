'use strict';

const assert = require('assert');
const { browser } = require('../mini-testium-mocha');

const { getConfig } = require('testium-core');

const browserName = getConfig().get('browser');

describe('dialogs', () => {
  let target;

  if (browserName === 'phantomjs') {
    it.skip("skipping tests because browser phantomjs doesn't support alerts");
    return;
  }

  before(browser.beforeHook());

  before(async () => {
    await browser.loadPage('/');

    target = await browser.getElement('#alert_target');
    await browser.clickOn('.link_to_clear_alert_target');
  });

  describe('alert', () => {
    beforeEach(() => browser.clickOn('.link_to_open_an_alert'));

    it('can get an alert text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();

      assert.strictEqual(text, 'An alert!', 'Alert text was not found');
    });

    it('can accept an alert', async () => {
      await browser.acceptAlert();
      assert.strictEqual(await target.text(), 'alerted');
    });

    it('can dismiss an alert', async () => {
      await browser.dismissAlert();
      assert.strictEqual(await target.text(), 'alerted');
    });
  });

  describe('confirm', () => {
    beforeEach(() => browser.clickOn('.link_to_open_a_confirm'));

    it('can get confirm text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();

      assert.strictEqual(text, 'A confirmation!', 'Confirm text was not found');
    });

    it('can accept a confirm', async () => {
      await browser.acceptAlert();

      assert.strictEqual(await target.text(), 'confirmed');
    });

    it('can dismiss a confirm', async () => {
      await browser.dismissAlert();

      assert.strictEqual(await target.text(), 'dismissed');
    });
  });

  describe('prompt', () => {
    beforeEach(() => browser.clickOn('.link_to_open_a_prompt'));

    it('can get prompt text', async () => {
      const text = await browser.getAlertText();
      await browser.acceptAlert();

      assert.strictEqual(text, 'A prompt!', 'Confirm text was not found');
    });

    it('can send text to and accept a prompt', async () => {
      await browser.typeAlert('Some words').acceptAlert();

      assert.strictEqual(await target.text(), 'Some words');
    });

    it('can dismiss a prompt', async () => {
      await browser.dismissAlert();

      assert.strictEqual(await target.text(), 'dismissed');
    });
  });
});
