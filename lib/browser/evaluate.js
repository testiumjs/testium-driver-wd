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
const _ = require('lodash');

exports.evaluate = function evaluate() {
  const args = _.toArray(arguments);
  let clientFunction = args.pop();

  const invocation =
    'evaluate(clientFunction) - requires (Function|String) clientFunction';
  assert.ok(clientFunction, invocation);

  switch (typeof clientFunction) {
    case 'function':
      clientFunction = `return (${clientFunction}).apply(this, ${JSON.stringify(
        args
      )});`;
    /* falls through */
    case 'string':
      return this.execute(clientFunction);

    default:
      throw new Error(invocation);
  }
};

exports.evaluateAsync = function evaluateAsync() {
  const args = _.toArray(arguments);
  let clientFunction = args.pop();

  const invocation =
    'evaluateAsync(clientFunction) - requires (Function) clientFunction';
  assert.ok(clientFunction, invocation);

  if (typeof clientFunction !== 'function') {
    throw new Error(invocation);
  }

  clientFunction = `var args = [].slice.call(arguments), done = args.pop();
    return Promise
      .resolve()
      .then(() => (${clientFunction}).apply(this, args))
      .then(
        value => done({ value }),
        err => done({ reason: err && { message: err.message, stack: err.stack } })
      );`;

  return this.executeAsync(clientFunction, args).then(({ reason, value }) => {
    if (reason) throw Object.assign(new Error(reason.message), reason);
    return value;
  });
};
