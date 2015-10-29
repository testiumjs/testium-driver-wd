'use strict';

exports.switchToFrame = function switchToFrame(id) {
  return this.frame(id);
};

exports.switchToDefaultFrame = function switchToDefaultFrame() {
  return this.frame(null);
};

exports.switchToWindow = function switchToWindow(id) {
  return this.window(id);
};

exports.closeWindow = function closeWindow() {
  return this.close();
};
