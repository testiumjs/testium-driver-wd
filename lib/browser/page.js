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

function extractWidthHeight(dimensions) {
  const { width, height } = dimensions;
  return { width, height };
}

/**
 * @param {{width?: number, height?: number}} size
 * @returns {Promise<void>}
 *
 * @example browser.setPageSize({ width: 1400, height: 800 })
 * @example browser.setPageSize({ width: 1400 })
 * @example browser.setPageSize({ height: 800 })
 */
async function setPageSize(size) {
  const fallback = await this.getPageSize();
  return this.setWindowSize(
    size.width || fallback.width,
    size.height || fallback.height
  );
}

/**
 * @returns {Promise<{width: number, height: number}>}
 *
 * @example browser.getPageSize()
 */
function getPageSize() {
  return this.getWindowSize().then(extractWidthHeight);
}

/**
 * @returns {Promise<string>}
 *
 * @example browser.getPageTitle()
 */
function getPageTitle() {
  return this.title();
}

/**
 * @returns {Promise<string>}
 *
 * @example browser.getPageSource()
 */
function getPageSource() {
  return this.source();
}

/**
 * @returns {Promise<string>}
 *
 * @example browser.getScreenshot()
 */
function getScreenshot() {
  return this.takeScreenshot();
}

module.exports = {
  getScreenshot,
  getPageSource,
  getPageTitle,
  getPageSize,
  setPageSize,
};
