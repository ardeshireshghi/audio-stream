const { createReadStream } = require('fs');
const fsAsync = require('fs').promises;

const streamAudio = async ({ audioFilePath, range, res }) => {
  const fileStat = await fsAsync.stat(audioFilePath);

  if (!range) {
    res.writeHead(200, {
      'Content-Type': 'audio/ogg',
      'Content-Length': fileStat.size,
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const streamReadBuffer = createReadStream(audioFilePath);
    streamReadBuffer.pipe(res);
    return;
  }

  let [start, end] = range.replace(/bytes=/, '').split('-');
  start = parseInt(start, 10);
  end = end ? parseInt(end, 10) : fileStat.size - 1;

  if (!isNaN(start) && isNaN(end)) {
    start = start;
    end = fileStat.size - 1;
  }
  if (isNaN(start) && !isNaN(end)) {
    start = fileStat.size - end;
    end = fileStat.size - 1;
  }

  // Handle unavailable range request
  if (start >= fileStat.size || end >= fileStat.size) {
    // Return the 416 Range Not Satisfiable.
    res.writeHead(416, {
      'Content-Range': `bytes */${fileStat.size}`,
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    return res.end();
  }

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'audio/ogg',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  const streamReadBuffer = createReadStream(audioFilePath, {
    start: start,
    end: end
  });
  streamReadBuffer.pipe(res);
};

module.exports = streamAudio;
