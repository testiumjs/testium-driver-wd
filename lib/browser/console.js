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
const _ = require('lodash');

const logMap = {
  SEVERE: 'error',
  WARNING: 'warn',
  INFO: 'log',
  DEBUG: 'debug',
};

function convertLogType(log) {
  if (log.level) {
    log.type = logMap[log.level];
    delete log.level;
  }
  return log;
}

function parseLogs(logs) {
  return _.map(logs, convertLogType);
}

function filterLogs(logs, type) {
  if (!type) {
    return { matched: logs };
  }
  return _.groupBy(logs, function byMatched(log) {
    return log.type === type ? 'matched' : 'rest';
  });
}

const TYPES = ['error', 'warn', 'log', 'debug'];

let cachedLogs = [];

exports.getConsoleLogs = function getConsoleLogs(type) {
  if (type) {
    assert.include(type, TYPES);
  }

  function processLogs(newLogs) {
    const logs = cachedLogs.concat(newLogs);
    const filtered = filterLogs(logs, type);

    cachedLogs = filtered.rest || [];
    return filtered.matched || [];
  }

  return this.log('browser')
    .then(parseLogs)
    .then(processLogs);
};
