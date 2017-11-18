'use strict';

exports.mixedInBaseMethod = function mixedInBaseMethod(numbers) {
  return this.safeEval(numbers.join(' + '));
};

exports.mixedInMethod = function mixedInMethod() {
  return this.mixedInBaseMethod([1, 2, 3, 4]);
};
