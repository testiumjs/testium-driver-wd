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

    it('can get an alert text', done => {
      browser
        .getAlertText()
        .then(text => {
          assert.strictEqual(text, 'An alert!', 'Alert text was not found');
        })
        .acceptAlert(done);
    });

    it('can accept an alert', done => {
      browser.acceptAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'alerted');
          done();
        });
      });
    });

    it('can dismiss an alert', done => {
      browser.dismissAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'alerted');
          done();
        });
      });
    });
  });

  describe('confirm', () => {
    beforeEach(() => browser.clickOn('.link_to_open_a_confirm'));

    it('can get confirm text', done => {
      browser
        .getAlertText()
        .then(text => {
          assert.strictEqual(
            text,
            'A confirmation!',
            'Confirm text was not found'
          );
        })
        .acceptAlert(done);
    });

    it('can accept a confirm', done => {
      browser.acceptAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'confirmed');
          done();
        });
      });
    });

    it('can dismiss a confirm', done => {
      browser.dismissAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'dismissed');
          done();
        });
      });
    });
  });

  describe('prompt', function () {
    this.retries(3); // prompts seem to be flaky in chromedriver
    beforeEach(() =>
      browser
        .waitForElementDisplayed('.link_to_open_a_prompt')
        .clickOn('.link_to_open_a_prompt')
    );

    it('can get prompt text', done => {
      browser
        .getAlertText()
        .then(text => {
          assert.strictEqual(text, 'A prompt!', 'Confirm text was not found');
        })
        .acceptAlert(done);
    });

    it('can send text to and accept a prompt', done => {
      browser.typeAlert('Some words').acceptAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'Some words');
          done();
        });
      });
    });

    it('can dismiss a prompt', done => {
      browser.dismissAlert(() => {
        target.text().then(text => {
          assert.strictEqual(text, 'dismissed');
          done();
        });
      });
    });
  });
});
