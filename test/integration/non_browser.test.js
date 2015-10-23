import {get} from 'http';

import {browser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('Non-browser test', () => {
  before(browser.beforeHook);

  it('can make a request without using the browser', done => {
    const url = `${browser.appUrl}/echo`;
    get(url, response => {
      assert.equal(200, response.statusCode);
      done();
    }).on('error', done);
  });
});
