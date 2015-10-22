import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('screenshots', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  describe('taking', () => {
    let screenshot;
    before(() => {
      browser.navigateTo('/');
      browser.assert.httpStatus(200);
      screenshot = browser.getScreenshot();
    });

    it('captures the page', () =>
      assert.expect(screenshot.length > 0));
  });
});
