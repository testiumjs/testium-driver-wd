'use strict';

const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const browser = require('../mini-testium-mocha').browser;

const browserName = getConfig().get('browser');

describe('navigation', () => {
  if (browserName !== 'chrome') {
    it.skip('Skipping lighthouse tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  describe('lighthouse', () => {
    describe('getLighthouseData', () => {
      it('can get lighthouse report data', async () => {
        const results = await browser
          .navigateTo('/draggable.html')
          .assertStatusCode(200)
          .getLighthouseData();
        const report = results.report;
        assert.match(/\/draggable\.html$/, JSON.parse(report).finalUrl);
      });
    });
  });

  describe('a11y', () => {
    it('can audit the accessibility issues', async () => {
      const results = await browser
        .navigateTo('/draggable.html')
        .assertStatusCode(200)
        .a11yAudit();

      assert.equal(2, results.length);
      assert.equal('document-title', results[0].auditId);
      assert.equal('html-has-lang', results[1].auditId);
    });

    it('can audit the accessibility issues with ignore array', async () => {
      const results = await browser
        .navigateTo('/draggable.html')
        .assertStatusCode(200)
        .a11yAudit({ ignore: ['document-title'] });
      assert.equal(1, results.length);
      assert.equal('html-has-lang', results[0].auditId);
    });

    it('can audit the accessibility issues with ignore function', async () => {
      const results = await browser
        .navigateTo('/draggable.html')
        .assertStatusCode(200)
        .a11yAudit({
          ignore: violation =>
            ['document-title', 'html-has-lang'].includes(violation.id),
        });
      assert.equal(0, results.length);
    });
  });
});
