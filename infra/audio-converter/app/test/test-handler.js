const { handler } = require('..');

(async () => {
  const event = {
    Records: [{ s3: { object: { key: 'audio-stream-files/test-bucket.ogg' } } }]
  };

  await handler(event);
})();
