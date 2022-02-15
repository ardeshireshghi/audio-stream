const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

const { createReadStream } = require('fs');

const {
  default: createBlobStoreClient,
  BlobStoreTypes
} = require('../../dist/lib/blob-store/src/BlobStoreClient');

let s3Client;

function persistMedia(pathToMediaFile) {
  // Upload to S3
  console.log('Uploading to S3', pathToMediaFile);
  s3Client =
    s3Client ??
    createBlobStoreClient(
      BlobStoreTypes.S3,
      process.env.MEDIA_PERSIST_S3_BUCKET_NAME,
      'audio-stream-files/'
    );
  const mediaFileName = pathToMediaFile.split('/').pop();
  const mediaFile = {
    name: mediaFileName,
    data: createReadStream(pathToMediaFile)
  };

  return s3Client.uploadFile(mediaFile);
}

async function createWorker(data) {
  if (isMainThread) {
    // This code is executed in the main thread and not in the worker.

    // Create the worker.
    const worker = new Worker(__filename, { workerData: data });

    return worker;
  }
}

// Worker code: Persist to S3 if bucket is defined
if (!isMainThread && process.env.MEDIA_PERSIST_S3_BUCKET_NAME) {
  persistMedia(workerData.pathToMediaFile)
    .then(() => {
      // Send a message to the main thread.
      parentPort.postMessage(
        `${workerData.pathToMediaFile} uploaded succussfully`
      );
    })
    .catch((err) => {
      parentPort.postMessage(`Error uploading file ${err}`);
    });
}

module.exports = createWorker;
