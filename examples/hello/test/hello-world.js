'use strict';

var tap = require('tap');

var initTestium = require('testium-core');
var createDriver = require('../../..');

function asyncTest(title, fn) {
  tap.test(title, t => {
    new Promise(resolve => resolve(fn(t)))
      .then(() => t.end(), error => {
        t.error(error);
        t.end();
      });
  });
}

asyncTest('Load example page', async t => {
  const { browser } = await initTestium().then(createDriver);

  await browser.navigateTo('/ok');
  t.equal(await browser.title(), 'ok', 'has the correct title');
});
