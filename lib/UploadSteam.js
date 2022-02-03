const { Duplex } = require('stream');

class UploadStream extends Duplex {
  /*
   * Class constructor will receive the injections as parameters.
   */
  constructor() {
    super();
  }

  _read() {}

  // Writes the data, push and set the delay/timeout
  _write(chunk, encoding, callback) {
    console.log(chunk);
    this.push(chunk);
    callback();
  }

  // When all the data is done passing, it stops.
  _final() {
    this.push(null);
  }
}

module.exports = UploadStream;
