const {
  createReadStream,
  createWriteStream,
  openSync,
  closeSync
} = require('fs');
const http = require('http');

const { withBasicAuth } = require('./lib/middlewares/basicAuth');

const createPersistWorker = require('./lib/media-persist-worker/worker');
const streamReqHandler = require('./lib/streamRequestHandler');
const uploadReqHandler = require('./lib/uploadRequestHandler');
const tracksController = require('./lib/controllers/tracks');

const PORT = process.env.PORT || 9999;
const metadataCache = [];

const listenReqHandler = (_, res) => {
  res.setHeader('content-type', 'text/html');
  createReadStream('./static/listen.html').pipe(res);
};

const recordReqHandler = withBasicAuth((_, res) => {
  // Show record page
  res.setHeader('content-type', 'text/html');
  createReadStream('./static/index.html').pipe(res);
});

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
    const pathToMediaFile = `./media/${trackName}`;
    const trackWriter = createWriteStream(pathToMediaFile);

    trackWriter.on('error', (err) => {
      console.error('Error writing the track to file', err);
      trackMetadata && metadataCache.push(trackMetadata);
    });

    trackWriter.on('finish', async () => {
      console.log('Finished creating track on local volume, persisting now');
      const mediaPersistWorker = await createPersistWorker({
        pathToMediaFile
      });

      mediaPersistWorker.on('error', (err) => {
        console.log('Worker job failed', err);
      });
      mediaPersistWorker.on('exit', () => {
        console.log('Worker job is finished');
      });

      // Listen for messages from the worker and print them.
      mediaPersistWorker.on('message', (msg) => {
        console.log('Received message from worker', msg);
      });
    });

    req.pipe(trackWriter);

    trackWriter.on('error', () => {
      res.end();
    });

    trackWriter.on('finish', () => {
      res.end();
    });
  } catch (err) {
    trackMetadata && metadataCache.push(trackMetadata);
  }
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
