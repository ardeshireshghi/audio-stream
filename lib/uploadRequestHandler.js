const { createReadStream, createWriteStream } = require('fs');

const handler = (req, res) => {
  const streamWriteBuffer = createWriteStream('./buffer', { flags: 'a' });
  req.pipe(streamWriteBuffer);

  streamWriteBuffer.on('error', (error) => {
    console.log(error);
  });

  res.end();
};

module.exports = handler;
