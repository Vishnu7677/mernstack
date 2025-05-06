require('dotenv');
const EcomException = require('./EcomException');

function AlreadyExist(message) {
  return {
    status: 409,
    type: "failure",
    message: message || process.env.TOOMUCH,
  };
}

AlreadyExist.prototype = new EcomException();

module.exports = {
  code: 409,
  json: AlreadyExist,
};