'use strict';

const assert = require('assert');
const { getConfig } = require('testium-core');

const { browser } = require('../mini-testium-mocha');

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

      assert.match(JSON.parse(report).finalUrl, /\/draggable\.html$/);
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
      ['score', 'audits'].forEach(key =>
        assert.ok(keys.includes(key), `doesn't include key "${key}"`)
      );
    });

    describe('result', () => {
      it('contains the category score', () =>
        assert.strictEqual(typeof result.score, 'number'));

      it('contains audits with details', () => {
        assert.strictEqual(typeof result.audits, 'object');
        assert.ok(!!Object.keys(result.audits).length);
      });

      describe('result.isSuccess()', () => {
        it('compares score against expected cutoff score', () => {
          assert.doesNotThrow(() => result.isSuccess(20));
          assert.throws(() => result.isSuccess(100));
        });
      });

      describe('result.success()', () => {
        it('returns specific audits from all audits with a score', () => {
          assert.ok(result.success('color-contrast'));
          assert.ok(!result.success('document-title'));
        });

        it('returns all successful audits', () => {
          assert.ok(result.success());
        });
      });

      describe('result.errors()', () => {
        it('returns specific audit from all manually marked audits', () => {
          assert.ok(result.errors('document-title'));
          assert.ok(!result.errors('color-contrast'));
        });

        it('returns all manually marked audits', () => {
          assert.ok(result.errors());
        });
      });
      describe('result.errorString()', () => {
        it('returns a concatenated string of all manually marked audits', () => {
          assert.strictEqual(typeof result.errorString(), 'string');
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
            assert.ok(
              !audits.includes(audit),
              `${audit} is included in audits`
            );
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

      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].auditId, 'document-title');
      assert.strictEqual(results[1].auditId, 'html-has-lang');
    });

    it('can audit the accessibility issues with ignore array', async () => {
      const results = await browser.a11yAudit({ ignore: ['document-title'] });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].auditId, 'html-has-lang');
    });

    it('can audit the accessibility issues with ignore function', async () => {
      const results = await browser.a11yAudit({
        ignore: violation =>
          ['document-title', 'html-has-lang'].includes(violation.id),
      });
      assert.strictEqual(results.length, 0);
    });
  });
});
