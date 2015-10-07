'use strict';

import {test} from 'babel-tap';
import initTestium from 'testium-core';

import createDriver from '../../..';

test('Load example page', async t => {
  const { browser } = await initTestium().then(createDriver);

  await browser.navigateTo('/ok');
  t.equal(await browser.title(), 'ok', 'has the correct title');
});
