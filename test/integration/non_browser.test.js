import {get} from 'http';

import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('Non-browser test', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  it('can make a request without using the browser', done => {
    const url = `${browser.appUrl}/echo`;
    get(url, response => {
      assert.equal(200, response.statusCode);
      done();
    }).on('error', done);
  });
});
