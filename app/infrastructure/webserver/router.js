const path = require('path');
const { createReadStream, createWriteStream } = require('fs');

const { withBasicAuth } = require('./middlewares/basicAuth');
const createPersistWorker = require('../../../lib/media-persist-worker/worker');
const streamReqHandler = require('../../../lib/streamRequestHandler');
const uploadReqHandler = require('../../../lib/uploadRequestHandler');
const createTracksController = require('../../interface-adapters/controllers/tracksController');
const {
  default: services
} = require('../../../dist/app/infrastructure/services');

const tracksController = createTracksController(services.trackService);

const staticAssetsPath = path.resolve(__dirname + '/../../../static');
const metadataCache = [];

const listenReqHandler = (_, res) => {
  res.setHeader('content-type', 'text/html');
  createReadStream(`${staticAssetsPath}/listen.html`).pipe(res);
};

const recordReqHandler = withBasicAuth((_, res) => {
  // Show record page
  res.setHeader('content-type', 'text/html');
  createReadStream(`${staticAssetsPath}/index.html`).pipe(res);
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

const getRouteByUrl = (url) => {
  // TODO: Move handlers to controllers
  if (url.includes('/upload')) {
    return uploadReqHandler;
  } else if (url.startsWith('/stream')) {
    return streamReqHandler;
  } else if (url.startsWith('/listen') || url === '/') {
    return listenReqHandler;
  } else if (url.startsWith('/record')) {
    return recordReqHandler;
  } else if (url.startsWith('/static')) {
    return staticAssetsHandler;
  } else if (url.startsWith('/metadata')) {
    return metadataReqHandler;
  } else if (url.startsWith('/store')) {
    return storeFileReqHandler;
  } else if (url.startsWith('/tracks')) {
    return tracksController;
  }
};

exports.default = getRouteByUrl;
