'use strict';

var http = require('http');

http.createServer(function(req, res) {
  res.end('<html><head><title>ok</title></head><body></body></html>');
}).listen(process.env.PORT || 3000);
