'use strict';

const { createServer } = require('http');

const debug = require('debug')('testium-driver-wd:test:init-driver');

const initDriver = require('..');

describe('initDriver()', () => {
  let seleniumServer;
  let appServer;

  const fakeTestium = {
    config: {
      get(key, def) {
        switch (key) {
          case 'selenium.serverUrl':
            return `http://127.0.0.1:${seleniumServer.address().port}`;
          case 'desiredCapabilities':
            return {};
          case 'app.port':
            return appServer.address().port;
          default:
            if (def) return def;
            throw new Error(`unknown config key ${key}`);
        }
      },
    },
    getInitialUrl: () => '/',
  };

  let seleniumResponses;
  beforeEach(() => {
    seleniumResponses = [
      { value: { sessionId: 'abc' } }, // POST /session
      {}, // GET /session/abc
      {}, // GET /session/abc/window_handle
      { value: { width: 640, height: 480 } }, // GET /session/abc/window/current/size
      {}, // POST /session/abc/window/current/size
      {}, // POST /session/abc/url
    ].map(r => ({ status: 0, ...r }));
  });

  before(done => {
    seleniumServer = createServer((req, res) => {
      debug('seleniumServer', { method: req.method, url: req.url });
      const { delay = 0, ...sRes } = seleniumResponses.shift();
      setTimeout(() => {
        res.statusCode = 200;
        res.end(JSON.stringify(sRes));
      }, delay);
    });
    seleniumServer.listen(done);
  });

  before(done => {
    appServer = createServer((req, res) => {
      debug('appServer', { method: req.method, url: req.url });
      res.statusCode = 200;
      res.end('<body>yay</body>');
    });
    appServer.listen(done);
  });

  after(done => {
    if (seleniumServer) seleniumServer.close(done);
  });

  after(done => {
    if (appServer) appServer.close(done);
  });

  it('runs wd.init() once', async () => {
    await initDriver(fakeTestium);
  });

  it('runs wd.init() twice if needed', async () => {
    seleniumResponses.unshift({ delay: 3000, error: 'blah' });
    await initDriver(fakeTestium);
  });
});
