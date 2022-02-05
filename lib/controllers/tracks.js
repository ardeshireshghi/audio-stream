const { readdir, stat, access, F_OK } = require('fs').promises;
const streamAudio = require('../audio-streamer/streamAudio');

const findAndStreamTrack = async (req, res, trackName) => {
  try {
    await access(`./media/${trackName}`, F_OK);
  } catch (err) {
    res.statusCode = 404;
    res.end();
  }
  await streamAudio({
    audioFilePath: `./media/${trackName}`,
    res,
    range: req.headers.range
  });
};

const findAll = async (_, res) => {
  const trackFiles = await readdir('./media');
  res.setHeader('content-type', 'application/json');

  const tracks = await Promise.all(
    trackFiles
      .filter((file) => file.endsWith('.ogg'))
      .map(async (file) => {
        const { ctime: createdAt } = await stat(`./media/${file}`);
        return {
          name: file,
          createdAt
        };
      })
  );

  res.end(
    JSON.stringify({
      tracks
    })
  );
};

const tracksController = async (req, res) => {
  let reqUrlSegments = req.url.split('/');
  reqUrlSegments = reqUrlSegments.filter(Boolean);

  const trackName = reqUrlSegments.length > 1 ? reqUrlSegments[1] : undefined;

  if (!trackName) {
    await findAll(res, res);
  } else {
    await findAndStreamTrack(req, res, trackName);
  }
};

module.exports = tracksController;
