import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('page data', () => {
  before(browser.beforeHook);

  before(() => browser.navigateTo('/'));

  it('title', async () =>
    assert.equal('Test Title', await browser.getPageTitle()));

  it('source', async () =>
    assert.include('DOCTYPE', await browser.getPageSource()));

  it('size', async () =>
    assert.deepEqual({ height: 768, width: 1024 }, await browser.getPageSize()));

  it('screenshot', async () =>
    assert.truthy(await browser.getScreenshot()));
});
