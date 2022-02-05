const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

function persistMedia(pathToMediaFile) {
  // Upload to S3
  console.log('Uploading to S3', pathToMediaFile);
}

async function createWorker(data) {
  if (isMainThread) {
    // This code is executed in the main thread and not in the worker.

    // Create the worker.
    const worker = new Worker(__filename, { workerData: data });

    return worker;
  }
}

// Worker code
if (!isMainThread) {
  persistMedia(workerData.pathToMediaFile);

  // Send a message to the main thread.
  parentPort.postMessage(`${workerData.pathToMediaFile} uploaded succussfully`);
}

module.exports = createWorker;
