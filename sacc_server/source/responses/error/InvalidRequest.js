require('dotenv');
const EcomException = require('./EcomException');

function InvalidRequestException (message) {
  return {
    status: 400,
    type: "failure",
    message: message || process.env.INVALID,
  };
}

InvalidRequestException.prototype = new EcomException();

module.exports = {
  code: 400,
  json: InvalidRequestException,
};