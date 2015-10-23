'use strict';

exports.setPageSize = function setPageSize(size) {
  return this.setWindowSize(size.width, size.height);
};

exports.getPageSize = function getPageSize() {
  return this.getWindowSize();
};

exports.getPageTitle = function getPageTitle() {
  return this.title();
};

exports.getPageSource = function getPageSource() {
  return this.source();
};

exports.getScreenshot = function getScreenshot() {
  return this.takeScreenshot();
};
