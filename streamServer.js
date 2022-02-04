const { createReadStream, openSync, closeSync } = require('fs');
const http = require('http');

const streamReqHandler = require('./lib/streamRequestHandler');
const uploadReqHandler = require('./lib/uploadRequestHandler');

const server = http.createServer(async (req, res) => {
  if (req.url.includes('/upload')) {
    uploadReqHandler(req, res);
  } else if (req.url.includes('/stream')) {
    await streamReqHandler(req, res);
  } else if (req.url.includes('/listen')) {
    res.setHeader('content-type', 'text/html');
    createReadStream('./static/listen.html').pipe(res);
  } else if (req.url === '/') {
    res.setHeader('content-type', 'text/html');
    createReadStream('./static/index.html').pipe(res);
  } else if (req.url.startsWith('/static')) {
    createReadStream(`.${req.url}`).pipe(res);
  }
});

// Clear and recreate buffer
try {
  console.log('Deleting and recreating buffer file');
  closeSync(openSync('./buffer', 'w'));
} catch (err) {
  console.log('Error:', err);
}

server.listen(9999, '0.0.0.0', () => {
  console.log('Server started! Listening to port 9999');
});
