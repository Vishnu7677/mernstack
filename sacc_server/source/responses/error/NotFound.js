require('dotenv');
const EcomException = require('./EcomException');

function NotFoundException (message) {
  return {
    status: 404,
    type: "failure",
    message: message || process.env.MISSING,
  };
}

NotFoundException.prototype = new EcomException();

module.exports = {
  code: 400,
  json: NotFoundException,
};