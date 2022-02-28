const { isMainThread, parentPort } = require('worker_threads');

function calc(max) {
  let j = 0;
  for (var i = 0; i < max; i++) {
    j += i;
  }

  return j;
}

if (!isMainThread) {
  parentPort.on('message', (message) => {
    parentPort.postMessage(calc(message.data));
  });
}
