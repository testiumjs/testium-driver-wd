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

function getTotalScore(success, failure) {
  const successCount = Object.keys(success).length;
  const errorCount = Object.keys(failure).length;

  return (successCount * 100) / (successCount + errorCount);
}

const lhConfig = {
  passes: [
    {
      passName: 'accessibilityPass',
      gatherers: ['accessibility'],
    },
  ],
  audits: [
    'accessibility/accesskeys',
    'accessibility/aria-allowed-attr',
    'accessibility/aria-required-attr',
    'accessibility/aria-required-children',
    'accessibility/aria-required-parent',
    'accessibility/aria-roles',
    'accessibility/aria-valid-attr-value',
    'accessibility/aria-valid-attr',
    'accessibility/audio-caption',
    'accessibility/button-name',
    'accessibility/bypass',
    'accessibility/color-contrast',
    'accessibility/definition-list',
    'accessibility/dlitem',
    'accessibility/document-title',
    'accessibility/duplicate-id',
    'accessibility/frame-title',
    'accessibility/html-has-lang',
    'accessibility/html-lang-valid',
    'accessibility/image-alt',
    'accessibility/input-image-alt',
    'accessibility/label',
    'accessibility/layout-table',
    'accessibility/link-name',
    'accessibility/list',
    'accessibility/listitem',
    'accessibility/meta-refresh',
    'accessibility/meta-viewport',
    'accessibility/object-alt',
    'accessibility/tabindex',
    'accessibility/td-headers-attr',
    'accessibility/th-has-data-cells',
    'accessibility/valid-lang',
    'accessibility/video-caption',
    'accessibility/video-description',
  ],
};

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
      if (!isEmpty(details.items)) {
        details.items.forEach(item => snippets.push(item.node.snippet || ''));
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
  score = score || 100;
  const assertScore = function aScore(res) {
    const results = parseLhResult(res);
    assert.expect(
      `Accessibility Score ${results.score} to be greater than ${score}`,
      results.isSuccess(score)
    );
  };

  return this.getLighthouseData(flags, config || lhConfig).then(assertScore);
};

exports.runLighthouseAudit = function runLighthouseAudit(flags, config) {
  return this.getLighthouseData(flags, config || lhConfig).then(parseLhResult);
};
