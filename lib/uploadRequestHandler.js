const { createWriteStream } = require('fs');

const handler = (req, res) => {
  const streamWriteBuffer = createWriteStream('./buffer', { flags: 'a' });
  req.pipe(streamWriteBuffer);

  streamWriteBuffer.on('error', (error) => {
    console.log(error);
  });

  streamWriteBuffer.on('finish', () => {
    res.end();
  });
};

module.exports = handler;
