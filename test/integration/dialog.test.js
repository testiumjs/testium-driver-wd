import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

import Config from 'testium-core/lib/config';

const browserName = Config.load().get('browser');

describe('dialogs', () => {
  if (browserName === 'phantomjs') {
    xit('skipping tests because browser phantomjs doesn\'t support alerts');
    return;
  }

  let browser;
  before(async () => (browser = await getBrowser()));

  let target;
  before(() => {
    browser.navigateTo('/');
    browser.assert.httpStatus(200);

    target = browser.getElement('#alert_target');
    browser.click('.link_to_clear_alert_target');
  });

  xdescribe('alert', () => {
    beforeEach(() => browser.click('.link_to_open_an_alert'));

    it('can get an alert text', () => {
      const text = browser.getAlertText();
      browser.acceptAlert();
      assert.equal('Alert text was not found', 'An alert!', text);
    });

    it('can accept an alert', () => {
      browser.acceptAlert();
      assert.equal('alerted', target.get('text'));
    });

    it('can dismiss an alert', () => {
      browser.dismissAlert();
      assert.equal('alerted', target.get('text'));
    });
  });

  describe('confirm', () => {
    beforeEach(() => browser.click('.link_to_open_a_confirm'));

    it('can get confirm text', () => {
      const text = browser.getAlertText();
      browser.acceptAlert();
      assert.equal('Confirm text was not found', 'A confirmation!', text);
    });

    it('can accept a confirm', () => {
      browser.acceptAlert();
      assert.equal('confirmed', target.get('text'));
    });

    it('can dismiss a confirm', () => {
      browser.dismissAlert();
      assert.equal('dismissed', target.get('text'));
    });
  });

  describe('prompt', () => {
    beforeEach(() => browser.click('.link_to_open_a_prompt'));

    it('can get prompt text', () => {
      const text = browser.getAlertText();
      browser.acceptAlert();
      assert.equal('Confirm text was not found', 'A prompt!', text);
    });

    it('can send text to and accept a prompt', () => {
      browser.typeAlert('Some words');
      browser.acceptAlert();
      assert.equal('Some words', target.get('text'));
    });

    it('can dismiss a prompt', () => {
      browser.dismissAlert();
      assert.equal('dismissed', target.get('text'));
    });
  });
});
