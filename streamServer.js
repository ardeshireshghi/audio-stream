const { openSync, closeSync } = require('fs');
const createServer = require('./app/infrastructure/webserver/server');

const server = createServer();

// Clear and recreate buffer
try {
  console.log('Deleting and recreating buffer file');
  closeSync(openSync('./buffer', 'w'));
} catch (err) {
  console.log('Error:', err);
}

server.start();
