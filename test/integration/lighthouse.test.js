'use strict';

const assert = require('assertive');
const getConfig = require('testium-core').getConfig;

const browser = require('../mini-testium-mocha').browser;

const browserName = getConfig().get('browser');

describe('lighthouse', () => {
  if (browserName !== 'chrome') {
    it.skip('Skipping lighthouse tests. They only work for chrome.');
    return;
  }

  before(browser.beforeHook());

  describe('getLighthouseData()', () => {
    before(() => browser.loadPage('/draggable.html'));
    it('can get lighthouse report data', async () => {
      const results = await browser.getLighthouseData();
      const report = results.report;

      assert.match(/\/draggable\.html$/, JSON.parse(report).finalUrl);
    });
  });

  describe('runLighthouseAudit()', () => {
    let result;
    before(async () => {
      const defaultConfig = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['accessibility'],
          throttlingMethod: 'simulate',
        },
      };

      const defaultFlags = {
        chromeFlags: [
          '--disable-gpu',
          '--headless',
          '--disable-storage-reset',
          '--enable-logging',
          '--disable-device-emulation',
          '--no-sandbox',
        ],
      };
      result = await browser
        .loadPage('/draggable.html')
        .runLighthouseAudit(defaultFlags, defaultConfig);
    });

    it('returns the parsed audit result', () => {
      const keys = Object.keys(result);
      assert.include('score', keys);
      assert.include('audits', keys);
    });

    describe('result', () => {
      it('contains the category score', () =>
        assert.hasType(Number, result.score));

      it('contains audits with details', () => {
        assert.hasType(Object, result.audits);
        assert.expect(!!Object.keys(result.audits).length);
      });

      describe('result.isSuccess()', () => {
        it('compares score against expected cutoff score', () => {
          assert.notThrows(() => result.isSuccess(20));
          assert.throws(() => result.isSuccess(100));
        });
      });

      describe('result.success()', () => {
        it('returns specific audits from all audits with a score', () => {
          assert.truthy(result.success('color-contrast'));
          assert.falsey(result.success('document-title'));
        });

        it('returns all successful audits', () => {
          assert.truthy(result.success());
        });
      });

      describe('result.errors()', () => {
        it('returns specific audit from all manually marked audits', () => {
          assert.truthy(result.errors('document-title'));
          assert.falsey(result.errors('color-contrast'));
        });

        it('returns all manually marked audits', () => {
          assert.truthy(result.errors());
        });
      });
      describe('result.errorString()', () => {
        it('returns a concatenated string of all manually marked audits', () => {
          assert.hasType(String, result.errorString());
        });
      });
    });
  });

  describe('assertions by category', () => {
    before(() => browser.loadPage('/draggable.html'));

    describe('assertPerformanceScore()', () => {
      it('matches expected performance score against LH score', () => {
        return browser.assertPerformanceScore(20);
      });

      it(`skips certain performance audits by default`, () => {
        const skippedAudits = [
          'final-screenshot',
          'is-on-https',
          'screenshot-thumbnails',
        ];

        return browser.assertPerformanceScore(20).then(res => {
          const audits = Object.keys(res.audits);
          for (const audit of skippedAudits) {
            assert.notInclude(audit, audits);
          }
        });
      });
    });

    describe('assertAccessibilityScore()', () => {
      it('matches expected accessibility score against LH score', () => {
        return browser.assertAccessibilityScore(20);
      });
    });

    describe('assertBestPracticesScore()', () => {
      it('matches expected best practices score against LH score', () => {
        return browser.assertBestPracticesScore(20);
      });
    });

    describe('assertSeoScore()', () => {
      it('matches expected best practices score against LH score', () => {
        return browser.assertSeoScore(20);
      });
    });

    describe('assertPwaScore()', () => {
      it('matches expected pwa score against LH score', () => {
        return browser.assertPwaScore(20);
      });
    });
  });

  describe('a11yAudit()', () => {
    before(() => browser.loadPage('/draggable.html'));

    it('can audit the accessibility issues', async () => {
      const results = await browser.a11yAudit();

      assert.equal(2, results.length);
      assert.equal('document-title', results[0].auditId);
      assert.equal('html-has-lang', results[1].auditId);
    });

    it('can audit the accessibility issues with ignore array', async () => {
      const results = await browser.a11yAudit({ ignore: ['document-title'] });
      assert.equal(1, results.length);
      assert.equal('html-has-lang', results[0].auditId);
    });

    it('can audit the accessibility issues with ignore function', async () => {
      const results = await browser.a11yAudit({
        ignore: violation =>
          ['document-title', 'html-has-lang'].includes(violation.id),
      });
      assert.equal(0, results.length);
    });
  });
});
