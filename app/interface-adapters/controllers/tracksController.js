function createTracksController(trackService) {
  const findAndStreamTrack = async (req, res, trackName) => {
    await trackService.findAndStream(trackName, res, req.headers.range);
  };

  const findAll = async (_, res) => {
    const tracks = await trackService.findAll();
    res.setHeader('content-type', 'application/json');

    res.end(
      JSON.stringify({
        tracks: tracks ?? []
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

  return tracksController;
}

module.exports = createTracksController;
