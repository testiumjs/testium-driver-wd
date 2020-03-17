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
const isEmpty = require('lodash/isEmpty');
const merge = require('lodash/merge');
const clone = require('lodash/clone');

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

const defaultCategoryConfig = {
  performance: {
    settings: {
      skipAudits: ['final-screenshot', 'is-on-https', 'screenshot-thumbnails'],
    },
  },
};

const defaultFlags = {
  chromeFlags: [
    '--disable-gpu',
    '--headless',
    '--disable-storage-reset',
    '--enable-logging',
    '--disable-device-emulation',
  ],
};

/**
 *
 * @param config
 * @return {Object}
 */
function getAccessibilityConfig(config) {
  if (!config) {
    config = clone(defaultConfig);
    config.settings.onlyCategories.push('accessibility');
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

  const audits = results.lhr.audits;
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
      if (details && !isEmpty(details.items)) {
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
     * @return {boolean}
     */
    isSuccess(cutoff) {
      return score >= cutoff;
    },
    /**
     * @param {string} type
     * @return {Record<string, auditInfo>}
     */
    success(type) {
      return type ? successObj[type] : successObj;
    },
    /**
     * @param {string} type
     * @return {Record<string, any>}
     */
    errors(type) {
      return type ? errorsObj[type] : errorsObj;
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
 * @param {number} expectedScore
 * @param {Object} flags
 * @param {Object} config
 * @return {Promise<any>}
 */
function assertLighthouseScore(expectedScore, flags, config) {
  expectedScore = expectedScore || 100;

  return this.getLighthouseData(flags, getAccessibilityConfig(config)).then(
    res => {
      const results = parseLhResult(res);
      assert.expect(
        results.isSuccess(expectedScore),
        `Accessibility Score ${results.score} to be greater than ${expectedScore}`
      );
    }
  );
}
exports.assertLighthouseScore = assertLighthouseScore;

/**
 *
 * @param {string|Array<string>} categories - LH categories: 'performance', 'accessibility', 'best-practices', 'seo', 'pwa'
 * @param {Object=} lhConfig - Custom Lighthouse config
 */
function runLHCategories(categories = [], lhConfig = {}) {
  categories = Array.isArray(categories) ? categories : [categories];
  let config = clone(defaultConfig);

  const categoryConfigs = categories.reduce((acc, category) => {
    config.settings.onlyCategories.push(category.toLowerCase());
    const categoryConfig = defaultCategoryConfig[category];

    return { ...acc, categoryConfig };
  }, {});

  config = merge(config, categoryConfigs, lhConfig);

  return this.getLighthouseData(defaultFlags, config).then(parseLhResult);
}
exports.runLHCategories = runLHCategories;

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
    getAccessibilityConfig(config)
  );

  return result.artifacts.Accessibility.violations
    .filter(violationsFilter)
    .map(violation => {
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
