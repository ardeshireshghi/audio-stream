const http = require('http');
const { getRouteByUrl } = require('./router');

const PORT = process.env.PORT || 9999;

function createServer() {
  const server = http.createServer(async (req, res) =>
    getRouteByUrl(req.url)(req, res)
  );

  return {
    start() {
      server.listen(PORT, '0.0.0.0', () => {
        console.log('Server started! Listening to port', PORT);
      });
    }
  };
}

module.exports = createServer;
