'use strict';

var assert = require('assertive');
var _ = require('lodash');

exports.evaluate = function evaluate() {
  var args = _.toArray(arguments);
  var clientFunction = args.pop();

  var invocation = 'evaluate(clientFunction) - requires (Function|String) clientFunction';
  assert.truthy(invocation, clientFunction);

  switch (typeof clientFunction) {
  case 'function':
    clientFunction =
      'return (' + clientFunction + ').apply(this, ' + JSON.stringify(args) + ');';
    /* falls through */
  case 'string':
    return this.execute(clientFunction);

  default:
    throw new Error(invocation);
  }
};
