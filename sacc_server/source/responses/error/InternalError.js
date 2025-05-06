require('dotenv');
const EcomException = require('./EcomException');

function InternalError (message) {
  return {
    status: 500,
    type: "failure",
    message: message || process.env.INTERNAL,
  };
}

InternalError.prototype = new EcomException();

module.exports = {
  code: 500,
  json: InternalError,
};