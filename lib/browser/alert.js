'use strict';

exports.getAlertText = function getAlertText() {
  return this.alertText();
};

exports.typeAlert = function typeAlert(text) {
  return this.alertKeys(text);
};
