// This is a minimal version of `testium-mocha`.
// We're trying to avoid cyclic dependencies.
import {getTestium} from 'testium-core';

import createDriver from '../';

export let browser = {};

browser.beforeHook = async () => {
  const testium = await getTestium({ driver: createDriver });
  browser = testium.browser;
};

after(() => browser && browser.quit && browser.quit());
