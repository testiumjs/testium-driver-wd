/*
 * Copyright (c) 2015, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const assert = require('assert');
const flatMap = require('array.prototype.flatmap');

flatMap.shim(); // TODO: remove with node 12

/**
 * @typedef import('lighthouse/types/lhr') LH
 */

const defaultConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: [],
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

/**
 * @param {string} type
 * @param {Array<string>} [skipAudits]
 * @return {Object}
 */
function getConfigByType(type, skipAudits) {
  const config = JSON.parse(JSON.stringify(defaultConfig));
  if (type) {
    config.settings.onlyCategories.push(type);
    if (Array.isArray(skipAudits) && skipAudits.length) {
      config.settings = { ...config.settings, skipAudits };
    }
  }
  return config;
}

/**
 *
 * @param {Record<string, any>} success
 * @param {Record<string, any>} failure
 * @return {number}
 */
function getTotalScore(success, failure) {
  const successCount = Object.keys(success).length;
  const errorCount = Object.keys(failure).length;

  if (successCount + errorCount === 0) {
    return 0;
  }
  return (successCount * 100) / (successCount + errorCount);
}

/**
 *
 * @param {LH.Result} results
 * @return {{score: number, errorString(): string, success(string): Record<string, auditInfo>, audits: LH.Result.audits, errors(string): Record<string, any>, isSuccess(number): boolean}}
 */
function parseLhResult(results) {
  if (!results || !results.lhr || !results.lhr.audits) {
    throw new Error(`Error fetching lighthouse audit results`);
  }

  const { audits } = results.lhr;
  const errorsObj = {};
  const notApplicableObj = {};
  const successObj = {};

  /**
   *
   * @typedef {{description: LH.Audit.Result.description, details: LH.Audit.Result.details}} auditInfo
   */

  Object.values(audits).forEach(audit => {
    const { id, description, details, score, scoreDisplayMode } = audit;

    /**
     *
     * @type {auditInfo}
     */
    const auditInfo = { description, details };

    if (score) {
      successObj[id] = auditInfo;
    } else if (scoreDisplayMode === 'notApplicable') {
      notApplicableObj[id] = auditInfo;
    } else if (scoreDisplayMode !== 'manual') {
      const snippets = [];
      if (details && details.items.length) {
        details.items.forEach(item =>
          snippets.push((item.node && item.node.snippet) || '')
        );
      }

      errorsObj[id] = { description, snippets };
    }
  });

  const score = getTotalScore(successObj, errorsObj);

  return {
    audits,
    score,
    /**
     * @param {number} cutoff
     */
    isSuccess(cutoff) {
      assert.ok(
        score >= cutoff,
        `Score ${score} is smaller than expected cutoff score ${cutoff}`
      );
    },
    /**
     * @param {string} audit
     * @return {Record<string, auditInfo>}
     */
    success(audit) {
      return audit ? successObj[audit] : successObj;
    },
    /**
     * @param {string} audit
     * @return {Record<string, any>}
     */
    errors(audit) {
      return audit ? errorsObj[audit] : errorsObj;
    },
    /**
     * @return {string}
     */
    errorString() {
      const errorList = [];

      for (const id in errorsObj) {
        const description = errorsObj[id].description;
        const snippets = errorsObj[id].snippets;
        errorList.push(`${description}:\n\t${snippets.join('\n\t')}`);
      }

      return errorList.join('\n\n');
    },
  };
}

/**
 *
 * @param {string} category
 * @param {number} minScore
 * @param {Array<string>} [skipAudits]
 * @return {Promise<any>}
 */
function assertScoreByCategory(category, minScore, skipAudits = []) {
  minScore = minScore || 100;

  category = category.toLowerCase();

  const config = getConfigByType(category, skipAudits);

  return this.runLighthouseAudit(defaultFlags, config).then(results => {
    assert.ok(
      results.score >= minScore,
      `${category} score ${results.score} to be greater than ${minScore}`
    );
    return results;
  });
}

exports.assertScoreByCategory = assertScoreByCategory;

/**
 *
 * @param {number} minScore
 * @param {Array<string>} [skipAudits]
 * @return {Promise<any>}
 */
function assertPerformanceScore(minScore, skipAudits = []) {
  return this.assertScoreByCategory('performance', minScore, [
    ...skipAudits,
    'final-screenshot',
    'is-on-https',
    'screenshot-thumbnails',
  ]);
}

exports.assertPerformanceScore = assertPerformanceScore;

/**
 *
 * @param {number} minScore
 * @param {Array<string>} [skipAudits]
 * @return {Promise<any>}
 */
function assertAccessibilityScore(minScore, skipAudits = []) {
  return this.assertScoreByCategory('accessibility', minScore, skipAudits);
}

exports.assertAccessibilityScore = assertAccessibilityScore;

/**
 *
 * @param {number} minScore
 * @param {Array<string>} skipAudits
 * @return {Promise<any>}
 */
function assertBestPracticesScore(minScore, skipAudits = []) {
  return this.assertScoreByCategory('best-practices', minScore, skipAudits);
}

exports.assertBestPracticesScore = assertBestPracticesScore;

/**
 *
 * @param {number} minScore
 * @param {Array<string>} [skipAudits]
 * @return {Promise<any>}
 */
function assertSeoScore(minScore, skipAudits = []) {
  return this.assertScoreByCategory('seo', minScore, skipAudits);
}

exports.assertSeoScore = assertSeoScore;

/**
 *
 * @param {number} minScore
 * @param {Array<string>} [skipAudits]
 * @return {Promise<any>}
 */
function assertPwaScore(minScore, skipAudits = []) {
  return this.assertScoreByCategory('pwa', minScore, skipAudits);
}

exports.assertPwaScore = assertPwaScore;

/**
 *
 * @param {?Object} flags
 * @param {?Object} lhConfig
 * @legacy
 */
function runLighthouseAudit(flags, lhConfig) {
  return this.getLighthouseData(flags, lhConfig).then(parseLhResult);
}

exports.runLighthouseAudit = runLighthouseAudit;

async function a11yAudit(options = {}) {
  const { flags, config, ignore } = options;

  let violationsFilter; // function to filter violations
  if (typeof ignore === 'function') {
    violationsFilter = violation => !ignore(violation);
  } else if (Array.isArray(ignore)) {
    // e.g. ignore: ['html-has-lang']
    violationsFilter = violation => !ignore.includes(violation.id);
  } else {
    violationsFilter = () => true;
  }

  const result = await this.getLighthouseData(
    flags || defaultFlags,
    config || getConfigByType('accessibility')
  );

  return result.artifacts.Accessibility.violations
    .filter(violationsFilter)
    .flatMap(violation => {
      const { nodes, ...violationData } = violation;
      return nodes.map(node => {
        return {
          ...violationData,
          auditId: violationData.id,
          selector: Array.isArray(node.target) ? node.target.join(' ') : '',
          path: node.path,
          snippet: node.snippet,
        };
      });
    });
}

exports.a11yAudit = a11yAudit;
