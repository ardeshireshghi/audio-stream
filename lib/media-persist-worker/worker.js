const { isMainThread, parentPort, workerData } = require('worker_threads');

const { createReadStream } = require('fs');
const { default: services } = require('../../dist/app/infrastructure/services');

function persistMedia(pathToMediaFile) {
  // Upload to S3
  console.log('Uploading to S3', pathToMediaFile);

  const mediaFileName = pathToMediaFile.split('/').pop();
  const mediaFile = {
    name: mediaFileName,
    data: createReadStream(pathToMediaFile)
  };

  return services.blobStoreClient.uploadFile(mediaFile);
}

// Worker code: Persist to S3 if bucket is defined
if (!isMainThread && process.env.MEDIA_PERSIST_S3_BUCKET_NAME) {
  if (workerData) {
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
  } else {
    parentPort.on('message', (message) => {
      persistMedia(message.pathToMediaFile)
        .then(() => {
          // Send a message to the main thread.
          parentPort.postMessage(
            `${message.pathToMediaFile} uploaded succussfully`
          );
        })
        .catch((err) => {
          parentPort.postMessage(`Error uploading file ${err}`);
        });
    });
  }
}
