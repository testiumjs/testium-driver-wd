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

const Gofer = require('gofer');
const puppeteer = require('puppeteer-core');

let puppeteerBrowserSingleton;

/**
 *
 * @param {string} devtoolsPort
 * @return {Promise<puppeteer.Browser>}
 */
async function ensurePuppeteerBrowser(devtoolsPort) {
  if (!puppeteerBrowserSingleton) {
    const browserInfo = await Gofer.fetch(
      `http://127.0.0.1:${devtoolsPort}/json/version`
    ).json();
    puppeteerBrowserSingleton = await puppeteer.connect({
      browserWSEndpoint: browserInfo.webSocketDebuggerUrl,
    });
  }
  return puppeteerBrowserSingleton;
}

let puppeteerPageSingleton;

/**
 *
 * @param {{getChromeDevtoolsPort: function}} testium
 * @return {Promise<puppeteer.Page>}
 */
async function ensurePuppeteerPage(testium) {
  if (!puppeteerPageSingleton) {
    const port = testium.getChromeDevtoolsPort();
    const puppeteerBrowser = await ensurePuppeteerBrowser(port);
    const pages = await puppeteerBrowser.pages();
    // We'll guess and just take the first page.
    // In *theory* testiumRootWindow should be CDwindow-${targetId}. E.g.:
    // const windowHandle = testiumRootWindow.replace(/^CDwindow-/, '');
    // const targetId = pages[0].target()['_targetInfo'].targetId;
    // console.log({
    //   windowHandle,
    //   targetId,
    //   matches: windowHandle === targetId,
    // });
    puppeteerPageSingleton = pages[0];
  }
  return puppeteerPageSingleton;
}

/**
 *
 * @param {string} deviceDescriptor
 * @return {Object}
 */
function getDevice(deviceDescriptor) {
  return puppeteer.devices[deviceDescriptor];
}

module.exports = { ensurePuppeteerPage, getDevice };
