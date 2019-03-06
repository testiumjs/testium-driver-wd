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

const assert = require('assertive');
const isEmpty = require('lodash/isEmpty');
const merge = require('lodash/merge');
const cloneDeep = require('lodash/cloneDeep');

function getTotalScore(success, failure) {
  const successCount = Object.keys(success).length;
  const errorCount = Object.keys(failure).length;

  return (successCount * 100) / (successCount + errorCount);
}

const defaultConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: [],
    throttlingMethod: 'simulate',
  },
};

const categoryConfig = {
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
    config = cloneDeep(defaultConfig);
    config.settings.onlyCategories.push('accessibility');
  }

  return config;
}

const parseLhResult = function(results) {
  if (!results || !results.lhr || !results.lhr.audits) {
    throw new Error(`Error fetching lighthouse audit results`);
  }

  const audits = results.lhr.audits;
  const errorsObj = {};
  const notApplicableObj = {};
  const successObj = {};

  for (const key in audits) {
    const audit = audits[key];
    const description = audit.description;
    const details = audit.details;
    const id = audit.id;
    const score = audit.score;
    const scoreDisplayMode = audit.scoreDisplayMode;

    const auditInfo = { description, details };

    if (score) {
      successObj[id] = auditInfo;
    } else if (
      scoreDisplayMode === 'not-applicable' ||
      scoreDisplayMode === 'notApplicable'
    ) {
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
  }

  const score = getTotalScore(successObj, errorsObj);

  return {
    audits,
    score,
    isSuccess(cutoff) {
      return score >= cutoff;
    },
    success(type) {
      return type ? successObj[type] : successObj;
    },
    errors(type) {
      return type ? errorsObj[type] : errorsObj;
    },
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
};

exports.assertLighthouseScore = function assertLighthouseScore(
  score,
  flags,
  config
) {
  const assertScore = function aScore(res) {
    assert.expect(parseLhResult(res).isSuccess(score));
  };

  return this.getLighthouseData(flags, getAccessibilityConfig(config)).then(
    assertScore
  );
};

/**
 *
 * @param {string|Array<string>} categories - LH categories: 'performance', 'accessibility', 'best-practices', 'seo', 'pwa'
 * @param {Object=} lhConfig - Custom Lighthouse config
 */
exports.runLighthouse = function runLighthouse(categories = [], lhConfig = {}) {
  categories = !Array.isArray(categories) ? [categories] : categories;
  let config = cloneDeep(defaultConfig);

  categories.forEach(category => {
    config.settings.onlyCategories.push(category.toLowerCase());
    const catConfig = categoryConfig[category];
    if (catConfig) {
      config = merge(config, catConfig);
    }
  });

  config = merge(config, lhConfig);

  return this.getLighthouseData(defaultFlags, config).then(parseLhResult);
};

/**
 *
 * @param {?Object}flags
 * @param {?Object} lhConfig
 */
exports.runLighthouseAudit = function runLighthouseAudit(flags, lhConfig) {
  return this.getLighthouseData(flags, lhConfig).then(parseLhResult);
};

/**
 *
 * @param {?Object}flags
 * @param {?Object} lhConfig
 */
exports.runLighthouseA11y = function runLHAccessibilityAudit(flags, lhConfig) {
  return this.getLighthouseData(
    flags || defaultFlags,
    getAccessibilityConfig(lhConfig)
  ).then(parseLhResult);
};
