require('dotenv');
const EcomException = require('./EcomException');

function LimitExceededException (message) {
  return {
    status: 429,
    type: "failure",
    message: message || process.env.TOOMUCH,
  };
}

LimitExceededException.prototype = new EcomException();

module.exports = {
  code: 429,
  json: LimitExceededException,
};