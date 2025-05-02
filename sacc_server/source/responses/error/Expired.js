require('dotenv');
const EcomException = require('./EcomException');

function Expired (message) {
  return {
    status: 498,
    type: "failure",
    message: message || process.env.EXPIRED,
  };
}

Expired.prototype = new EcomException();

module.exports = {
  code: 498,
  json: Expired,
};