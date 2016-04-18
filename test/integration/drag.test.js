import { browser } from '../mini-testium-mocha';
import assert from 'assertive';
import { pick } from 'lodash';

describe('draggable element', () => {
  before(browser.beforeHook);

  before(() => browser.navigateTo('/draggable.html').assertStatusCode(200));

  it('is moved', async () => {
    const box = await browser.getElement('#box');
    const boxLoc =
      () => box.getLocationInView().then(loc => pick(loc, 'x', 'y'));

    await assert.deepEqual({ x: 0, y: 0 }, boxLoc());

    await box.moveTo(20, 20)
             .buttonDown()
             .moveTo(100, 100)
             .buttonUp();

    await assert.deepEqual({ x: 80, y: 80 }, boxLoc());
  });
});
