const {
  createReadStream,
  createWriteStream,
  openSync,
  closeSync
} = require('fs');

const http = require('http');
const streamReqHandler = require('./lib/streamRequestHandler');
const uploadReqHandler = require('./lib/uploadRequestHandler');
const tracksController = require('./lib/controllers/tracks');

const PORT = process.env.PORT || 9999;
const metadataCache = [];

const listenReqHandler = (_, res) => {
  res.setHeader('content-type', 'text/html');
  createReadStream('./static/listen.html').pipe(res);
};

const recordReqHandler = (_, res) => {
  res.setHeader('content-type', 'text/html');
  createReadStream('./static/index.html').pipe(res);
};

const staticAssetsHandler = (req, res) => {
  createReadStream(`.${req.url}`).pipe(res);
};

const metadataReqHandler = (req, res) => {
  req.on('data', (chunk) => {
    metadataCache.push(JSON.parse(chunk));
  });

  req.on('end', () => {
    res.end();
  });
};

const storeFileReqHandler = (req, res) => {
  const trackMetadata = metadataCache.shift();

  try {
    const trackName = trackMetadata
      ? `${trackMetadata.trackName.replace(/\s/g, '-')}.ogg`
      : `unnamed-track-${Date.now()}.ogg`;

    const trackWriter = createWriteStream(`./media/${trackName}`);

    trackWriter.on('error', (err) => {
      console.error('Error writing the track to file', err);
      trackMetadata && metadataCache.push(trackMetadata);
    });

    req.pipe(trackWriter);
  } catch (err) {
    trackMetadata && metadataCache.push(trackMetadata);
  }

  res.end();
};

const router = (req) => {
  if (req.url.includes('/upload')) {
    return uploadReqHandler;
  } else if (req.url.startsWith('/stream')) {
    return streamReqHandler;
  } else if (req.url.startsWith('/listen') || req.url === '/') {
    return listenReqHandler;
  } else if (req.url.startsWith('/record')) {
    return recordReqHandler;
  } else if (req.url.startsWith('/static')) {
    return staticAssetsHandler;
  } else if (req.url.startsWith('/metadata')) {
    return metadataReqHandler;
  } else if (req.url.startsWith('/store')) {
    return storeFileReqHandler;
  } else if (req.url.startsWith('/tracks') && req.method === 'GET') {
    return tracksController;
  }
};

const server = http.createServer(async (req, res) => {
  const routeHandler = router(req, res);

  if (routeHandler) {
    await routeHandler(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

// Clear and recreate buffer
try {
  console.log('Deleting and recreating buffer file');
  closeSync(openSync('./buffer', 'w'));
} catch (err) {
  console.log('Error:', err);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server started! Listening to port', PORT);
});
