'use strict';

var assert = require('assertive');
var _ = require('lodash');

var logMap = {
  'SEVERE': 'error',
  'WARNING': 'warn',
  'INFO': 'log',
  'DEBUG': 'debug',
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

var TYPES = [
  'error',
  'warn',
  'log',
  'debug',
];

var cachedLogs = [];

exports.getConsoleLogs = function getConsoleLogs(type) {
  if (type) {
    assert.include(type, TYPES);
  }

  function processLogs(newLogs) {
    var logs = cachedLogs.concat(newLogs);
    var filtered = filterLogs(logs, type);

    cachedLogs = filtered.rest || [];
    return filtered.matched || [];
  }

  return this.log('browser')
    .then(parseLogs)
    .then(processLogs);
};
