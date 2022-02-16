const http = require('http');
const { default: getRouteByUrl } = require('./router');

const PORT = process.env.PORT || 9999;

function createServer() {
  const server = http.createServer(async (req, res) => {
    const routeHandler = getRouteByUrl(req, res);

    if (routeHandler) {
      await routeHandler(req, res);
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  return {
    start() {
      server.listen(PORT, '0.0.0.0', () => {
        console.log('Server started! Listening to port', PORT);
      });
    }
  };
}

module.exports = createServer;
